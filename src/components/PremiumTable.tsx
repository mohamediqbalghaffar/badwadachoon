"use client";

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { Search, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface PremiumTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  renderExpandedRow?: (row: TData) => React.ReactNode;
  exportFilename?: string;
  searchPlaceholder?: string;
}

export function PremiumTable<TData>({ data, columns, renderExpandedRow, exportFilename = 'export', searchPlaceholder = 'گەڕان...' }: PremiumTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'sentDate', desc: true }
  ]);
  const [expanded, setExpanded] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      expanded,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => !!renderExpandedRow,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    }
  });

  const exportToExcel = () => {
    const rows = table.getFilteredRowModel().rows.map(row => row.original);
    const ws = XLSX.utils.json_to_sheet(rows as any);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${exportFilename}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      {/* Top Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800 w-full sm:w-auto justify-center"
          >
            <Download size={16} />
            <span className="hidden sm:inline">دابەزاندن (Export)</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto relative min-h-[400px]">
        <table className="w-full text-sm text-right text-slate-600 dark:text-slate-400 border-collapse">
          <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 sticky top-0 z-10 shadow-sm backdrop-blur-md">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    {header.isPlaceholder ? null : (
                      <div 
                        className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-3 border-b border-slate-50 dark:border-slate-800/50 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {row.getIsExpanded() && renderExpandedRow && (
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                      <td colSpan={row.getVisibleCells().length} className="p-0 border-b border-slate-100 dark:border-slate-800">
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                          {renderExpandedRow(row.original)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  هیچ داتایەک نەدۆزرایەوە
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>پەڕەی</span>
          <span className="font-bold">{table.getState().pagination.pageIndex + 1}</span>
          <span>لە</span>
          <span className="font-bold">{table.getPageCount() || 1}</span>
          <span className="mr-4 text-slate-400">({table.getFilteredRowModel().rows.length} دێڕ)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none ml-2"
          >
            {[10, 15, 20, 30, 40, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} دێڕ
              </option>
            ))}
          </select>
          
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm" dir="ltr">
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 border-l border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-colors"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 border-l border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-colors"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 border-l border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-colors"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
