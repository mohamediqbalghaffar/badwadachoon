"use client";

import React, { useMemo } from "react";
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
import { Inbox, Send, ArrowLeftRight, BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const RECEIVED_COLOR = "#3b82f6";
const SENT_COLOR = "#06b6d4";

// Custom tooltip styles matching existing dashboard
const tooltipStyle = {
  borderRadius: '1rem',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
};

export const ComparisonView = () => {
  const { baseFilteredData, baseFilteredSentData } = useData();

  const receivedCount = baseFilteredData.length;
  const sentCount = baseFilteredSentData.length;
  const total = Math.max(sentCount, receivedCount);
  const receivedPercent = total > 0 ? Math.round((receivedCount / total) * 100) : 0;
  const sentPercent = total > 0 ? 100 - receivedPercent : 0;

  // === Department Comparison Data ===
  const deptComparisonData = useMemo(() => {
    const receivedCounts: Record<string, number> = {};
    const sentCounts: Record<string, number> = {};

    baseFilteredData.forEach((d) => {
      receivedCounts[d.department] = (receivedCounts[d.department] || 0) + 1;
    });

    baseFilteredSentData.forEach((d) => {
      sentCounts[d.department] = (sentCounts[d.department] || 0) + 1;
    });

    const allDepts = new Set([...Object.keys(receivedCounts), ...Object.keys(sentCounts)]);

    return Array.from(allDepts)
      .map((dept) => {
        const received = receivedCounts[dept] || 0;
        const sent = sentCounts[dept] || 0;
        const cleanName = dept.replace('بەشی ', '').replace('سێکتەری ', '');
        const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
        const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
        return { name: dept, abbr: abbr || dept.charAt(0), received, sent, total: Math.max(received, sent) };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [baseFilteredData, baseFilteredSentData]);

  // === Letter Type Data (Received) ===
  const receivedTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredData.forEach((d) => {
      counts[d.letterType] = (counts[d.letterType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [baseFilteredData]);

  // === Letter Type Data (Sent) ===
  const sentTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredSentData.forEach((d) => {
      counts[d.letterType] = (counts[d.letterType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [baseFilteredSentData]);

  // === Timeline Data (Both overlaid) ===
  const timelineData = useMemo(() => {
    const receivedByMonth: Record<string, number> = {};
    const sentByMonth: Record<string, number> = {};

    baseFilteredData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          receivedByMonth[monthStr] = (receivedByMonth[monthStr] || 0) + 1;
        }
      }
    });

    baseFilteredSentData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          sentByMonth[monthStr] = (sentByMonth[monthStr] || 0) + 1;
        }
      }
    });

    const allMonths = new Set([...Object.keys(receivedByMonth), ...Object.keys(sentByMonth)]);

    return Array.from(allMonths)
      .sort((a, b) => a.localeCompare(b))
      .map((month) => ({
        date: month,
        received: receivedByMonth[month] || 0,
        sent: sentByMonth[month] || 0,
      }));
  }, [baseFilteredData, baseFilteredSentData]);

  // === Empty Sent Data Guard ===
  if (baseFilteredSentData.length === 0 && baseFilteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" dir="rtl">
        <ArrowLeftRight size={64} className="text-slate-400 dark:text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
          داتای بەراوردکردن بەردەست نییە
        </h2>
        <p className="text-slate-500 dark:text-slate-500">
          تکایە فایلێک بار بکە کە هەردوو شیتی نووسراوەکانی تێدابێت
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
          <ArrowLeftRight size={20} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">بەراوردکردنی نامەکان</h2>
      </div>

      {/* Sent data warning */}
      {baseFilteredSentData.length === 0 && (
        <div className="glass glass-card p-4 border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20 flex items-center gap-3">
          <Send size={20} className="text-amber-500 shrink-0" />
          <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
            داتای نووسراوە ڕەوانەکراوەکان بەردەست نییە
          </p>
        </div>
      )}

      {/* === 1. Summary KPI Row === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Received Card */}
        <div className="glass glass-card glass-interactive p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-500 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                نامەی پێویست بە وەڵام
              </p>
              <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                {receivedCount.toLocaleString()}
              </h3>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:animate-pulse-ring transition-colors">
              <Inbox size={28} className="group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Sent Card */}
        <div className="glass glass-card glass-interactive p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-cyan-500 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                سەرجەم نووسراوە ڕەوانەکراوەکان
              </p>
              <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-teal-400">
                {sentCount.toLocaleString()}
              </h3>
            </div>
            <div className="w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:animate-pulse-ring transition-colors">
              <Send size={28} className="group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Ratio Bar */}
      {total > 0 && (
        <div className="glass glass-card p-4">
          <div className="flex items-center justify-between text-sm font-medium mb-2">
            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Inbox size={14} />
              پێویست بە وەڵام {receivedPercent}%
            </span>
            <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              ڕەوانەکراو {sentPercent}%
              <Send size={14} />
            </span>
          </div>
          <div className="w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex" dir="ltr">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out rounded-l-full"
              style={{ width: `${receivedPercent}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-700 ease-out rounded-r-full"
              style={{ width: `${sentPercent}%` }}
            />
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
            کۆی گشتی: {total.toLocaleString()} نامە
          </p>
        </div>
      )}

      {/* === 2. Department Comparison — Grouped Bar Chart === */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-500 via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-blue-500" />
          <h3 className="text-lg font-semibold">بەراوردکردنی لایەنەکان</h3>
        </div>

        {deptComparisonData.length > 0 ? (
          <>
            <div className="flex-1 min-h-[350px]" dir="ltr">
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
                      const label = name === 'received' ? 'پێویست بە وەڵام' : 'ڕەوانەکراو';
                      return [value, label];
                    }}
                    labelFormatter={(abbr) => {
                      const entry = deptComparisonData.find(d => d.abbr === abbr);
                      return entry ? entry.name : abbr;
                    }}
                  />
                  <Bar dataKey="received" fill={RECEIVED_COLOR} radius={[6, 6, 0, 0]} maxBarSize={35} name="received">
                    <LabelList dataKey="received" position="top" fill={RECEIVED_COLOR} fontSize={11} fontWeight="bold" />
                  </Bar>
                  <Bar dataKey="sent" fill={SENT_COLOR} radius={[6, 6, 0, 0]} maxBarSize={35} name="sent">
                    <LabelList dataKey="sent" position="top" fill={SENT_COLOR} fontSize={11} fontWeight="bold" />
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
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: RECEIVED_COLOR }} />
                <span className="font-medium text-slate-600 dark:text-slate-300">پێویست بە وەڵام</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: SENT_COLOR }} />
                <span className="font-medium text-slate-600 dark:text-slate-300">ڕەوانەکراو</span>
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
        {/* Received Types Doughnut */}
        <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon size={18} className="text-blue-500" />
            <h3 className="text-lg font-semibold">جۆری نامەکانی پێویست بە وەڵام</h3>
          </div>
          {receivedTypeData.length > 0 ? (
            <>
              <div className="flex-1 min-h-[280px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={receivedTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {receivedTypeData.map((_, index) => (
                        <Cell key={`cell-r-${index}`} fill={COLORS[index % COLORS.length]} />
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
                {receivedTypeData.map((entry, index) => (
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

        {/* Sent Types Doughnut */}
        <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon size={18} className="text-cyan-500" />
            <h3 className="text-lg font-semibold">جۆری نامە ڕەوانەکراوەکان</h3>
          </div>
          {sentTypeData.length > 0 ? (
            <>
              <div className="flex-1 min-h-[280px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {sentTypeData.map((_, index) => (
                        <Cell key={`cell-s-${index}`} fill={COLORS[index % COLORS.length]} />
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
                {sentTypeData.map((entry, index) => (
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
              داتای نووسراوە ڕەوانەکراوەکان بەردەست نییە
            </div>
          )}
        </div>
      </div>

      {/* === 4. Timeline Overlay — Area Chart === */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col h-96 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-purple-500" />
          <h3 className="text-lg font-semibold">بەراوردکردنی هەڵکشان و داکشان بەپێی کات</h3>
        </div>

        {timelineData.length > 0 ? (
          <div className="flex-1 min-h-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={RECEIVED_COLOR} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={RECEIVED_COLOR} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SENT_COLOR} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={SENT_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any, name: any) => {
                    const label = name === 'received' ? 'پێویست بە وەڵام' : 'ڕەوانەکراو';
                    return [value, label];
                  }}
                  labelFormatter={(label) => `مانگ: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="received"
                  stroke={RECEIVED_COLOR}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorReceived)"
                  dot={{ r: 4, stroke: RECEIVED_COLOR, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: RECEIVED_COLOR, strokeWidth: 2, fill: '#fff' }}
                  name="received"
                >
                  <LabelList dataKey="received" position="top" offset={10} fill={RECEIVED_COLOR} fontSize={11} fontWeight="bold" />
                </Area>
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke={SENT_COLOR}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSent)"
                  dot={{ r: 4, stroke: SENT_COLOR, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, stroke: SENT_COLOR, strokeWidth: 2, fill: '#fff' }}
                  name="sent"
                >
                  <LabelList dataKey="sent" position="bottom" offset={10} fill={SENT_COLOR} fontSize={11} fontWeight="bold" />
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
              <span className="w-4 h-1 rounded-full shrink-0" style={{ backgroundColor: RECEIVED_COLOR }} />
              <span className="font-medium text-slate-600 dark:text-slate-300">پێویست بە وەڵام</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-1 rounded-full shrink-0" style={{ backgroundColor: SENT_COLOR }} />
              <span className="font-medium text-slate-600 dark:text-slate-300">سەرجەم ڕەوانەکراوەکان</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
