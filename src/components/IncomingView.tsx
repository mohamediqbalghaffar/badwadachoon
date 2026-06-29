"use client";

import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { IncomingLetterData } from "../utils/parser";
import { Send, Building2, FileText, Search, ChevronLeft, ChevronRight, ArrowUpDown, Edit2, Trash2, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LabelList,
} from "recharts";
import { format, parseISO, isValid, startOfMonth } from "date-fns";

const COLORS = ["#06b6d4", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981", "#3b82f6"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, value, name, fill } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;

  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;

  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={ex} cy={ey} r={4} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} dy={4} textAnchor={textAnchor} fill={fill} className="text-[11px] font-bold" style={{ fontFamily: "inherit" }}>
        {`${name} : ${value}`}
      </text>
    </g>
  );
};

// ─── KPI Cards ───────────────────────────────────────────────────────────────

const IncomingKPICards = () => {
  const { baseFilteredIncomingData } = useData();

  const totalLetters = baseFilteredIncomingData.length;

  const uniqueDepartments = useMemo(() => {
    const set = new Set(baseFilteredIncomingData.map((d) => d.sender).filter(Boolean));
    return set.size;
  }, [baseFilteredIncomingData]);

  const uniqueLetterTypes = useMemo(() => {
    const set = new Set(baseFilteredIncomingData.map((d) => d.letterType));
    return set.size;
  }, [baseFilteredIncomingData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Sent Letters */}
      <div className="glass glass-card glass-interactive p-6 flex items-center justify-between group cursor-pointer relative overflow-hidden">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">کۆی نامە هاتووەکان</p>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500">
            {totalLetters}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:animate-pulse-ring relative z-10 transition-colors">
          <Send size={24} className="group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all duration-500" />
      </div>

      {/* Departments Count */}
      <div className="glass glass-card glass-interactive p-6 flex items-center justify-between group cursor-pointer relative overflow-hidden">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">ژمارەی لایەنە پەیوەندیدارەکان</p>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-sky-500">
            {uniqueDepartments}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:animate-pulse-ring relative z-10 transition-colors">
          <Building2 size={24} className="group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500" />
      </div>

      {/* Letter Types Count */}
      <div className="glass glass-card glass-interactive p-6 flex items-center justify-between group cursor-pointer relative overflow-hidden">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">ژمارەی جۆرەکانی نامە</p>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-violet-500">
            {uniqueLetterTypes}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:animate-pulse-ring relative z-10 transition-colors">
          <FileText size={24} className="group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all duration-500" />
      </div>
    </div>
  );
};

// ─── Charts ──────────────────────────────────────────────────────────────────

