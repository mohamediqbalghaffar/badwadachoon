"use client";

import React, { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import { IncomingLetterData } from "../utils/parser";
import { ExternalLink, X, FileText, Building2, User, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { PremiumTable } from "./PremiumTable";
import { ColumnDef } from "@tanstack/react-table";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
  AreaChart, Area, PieChart, Pie
} from "recharts";
import { format, parseISO, isValid, startOfMonth } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export const IncomingView = () => {
  const { filteredIncomingData, filters, setFilters } = useData();
  const [showToast, setShowToast] = useState(false);

  const handleCodeClick = (refCode: string, sentDate: string | null, subject: string) => {
    if (refCode.includes('ئیمەیڵ')) {
      navigator.clipboard.writeText(subject);
      const width = 1200;
      const height = 800;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      window.open(
        'https://mail.halabjagroup.com/owa/#path=/mail/search', 
        'OutlookPopup', 
        `width=${width},height=${height},top=${top},left=${left},popup=yes`
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      return;
    }

    navigator.clipboard.writeText(refCode);
    const OLD_ODOO_CUTOFF = new Date('2025-12-31T23:59:59');
    const OLD_ODOO_URL = 'https://olderp.halabjagroup.com/web#action=889&model=approval.request&view_type=list&cids=86%2C87%2C88%2C89&menu_id=588';
    const NEW_ODOO_URL = 'https://erp.halabjagroup.com/odoo/action-817';

    let targetUrl = NEW_ODOO_URL;
    if (sentDate) {
      const date = new Date(sentDate);
      if (!isNaN(date.getTime()) && date <= OLD_ODOO_CUTOFF) {
        targetUrl = OLD_ODOO_URL;
      }
    }

    const width = 1200;
    const height = 800;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    window.open(
      targetUrl, 
      'OdooPopup', 
      `width=${width},height=${height},top=${top},left=${left},popup=yes`
    );

    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const uniqueData = useMemo(() => {
    const seen = new Set<string | number>();
    return filteredIncomingData.filter((item) => {
      const key = item.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredIncomingData]);

  const columns = useMemo<ColumnDef<IncomingLetterData, any>[]>(() => [
    { accessorKey: 'id', header: '#' },
    { 
      accessorKey: 'subject', 
      header: 'بابەت',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate font-medium text-slate-700 dark:text-slate-300" title={row.original.subject}>
          {row.original.subject}
        </div>
      )
    },
    { 
      accessorKey: 'sender', 
      header: 'هاتووە لە',
      cell: ({ row }) => (
        <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold flex w-max items-center gap-2">
          <User size={12} />
          {row.original.sender || '-'}
        </span>
      )
    },
    { 
      accessorKey: 'department', 
      header: 'لایەنی پەیوەندیدار',
      cell: ({ row }) => {
         const depts = row.original.departments?.length ? row.original.departments : (row.original.department ? [row.original.department] : []);
         return (
           <div className="flex flex-wrap gap-1 max-w-[200px]">
             {depts.map(d => (
               <span key={d} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                 {d}
               </span>
             ))}
           </div>
         );
      }
    },
    { 
      accessorKey: 'refCode', 
      header: 'کۆد',
      cell: ({ row }) => (
        <button 
          onClick={() => handleCodeClick(row.original.refCode, row.original.sentDate, row.original.subject)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 rounded-lg transition-colors group border border-indigo-200 dark:border-indigo-800/50 shadow-sm"
          title="کرتە بکە بۆ چوونە ناو سیستم"
        >
          <span className="font-mono text-xs">{row.original.refCode}</span>
          <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      )
    },
    { 
      accessorKey: 'letterType', 
      header: 'جۆری نامە',
      cell: ({ row }) => (
        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800/50 shadow-sm">
          {row.original.letterType}
        </span>
      )
    },
    { 
      accessorKey: 'sentDate', 
      header: 'ڕۆژی ناردن',
      cell: ({ row }) => {
        const val = row.original.sentDate;
        return <div className="text-slate-600 dark:text-slate-400 font-mono text-xs bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded inline-block border border-slate-100 dark:border-slate-800">{val ? val.split('T')[0] : '-'}</div>;
      }
    },
  ], []);

  const renderExpandedRow = (row: IncomingLetterData) => {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl m-4 border border-slate-200 dark:border-slate-700 shadow-inner">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <FileText size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">وردەکاری بابەت</h4>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm">{row.subject}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Building2 size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">وردەکاری نێرەر</h4>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm font-medium">{row.sender || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIncomingData.forEach((d) => counts[d.letterType] = (counts[d.letterType] || 0) + 1);
    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    if (sorted.length > 7) {
      const top = sorted.slice(0, 6);
      const others = sorted.slice(6).reduce((acc, curr) => acc + curr.value, 0);
      top.push({ name: 'ئەوانی تر', value: others });
      return top;
    }
    return sorted;
  }, [filteredIncomingData]);

  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIncomingData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          counts[monthStr] = (counts[monthStr] || 0) + 1;
        }
      }
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredIncomingData]);

  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIncomingData.forEach((d) => {
      if (d.sender) {
        counts[d.sender] = (counts[d.sender] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => {
         const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
         const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
         const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
         return { name, count, abbr: abbr || name.charAt(0) };
    }).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [filteredIncomingData]);

  return (
    <div className="flex flex-col mb-8 relative space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
          داتای وردی سەرجەم هاتووەکان
        </h3>
        
        {(filters?.departments?.length > 0 || filters?.letterType?.length > 0 || filters?.slaStatus?.length > 0) && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, departments: [], letterType: [], slaStatus: [] }))}
            className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors whitespace-nowrap shadow-sm border border-red-100 dark:border-red-500/20"
            title="سڕینەوەی فلتەرەکان"
          >
            <X size={14} />
            سڕینەوەی هەموو فلتەرەکان
          </button>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Type Pie Chart */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <PieIcon className="text-purple-500" size={24} />
            جۆری نامە هاتووەکان
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col gap-3" dir="rtl">
              {typeData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">{entry.value} نامە</span>
                </div>
              ))}
            </div>
            <div className="h-[250px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Timeline Area Chart */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={24} />
            هەڵکشان و داکشانی نامە هاتووەکان
          </h3>
          <div className="h-[250px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncomingTimeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorIncomingTimeline)" dot={{ r: 4, stroke: '#06b6d4', strokeWidth: 2, fill: '#fff' }}>
                  <LabelList dataKey="count" position="top" offset={10} fill="#06b6d4" fontSize={12} fontWeight="bold" />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Bar Chart */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm xl:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Building2 className="text-blue-500" size={24} />
            لایەنە سەرەکییەکان بەپێی نامەی هاتوو
          </h3>
          <div className="h-[300px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="abbr" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '0.75rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                  formatter={(value: any, name: any, props: any) => [value, props.payload.name]}
                  labelFormatter={(abbr) => {
                    const entry = deptData.find(d => d.abbr === abbr);
                    return entry ? entry.name : abbr;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  <LabelList dataKey="count" position="top" offset={8} fill="#64748b" fontSize={11} fontWeight="bold" />
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center" dir="rtl">
            {deptData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{entry.abbr}</span>
                <span className="text-slate-500 dark:text-slate-400">= {entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PremiumTable 
        data={uniqueData} 
        columns={columns} 
        renderExpandedRow={renderExpandedRow}
        exportFilename="Incoming_Letters_Export"
        searchPlaceholder="گەڕان بەدوای بابەت، کۆد، بەش..."
      />

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <p className="font-medium">کۆپی کرا بۆ کلیپبۆرد! سەرنج بدە پەنجەرەی نوێ...</p>
        </div>
      )}
    </div>
  );
};
