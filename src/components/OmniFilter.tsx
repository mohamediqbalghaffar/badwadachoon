"use client";

import React, { useMemo } from "react";
import { useData } from "../context/DataContext";
import { Filter, Calendar, XCircle } from "lucide-react";

export const OmniFilter = () => {
  const { data, filters, setFilters, clearFilters } = useData();

  // Extract unique options from raw data
  const departments = useMemo(() => Array.from(new Set(data.map((d) => d.department))), [data]);
  const letterTypes = useMemo(() => Array.from(new Set(data.map((d) => d.letterType))), [data]);
  const slaStatuses = useMemo(() => Array.from(new Set(data.map((d) => d.slaTime).filter(Boolean))), [data]);

  const activeFilterCount =
    (filters.dateRange.start ? 1 : 0) +
    (filters.dateRange.end ? 1 : 0) +
    (filters.departments.length > 0 ? 1 : 0) +
    (filters.letterType ? 1 : 0) +
    (filters.slaStatus ? 1 : 0);

  return (
    <div className="sticky top-4 z-40 mb-8 glass glass-card glass-interactive p-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        
        {/* Header / Clear */}
        <div className="flex items-center gap-2 md:pr-4 md:border-l border-slate-200 dark:border-slate-800">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
            <Filter size={20} />
          </div>
          <span className="font-semibold whitespace-nowrap">پاڵاوتن</span>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full ml-2 transition-colors"
            >
              <XCircle size={14} />
              سڕینەوە
            </button>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 w-full">
          {/* Date Range */}
          <div className="flex flex-col space-y-1 col-span-1 sm:col-span-2 md:col-span-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">مەودای بەروار</label>
            <div className="flex gap-1 items-center bg-white/50 dark:bg-black/20 rounded-xl px-2 py-[7px] border border-slate-200/50 dark:border-slate-700/50">
              <input
                type="date"
                value={filters.dateRange.start || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                className="bg-transparent border-none text-xs w-full min-w-0 outline-none px-1 text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={filters.dateRange.end || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                className="bg-transparent border-none text-xs w-full min-w-0 outline-none px-1 text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
          </div>

          {/* Department */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">لایەنی پەیوەندیدار</label>
            <select
              value={filters.departments[0] || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, departments: e.target.value ? [e.target.value] : [] }))}
              className="bg-white/50 dark:bg-black/20 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              <option value="">هەموو لایەنەکان</option>
              {departments.map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Letter Type */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">جۆری نامە</label>
            <select
              value={filters.letterType || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, letterType: e.target.value || null }))}
              className="bg-white/50 dark:bg-black/20 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              <option value="">هەموو جۆرەکان</option>
              {letterTypes.map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* SLA Status */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">کاتی تێچوو (SLA)</label>
            <select
              value={filters.slaStatus || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, slaStatus: e.target.value || null }))}
              className="bg-white/50 dark:bg-black/20 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              <option value="">هەموو حاڵەتەکان</option>
              {slaStatuses.map((status, i) => (
                <option key={i} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