const IncomingCharts = () => {
  const { filteredIncomingData, setFilters } = useData();

  // Department Data — Top 10
  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIncomingData.forEach((d) => {
      if (d.sender) {
        counts[d.sender] = (counts[d.sender] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => {
        const cleanName = name.replace("بەشی ", "").replace("سێکتەری ", "");
        const words = cleanName.split(" ").filter((w) => w.length > 1 && w !== "و");
        const abbr = words.slice(0, 2).map((w) => w.charAt(0)).join(".");
        return { name, count, abbr: abbr || name.charAt(0) };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredIncomingData]);

  // Letter Type Data
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIncomingData.forEach((d) => {
      counts[d.letterType] = (counts[d.letterType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => {
      const cleanName = name.replace("بەشی ", "").replace("سێکتەری ", "");
      const words = cleanName.split(" ").filter((w) => w.length > 1 && w !== "و");
      const abbr = words.slice(0, 2).map((w) => w.charAt(0)).join(".");
      return { name, value, abbr: abbr || name.charAt(0) };
    });
  }, [filteredIncomingData]);

  // Timeline Data — Monthly
  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIncomingData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), "yyyy-MM");
          counts[monthStr] = (counts[monthStr] || 0) + 1;
        }
      }
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredIncomingData]);

  const scrollToTable = () => {
    document.getElementById("sent-data-table-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Department Bar Chart */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 h-auto relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-teal-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <h3 className="text-lg font-semibold mb-6">قەبارەی نامە هاتووەکان بەپێی لایەن</h3>
        <div className="flex-1 min-h-[300px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="abbr" tick={{ fontSize: 12, fill: "#64748b", fontWeight: "bold" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(241, 245, 249, 0.2)" }}
                contentStyle={{ borderRadius: "1rem", border: "none", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}
                formatter={(value: any, _name: any, props: any) => [value, props.payload.name]}
                labelFormatter={(abbr) => {
                  const entry = deptData.find((d) => d.abbr === abbr);
                  return entry ? entry.name : abbr;
                }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
                onClick={(data: any) => {
                  if (data && data.name) {
                    setFilters((prev) => {
                      const isSelected = prev.departments?.includes(data.name as string);
                      return { ...prev, departments: isSelected ? [] : [data.name as string] };
                    });
                    scrollToTable();
                  }
                }}
                cursor="pointer"
              >
                <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} fontWeight="bold" />
                {deptData.map((_entry, index) => (
                  <Cell key={`dept-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-slate-200 dark:border-slate-800 pt-4" dir="rtl">
          {deptData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">{entry.abbr}</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs line-clamp-1" title={entry.name}>= {entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Letter Type Doughnut Chart */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 h-auto relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <h3 className="text-lg font-semibold mb-6">پۆلێنکردنی جۆری نامە هاتووەکان</h3>
        <div className="flex-1 min-h-[300px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                labelLine={false}
                label={renderCustomizedLabel}
                onClick={(data: any) => {
                  if (data && data.name) {
                    setFilters((prev) => {
                      const isSelected = prev.letterType?.includes(data.name as string);
                      return { ...prev, letterType: isSelected ? [] : [data.name as string] };
                    });
                    scrollToTable();
                  }
                }}
                cursor="pointer"
              >
                <LabelList dataKey="abbr" position="inside" fill="#ffffff" fontSize={14} fontWeight="bold" />
                {typeData.map((_entry, index) => (
                  <Cell key={`type-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: "rgba(241, 245, 249, 0.2)" }}
                contentStyle={{ borderRadius: "1rem", border: "none", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }}
                formatter={(value: any, _name: any, props: any) => [value, props.payload.name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-slate-200 dark:border-slate-800 pt-4" dir="rtl">
          {typeData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">{entry.abbr}</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs line-clamp-1" title={entry.name}>= {entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* Timeline Area Chart — Full width, below sections 1 & 2, above data table */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-80 h-auto relative overflow-hidden group mb-8">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-sky-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <h3 className="text-lg font-semibold mb-6">هەڵکشان و داکشانی نامە هاتووەکان بەپێی کات</h3>
        <div className="flex-1 min-h-[300px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSentTimeline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)" }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSentTimeline)"
                dot={{ r: 4, stroke: "#06b6d4", strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 2, fill: "#fff" }}
              >
                <LabelList dataKey="count" position="top" offset={10} fill="#06b6d4" fontSize={12} fontWeight="bold" />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

// ─── Data Table ──────────────────────────────────────────────────────────────

const IncomingDataTable = () => {
  const { filteredIncomingData, setSentData, incomingData , filters, setFilters } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof IncomingLetterData; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Edit states
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<Partial<IncomingLetterData>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Search logic
  const searchedData = useMemo(() => {
    if (!searchTerm) return filteredIncomingData;
    const lowerSearch = searchTerm.toLowerCase();
    return filteredIncomingData.filter(
      (item) =>
        item.subject.toLowerCase().includes(lowerSearch) ||
        item.refCode.toLowerCase().includes(lowerSearch)
    );
  }, [filteredIncomingData, searchTerm]);

  // Sort logic
  const sortedData = useMemo(() => {
    const sortableItems = [...searchedData];
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

  const requestSort = (key: keyof IncomingLetterData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (row: IncomingLetterData) => {
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
      const response = await fetch("/api/db/incoming", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        const updatedRecord = await response.json();
        setSentData(incomingData.map(d => d.id === id ? { ...d, ...updatedRecord } : d));
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
      const response = await fetch(`/api/db/incoming?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSentData(incomingData.filter(d => d.id !== id));
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

  // Reset page when data changes
  useMemo(() => {
    setCurrentPage(1);
  }, [filteredIncomingData]);

  return (
    <div id="sent-data-table-section" className="glass glass-card glass-interactive flex flex-col overflow-hidden mb-8 relative group">
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-teal-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold">داتای وردی سەرجەم هاتووەکان</h3>
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
            className="w-full bg-white/50 dark:bg-black/20 border border-slate-200/50 dark:border-slate-700/50 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              {[
                { key: "id", label: "#" },
                { key: "subject", label: "بابەت" },
                  { key: "sender", label: "هاتووە لە" },
                { key: "department", label: "لایەنی پەیوەندیدار" },
                { key: "refCode", label: "کۆد" },
                { key: "letterType", label: "جۆری نامە" },
                { key: "sentDate", label: "ڕۆژی ناردن" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap"
                  onClick={() => requestSort(col.key as keyof IncomingLetterData)}
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
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{row.id}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={row.subject}>
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={editForm.subject || ''} 
                        onChange={e => setEditForm({...editForm, subject: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border border-blue-300 rounded px-2 py-1 text-right outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (row.subject)}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={row.sender}>
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={editForm.sender || ''} 
                        onChange={e => setEditForm({...editForm, sender: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border border-blue-300 rounded px-2 py-1 text-right outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (row.sender || "-")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap max-w-[200px] truncate" title={row.departments?.join("، ") || row.dept1}>
                    {row.departments?.join("، ") || row.dept1 || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={editForm.refCode || ''} 
                        onChange={e => setEditForm({...editForm, refCode: e.target.value})}
                        className="w-24 bg-white dark:bg-slate-900 border border-blue-300 rounded px-2 py-1 text-left outline-none focus:ring-2 focus:ring-blue-500"
                        dir="ltr"
                      />
                    ) : (row.refCode)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === row.id ? (
                      <input 
                        type="text" 
                        value={editForm.letterType || ''} 
                        onChange={e => setEditForm({...editForm, letterType: e.target.value})}
                        className="w-24 bg-white dark:bg-slate-900 border border-blue-300 rounded px-2 py-1 text-right outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium border rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800">
                        {row.letterType || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.sentDate || "-"}</td>
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
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
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

// ─── Main Exported Component ─────────────────────────────────────────────────

export const IncomingView = () => {
  return (
    <div>
      <IncomingKPICards />
      <IncomingCharts />
      <IncomingDataTable />
    </div>
  );
};
