import React, { useMemo, useState, useRef, useEffect } from "react";
import { useData } from "../context/DataContext";
import { Filter, Calendar, XCircle, ChevronDown, Check } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
  placeholder: string;
}

const MultiSelect = ({ label, options, selected, onChange, placeholder }: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const isAllSelected = selected.length === options.length && options.length > 0;

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (isAllSelected) return "هەمووی دیاریکراوە";
    if (selected.length === 1) return selected[0];
    return `${selected.length} دیاریکراوە`;
  };

  return (
    <div className="flex flex-col space-y-1 relative" ref={dropdownRef}>
      <label className="text-xs text-slate-500 dark:text-slate-400 select-none">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/50 dark:bg-black/20 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-2 text-sm text-right flex items-center justify-between text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer min-h-[38px]"
      >
        <span className="truncate max-w-[85%] select-none">{getDisplayText()}</span>
        <ChevronDown size={16} className={`opacity-65 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[105%] right-0 left-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-1.5 animate-fade-in">
          {options.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="w-full text-right px-3 py-1.5 text-xs font-semibold text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg flex items-center justify-between cursor-pointer border-b border-slate-200/50 dark:border-slate-800/50 mb-1"
            >
              <span className="select-none">دیاریکردنی هەمووی</span>
              {isAllSelected && <Check size={14} />}
            </button>
          )}
          {options.map((opt, i) => {
            const isSel = selected.includes(opt);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleOption(opt)}
                className={`w-full text-right px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isSel 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="truncate pl-2 select-none">{opt}</span>
                {isSel && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const OmniFilter = () => {
  const { data, sentData, incomingData, filters, setFilters, clearFilters, activeView } = useData();

  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return "dd/mm/yyyy";
    try {
      const d = parseISO(dateStr);
      if (isValid(d)) {
        return format(d, 'dd/MM/yyyy');
      }
      return "dd/mm/yyyy";
    } catch (e) {
      return "dd/mm/yyyy";
    }
  };

  // Extract unique options from the appropriate dataset based on activeView
  const activeData = activeView === 'received' ? data : activeView === 'sent' ? sentData : incomingData;
  const departments = useMemo(() => Array.from(new Set(activeData.flatMap((d) => d.departments))), [activeData]);
  const letterTypes = useMemo(() => Array.from(new Set(activeData.map((d) => d.letterType))), [activeData]);
  const slaStatuses = useMemo(() => {
    if (activeView === 'sent') return [];
    return Array.from(new Set((data as any[]).map((d: any) => d.slaTime).filter(Boolean)));
  }, [data, activeView]);

  const showSlaFilter = activeView === 'received';

  const activeFilterCount =
    (filters.dateRange.start ? 1 : 0) +
    (filters.dateRange.end ? 1 : 0) +
    (filters.departments.length > 0 ? 1 : 0) +
    (filters.letterType.length > 0 ? 1 : 0) +
    (showSlaFilter && filters.slaStatus.length > 0 ? 1 : 0);

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

        <div className={`flex-1 grid grid-cols-1 sm:grid-cols-2 ${showSlaFilter ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 w-full`}>
          {/* Date Range */}
          <div className="flex flex-col space-y-1 col-span-1 sm:col-span-2 md:col-span-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">مەودای بەروار</label>
            <div className="flex gap-2 items-center bg-white/50 dark:bg-black/20 rounded-xl px-3 py-[10px] border border-slate-200/50 dark:border-slate-700/50 w-full relative">
              <div className="flex-1 flex items-center gap-2 relative">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">لە</span>
                <div className="relative flex-1 min-w-[70px]">
                  <div className="text-xs text-slate-700 dark:text-slate-300 pointer-events-none select-none font-mono">
                    {formatDateDisplay(filters.dateRange.start)}
                  </div>
                  <input
                    type="date"
                    value={filters.dateRange.start || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
              
              <span className="text-slate-400 px-1 font-light">|</span>
              
              <div className="flex-1 flex items-center gap-2 relative">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">بۆ</span>
                <div className="relative flex-1 min-w-[70px]">
                  <div className="text-xs text-slate-700 dark:text-slate-300 pointer-events-none select-none font-mono">
                    {formatDateDisplay(filters.dateRange.end)}
                  </div>
                  <input
                    type="date"
                    value={filters.dateRange.end || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Department */}
          <MultiSelect
            label="لایەنی پەیوەندیدار"
            options={departments}
            selected={filters.departments}
            onChange={(vals) => setFilters(prev => ({ ...prev, departments: vals }))}
            placeholder="هەموو لایەنەکان"
          />

          {/* Letter Type */}
          <MultiSelect
            label="جۆری نامە"
            options={letterTypes}
            selected={filters.letterType}
            onChange={(vals) => setFilters(prev => ({ ...prev, letterType: vals }))}
            placeholder="هەموو جۆرەکان"
          />

          {/* SLA Status — only for received view */}
          {showSlaFilter && (
            <MultiSelect
              label="کاتی تێچوو (SLA)"
              options={slaStatuses}
              selected={filters.slaStatus}
              onChange={(vals) => setFilters(prev => ({ ...prev, slaStatus: vals }))}
              placeholder="هەموو حاڵەتەکان"
            />
          )}
        </div>
      </div>
    </div>
  );
};
