"use client";

import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { DashboardData } from "../utils/parser";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

export const DataTable = () => {
  const { filteredData } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof DashboardData; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Search logic
  const searchedData = useMemo(() => {
    if (!searchTerm) return filteredData;
    const lowerSearch = searchTerm.toLowerCase();
    return filteredData.filter(
      (item) =>
        item.subject.toLowerCase().includes(lowerSearch) ||
        item.refCode.toLowerCase().includes(lowerSearch)
    );
  }, [filteredData, searchTerm]);

  // Sort logic
  const sortedData = useMemo(() => {
    let sortableItems = [...searchedData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal: any = a[sortConfig.key] ?? "";
        let bVal: any = b[sortConfig.key] ?? "";

        if (Array.isArray(aVal)) aVal = aVal.join(", ");
        if (Array.isArray(bVal)) bVal = bVal.join(", ");

        if (aVal === null) return 1;
        if (bVal === null) return -1;

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [searchedData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const requestSort = (key: keyof DashboardData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSLAColor = (slaTime: string) => {
    // Basic logic mapping based on text. Adjust to real data.
    if (slaTime.includes("کەمتر")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    if (slaTime.includes("زیاتر")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  };

  return (
    <div id="data-table-section" className="glass glass-card glass-interactive flex flex-col overflow-hidden mb-8 relative group">
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold">داتای وردی نامەکان</h3>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="گەڕان بەدوای بابەت یان کۆد..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white/50 dark:bg-black/20 border border-slate-200/50 dark:border-slate-700/50 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              {/* Table Headers */}
              {[
                { key: "id", label: "#" },
                { key: "subject", label: "بابەت" },
                { key: "department", label: "لایەنی پەیوەندیدار" },
                { key: "refCode", label: "کۆد" },
                { key: "sentDate", label: "ڕۆژی ناردن" },
                { key: "responseDate", label: "ڕۆژی وەڵام" },
                { key: "processingTime", label: "کاتی تێچوو بۆ وەڵام (ڕۆژ)" },
                { key: "slaTime", label: "باری SLA" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap"
                  onClick={() => requestSort(col.key as keyof DashboardData)}
                >
                  <div className="flex items-center gap-1 justify-end">
                    <span>{col.label}</span>
                    <ArrowUpDown size={12} className="opacity-50" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.id}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={row.subject}>{row.subject}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.department}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{row.refCode}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.sentDate || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.responseDate || <span className="text-amber-500">لە چاوەڕوانیدایە</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.processingTime !== null ? row.processingTime : "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getSLAColor(row.slaTime)}`}>
                      {row.slaTime || "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  هیچ داتایەک نەدۆزرایەوە.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            پەڕەی {currentPage} لە {totalPages}
          </span>
          <div className="flex gap-2" dir="rtl">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
