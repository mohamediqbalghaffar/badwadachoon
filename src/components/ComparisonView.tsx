"use client";

import React, { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
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
  Legend,
} from "recharts";
import { format, parseISO, isValid, startOfMonth } from "date-fns";
import { Inbox, Send, ArrowLeftRight, BarChart3, PieChart as PieChartIcon, TrendingUp, ArrowDownToLine } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

// Custom tooltip styles matching existing dashboard
const tooltipStyle = {
  borderRadius: '1rem',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
};

type DataSourceType = 'received' | 'sent' | 'incoming';

export const ComparisonView = () => {
  const { baseFilteredData, baseFilteredSentData, baseFilteredIncomingData } = useData();

  const [sourceA, setSourceA] = useState<DataSourceType>('received');
  const [sourceB, setSourceB] = useState<DataSourceType>('sent');

  const getSourceConfig = (type: DataSourceType) => {
    switch (type) {
      case 'received':
        return { 
          id: 'received',
          data: baseFilteredData, 
          name: 'پێویست بە وەڵام', 
          color: '#3b82f6',
          gradientText: 'from-blue-600 to-blue-400',
          gradientBg: 'from-blue-500 to-blue-400',
          lightBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          glow: 'bg-blue-500/10 group-hover:bg-blue-500/20',
          borderOverlay: 'from-blue-500 to-transparent',
          icon: Inbox 
        };
      case 'sent':
        return { 
          id: 'sent',
          data: baseFilteredSentData, 
          name: 'سەرجەم ڕەوانەکراوەکان', 
          color: '#06b6d4',
          gradientText: 'from-cyan-500 to-teal-400',
          gradientBg: 'from-cyan-400 to-cyan-500',
          lightBg: 'bg-cyan-100 dark:bg-cyan-900/30',
          iconColor: 'text-cyan-600 dark:text-cyan-400',
          glow: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
          borderOverlay: 'from-cyan-500 to-transparent',
          icon: Send 
        };
      case 'incoming':
        return { 
          id: 'incoming',
          data: baseFilteredIncomingData, 
          name: 'سەرجەم هاتووەکان', 
          color: '#8b5cf6',
          gradientText: 'from-purple-600 to-purple-400',
          gradientBg: 'from-purple-500 to-purple-400',
          lightBg: 'bg-purple-100 dark:bg-purple-900/30',
          iconColor: 'text-purple-600 dark:text-purple-400',
          glow: 'bg-purple-500/10 group-hover:bg-purple-500/20',
          borderOverlay: 'from-purple-500 to-transparent',
          icon: ArrowDownToLine 
        };
    }
  };

  const configA = getSourceConfig(sourceA);
  const configB = getSourceConfig(sourceB);

  const countA = configA.data.length;
  const countB = configB.data.length;
  
  // Ratios for the progress bar
  const sumCount = countA + countB;
  const percentA = sumCount > 0 ? Math.round((countA / sumCount) * 100) : 0;
  const percentB = sumCount > 0 ? 100 - percentA : 0;

  // === Department Comparison Data ===
  const deptComparisonData = useMemo(() => {
    const countsA: Record<string, number> = {};
    const countsB: Record<string, number> = {};

    configA.data.forEach((d: any) => {
      if (Array.isArray(d.departments) && d.departments.length > 0) {
        d.departments.forEach((dept: string) => {
          countsA[dept] = (countsA[dept] || 0) + 1;
        });
      } else if (d.sender) {
        countsA[d.sender] = (countsA[d.sender] || 0) + 1;
      }
    });

    configB.data.forEach((d: any) => {
      if (Array.isArray(d.departments) && d.departments.length > 0) {
        d.departments.forEach((dept: string) => {
          countsB[dept] = (countsB[dept] || 0) + 1;
        });
      } else if (d.sender) {
        countsB[d.sender] = (countsB[d.sender] || 0) + 1;
      }
    });

    const allDepts = new Set([...Object.keys(countsA), ...Object.keys(countsB)]);

    return Array.from(allDepts)
      .map((dept) => {
        const valA = countsA[dept] || 0;
        const valB = countsB[dept] || 0;
        const cleanName = dept.replace('بەشی ', '').replace('سێکتەری ', '');
        const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
        const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
        return { name: dept, abbr: abbr || dept.charAt(0), valA, valB, total: valA + valB };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [configA.data, configB.data]);

  // === Letter Type Data (Source A) ===
  const typeDataA = useMemo(() => {
    const counts: Record<string, number> = {};
    configA.data.forEach((d: any) => {
      const type = d.letterType || "نەزانراو";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [configA.data]);

  // === Letter Type Data (Source B) ===
  const typeDataB = useMemo(() => {
    const counts: Record<string, number> = {};
    configB.data.forEach((d: any) => {
      const type = d.letterType || "نەزانراو";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [configB.data]);

  // === Timeline Data (Both overlaid) ===
  const timelineData = useMemo(() => {
    const byMonthA: Record<string, number> = {};
    const byMonthB: Record<string, number> = {};

    configA.data.forEach((d: any) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          byMonthA[monthStr] = (byMonthA[monthStr] || 0) + 1;
        }
      }
    });

    configB.data.forEach((d: any) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          byMonthB[monthStr] = (byMonthB[monthStr] || 0) + 1;
        }
      }
    });

    const allMonths = new Set([...Object.keys(byMonthA), ...Object.keys(byMonthB)]);

    return Array.from(allMonths)
      .sort((a, b) => a.localeCompare(b))
      .map((month) => ({
        date: month,
        valA: byMonthA[month] || 0,
        valB: byMonthB[month] || 0,
      }));
  }, [configA.data, configB.data]);

  // === Empty Data Guard ===
  if (baseFilteredData.length === 0 && baseFilteredSentData.length === 0 && baseFilteredIncomingData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" dir="rtl">
        <ArrowLeftRight size={64} className="text-slate-400 dark:text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
          داتای بەراوردکردن بەردەست نییە
        </h2>
        <p className="text-slate-500 dark:text-slate-500">
          تکایە فایلێک بار بکە کە داتای تێدابێت
        </p>
      </div>
    );
  }

  const IconA = configA.icon;
  const IconB = configB.icon;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
          <ArrowLeftRight size={20} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">بەراوردکردنی نامەکان</h2>
      </div>

      {/* Configuration Controls */}
      <div className="glass glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 w-24">داتای یەکەم:</span>
          <select 
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={sourceA}
            onChange={(e) => setSourceA(e.target.value as DataSourceType)}
          >
            <option value="received" disabled={sourceB === 'received'}>پێویست بە وەڵام</option>
            <option value="sent" disabled={sourceB === 'sent'}>سەرجەم ڕەوانەکراوەکان</option>
            <option value="incoming" disabled={sourceB === 'incoming'}>سەرجەم هاتووەکان</option>
          </select>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <ArrowLeftRight size={16} className="text-slate-400" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 w-24">داتای دووەم:</span>
          <select 
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={sourceB}
            onChange={(e) => setSourceB(e.target.value as DataSourceType)}
          >
            <option value="received" disabled={sourceA === 'received'}>پێویست بە وەڵام</option>
            <option value="sent" disabled={sourceA === 'sent'}>سەرجەم ڕەوانەکراوەکان</option>
            <option value="incoming" disabled={sourceA === 'incoming'}>سەرجەم هاتووەکان</option>
          </select>
        </div>
      </div>

      {/* Warning if data is empty */}
      {(countA === 0 || countB === 0) && (
        <div className="glass glass-card p-4 border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20 flex items-center gap-3">
          <div className="text-amber-500 shrink-0"><BarChart3 size={20} /></div>
          <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
            داتای یەکێک لە بەشە دیاریکراوەکان بەردەست نییە. بۆ بینینی بەراوردەکە، تکایە دڵنیابە لە هەبوونی داتا بۆ هەردوو بەشەکە.
          </p>
        </div>
      )}

      {/* === 1. Summary KPI Row === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source A Card */}
        <div className="glass glass-card glass-interactive p-6 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l ${configA.borderOverlay} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className={`absolute -left-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all duration-500 ${configA.glow}`} />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {configA.name}
              </p>
              <h3 className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${configA.gradientText}`}>
                {countA.toLocaleString()}
              </h3>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center group-hover:animate-pulse-ring transition-colors ${configA.lightBg} ${configA.iconColor}`}>
              <IconA size={28} className="group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Source B Card */}
        <div className="glass glass-card glass-interactive p-6 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l ${configB.borderOverlay} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className={`absolute -left-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all duration-500 ${configB.glow}`} />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {configB.name}
              </p>
              <h3 className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${configB.gradientText}`}>
                {countB.toLocaleString()}
              </h3>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center group-hover:animate-pulse-ring transition-colors ${configB.lightBg} ${configB.iconColor}`}>
              <IconB size={28} className="group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Ratio Bar */}
      {sumCount > 0 && (
        <div className="glass glass-card p-4">
          <div className="flex items-center justify-between text-sm font-medium mb-2">
            <span className={`flex items-center gap-1 ${configA.iconColor}`}>
              <IconA size={14} />
              {configA.name} {percentA}%
            </span>
            <span className={`flex items-center gap-1 ${configB.iconColor}`}>
              {percentB}% {configB.name}
              <IconB size={14} />
            </span>
          </div>
          <div className="w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex" dir="ltr">
            <div
              className={`h-full bg-gradient-to-r ${configA.gradientBg} transition-all duration-700 ease-out rounded-l-full`}
              style={{ width: `${percentA}%` }}
            />
            <div
              className={`h-full bg-gradient-to-r ${configB.gradientBg} transition-all duration-700 ease-out rounded-r-full`}
              style={{ width: `${percentB}%` }}
            />
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
            کۆی گشتی: {sumCount.toLocaleString()} نامە
          </p>
        </div>
      )}

      {/* === 2. Department Comparison — Grouped Bar Chart === */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-slate-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-slate-500" />
          <h3 className="text-lg font-semibold">بەراوردکردنی لایەنەکان</h3>
        </div>

        {deptComparisonData.length > 0 ? (
          <>
            <div className="h-[350px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptComparisonData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                  <XAxis
                    dataKey="abbr"
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.2)' }}
                    contentStyle={tooltipStyle}
                    formatter={(value: any, name: any) => {
                      const label = name === 'valA' ? configA.name : configB.name;
                      return [value, label];
                    }}
                    labelFormatter={(abbr) => {
                      const entry = deptComparisonData.find(d => d.abbr === abbr);
                      return entry ? entry.name : abbr;
                    }}
                  />
                  <Bar dataKey="valA" fill={configA.color} radius={[6, 6, 0, 0]} maxBarSize={35} name="valA">
                    <LabelList dataKey="valA" position="top" fill={configA.color} fontSize={11} fontWeight="bold" />
                  </Bar>
                  <Bar dataKey="valB" fill={configB.color} radius={[6, 6, 0, 0]} maxBarSize={35} name="valB">
                    <LabelList dataKey="valB" position="top" fill={configB.color} fontSize={11} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend for Departments */}
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-slate-200 dark:border-slate-800 pt-4" dir="rtl">
              {deptComparisonData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">{entry.abbr}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs line-clamp-1" title={entry.name}>= {entry.name}</span>
                </div>
              ))}
            </div>

            {/* Bar Legend */}
            <div className="mt-3 flex gap-x-6 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: configA.color }} />
                <span className="font-medium text-slate-600 dark:text-slate-300">{configA.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: configB.color }} />
                <span className="font-medium text-slate-600 dark:text-slate-300">{configB.name}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600">
            داتا بەردەست نییە
          </div>
        )}
      </div>

      {/* === 3. Letter Type Comparison — Two Doughnut Charts === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source A Types Doughnut */}
        <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l ${configA.borderOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon size={18} className={configA.iconColor.split(' ')[0]} />
            <h3 className="text-lg font-semibold">جۆری نامەکانی {configA.name}</h3>
          </div>
          {typeDataA.length > 0 ? (
            <>
              <div className="h-[280px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDataA}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {typeDataA.map((_, index) => (
                        <Cell key={`cell-a-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, name: any) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-slate-200 dark:border-slate-800 pt-4" dir="rtl">
                {typeDataA.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{entry.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">({entry.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600">
              داتا بەردەست نییە
            </div>
          )}
        </div>

        {/* Source B Types Doughnut */}
        <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l ${configB.borderOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon size={18} className={configB.iconColor.split(' ')[0]} />
            <h3 className="text-lg font-semibold">جۆری نامەکانی {configB.name}</h3>
          </div>
          {typeDataB.length > 0 ? (
            <>
              <div className="h-[280px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDataB}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {typeDataB.map((_, index) => (
                        <Cell key={`cell-b-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, name: any) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-slate-200 dark:border-slate-800 pt-4" dir="rtl">
                {typeDataB.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{entry.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">({entry.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
              داتا بەردەست نییە
            </div>
          )}
        </div>
      </div>

      {/* === 4. Timeline Overlay — Area Chart === */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col h-96 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-slate-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-slate-500" />
          <h3 className="text-lg font-semibold">بەراوردکردنی هەڵکشان و داکشان بەپێی کات</h3>
        </div>

        {timelineData.length > 0 ? (
          <div className="h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={configA.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={configA.color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={configB.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={configB.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any, name: any) => {
                    const label = name === 'valA' ? configA.name : configB.name;
                    return [value, label];
                  }}
                  labelFormatter={(label) => `مانگ: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="valA"
                  stroke={configA.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorA)"
                  dot={{ r: 4, stroke: configA.color, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: configA.color, strokeWidth: 2, fill: '#fff' }}
                  name="valA"
                >
                  <LabelList dataKey="valA" position="top" offset={10} fill={configA.color} fontSize={11} fontWeight="bold" />
                </Area>
                <Area
                  type="monotone"
                  dataKey="valB"
                  stroke={configB.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorB)"
                  dot={{ r: 4, stroke: configB.color, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: configB.color, strokeWidth: 2, fill: '#fff' }}
                  name="valB"
                >
                  <LabelList dataKey="valB" position="bottom" offset={10} fill={configB.color} fontSize={11} fontWeight="bold" />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600">
            داتا بەردەست نییە
          </div>
        )}

        {/* Timeline Legend */}
        {timelineData.length > 0 && (
          <div className="mt-4 flex gap-x-6 justify-center border-t border-slate-200 dark:border-slate-800 pt-3" dir="rtl">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-1 rounded-full shrink-0" style={{ backgroundColor: configA.color }} />
              <span className="font-medium text-slate-600 dark:text-slate-300">{configA.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-1 rounded-full shrink-0" style={{ backgroundColor: configB.color }} />
              <span className="font-medium text-slate-600 dark:text-slate-300">{configB.name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
