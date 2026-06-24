"use client";

import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { DashboardData } from "../utils/parser";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Edit2, Trash2, Check, X, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const DataTable = () => {
  const { filteredData, setData, data , filters, setFilters } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof DashboardData; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Edit states
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<Partial<DashboardData>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [loadingOdooCode, setLoadingOdooCode] = useState<string | null>(null);

  const handleCodeClick = async (refCode: string) => {
    // Always copy to clipboard as fallback/convenience
    navigator.clipboard.writeText(refCode);

    setLoadingOdooCode(refCode);
    try {
      const res = await fetch('/api/odoo/find-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refCode })
      });

      const data = await res.json();

      if (res.ok && data.id) {
        // Direct link to the record!
        window.open(`https://erp.halabjagroup.com/odoo/action-817/${data.id}`, '_blank');
      } else {
        // Fallback or not configured
        if (data.error === 'Odoo credentials not configured in profile') {
          // Open fallback, they can paste it
          window.open(`https://erp.halabjagroup.com/odoo/action-817?search=${encodeURIComponent(refCode)}`, '_blank');
          alert('بەستنەوە بە Odoo نەکراوە. تکایە لە ڕێکخستنەکانی هەژمارەکەت زانیارییەکانی Odoo تۆمار بکە بۆ کردنەوەی ڕاستەوخۆ.');
        } else {
          window.open(`https://erp.halabjagroup.com/odoo/action-817?search=${encodeURIComponent(refCode)}`, '_blank');
          console.error(data.error);
        }
      }
    } catch (err) {
      console.error(err);
      window.open(`https://erp.halabjagroup.com/odoo/action-817?search=${encodeURIComponent(refCode)}`, '_blank');
    } finally {
      setLoadingOdooCode(null);
    }
  };

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

  const handleEdit = (row: DashboardData) => {
    setEditingId(row.id);
    setEditForm({ ...row });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string | number) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/db/received", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        const updatedRecord = await response.json();
        setData(data.map(d => d.id === id ? { ...d, ...updatedRecord } : d));
        setEditingId(null);
      } else {
        alert("هەڵەیەک ڕوویدا لە کاتی پاشەکەوتکردن");
      }
    } catch (err) {
      console.error(err);
      alert("هەڵەیەک ڕوویدا لە کاتی پاشەکەوتکردن");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم تۆمارە؟")) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/db/received?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setData(data.filter(d => d.id !== id));
      } else {
        alert("هەڵەیەک ڕوویدا لە کاتی سڕینەوە");
      }
    } catch (err) {
      console.error(err);
      alert("هەڵەیەک ڕوویدا لە کاتی سڕینەوە");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="data-table-section" className="glass glass-card glass-interactive flex flex-col overflow-hidden mb-8 relative group">
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold">داتای وردی پێویست بە وەڵامەکان</h3>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {(filters?.departments?.length > 0 || filters?.letterType?.length > 0 || filters?.slaStatus?.length > 0) && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, departments: [], letterType: [], slaStatus: [] }))}
              className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-3 py-2 rounded-full transition-colors whitespace-nowrap"
              title="سڕینەوەی فلتەرەکان"
            >
              <X size={14} />
              سڕینەوەی فلتەر
            </button>
          )}
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
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <table className="w-full text-sm text-right min-w-[1100px] border-collapse">
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
                  <div className="flex items-center gap-1 justify-start">
                    <span>{col.label}</span>
                    <ArrowUpDown size={12} className="opacity-50" />
                  </div>
                </th>
              ))}
              {(user?.role === 'admin' || user?.role === 'user') && (
                <th className="px-4 py-3 whitespace-nowrap text-center">کردارەکان</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{row.id}</td>
                  <td className="px-4 py-3 max-w-[250px] truncate font-medium text-slate-700 dark:text-slate-300" title={row.subject}>
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={editForm.subject || ''} 
                        onChange={e => setEditForm({...editForm, subject: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border border-blue-300 rounded px-3 py-1.5 text-right outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    ) : (row.subject)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {/* Simplified: Array editing is hard in a single cell, so we keep it read-only for now */}
                    {row.departments?.join("، ") || row.dept1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-slate-400">
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={editForm.refCode || ''} 
                        onChange={e => setEditForm({...editForm, refCode: e.target.value})}
                        className="w-28 bg-white dark:bg-slate-900 border border-blue-300 rounded px-2 py-1 text-left outline-none focus:ring-2 focus:ring-blue-500"
                        dir="ltr"
                      />
                    ) : (
                      <button
                        onClick={() => handleCodeClick(row.refCode)}
                        disabled={loadingOdooCode === row.refCode}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer transition-colors text-left inline-flex items-center gap-1.5 px-2 py-1 -ml-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-wait"
                        title="بینین لە سیستەمی Odoo (کۆدەکە بە شێوەیەکی ئۆتۆماتیکی لەبەردەگیرێتەوە)"
                      >
                        {row.refCode}
                        {loadingOdooCode === row.refCode ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1 opacity-70" />
                        ) : (
                          <ExternalLink size={12} className="opacity-70" />
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{row.sentDate || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{row.responseDate || <span className="text-amber-500 font-medium">لە چاوەڕوانیدایە</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-center font-semibold text-slate-700 dark:text-slate-300">{row.processingTime !== null ? row.processingTime : "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getSLAColor(row.slaTime)}`}>
                      {row.slaTime || "-"}
                    </span>
                  </td>
                  {(user?.role === 'admin' || user?.role === 'user') && (
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {editingId === row.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleSave(row.id)} disabled={isSaving} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors" title="پاشەکەوتکردن">
                            <Check size={16} />
                          </button>
                          <button onClick={handleCancelEdit} disabled={isSaving} className="p-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors" title="پاشگەزبوونەوە">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(row)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="دەستکاری">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(row.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="سڕینەوە">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
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
