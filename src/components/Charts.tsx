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
} from "recharts";
import { format, parseISO, isValid, startOfMonth, parse, endOfMonth } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export const DashboardCharts = () => {
  const { filteredData, setFilters } = useData();

  // Prepare Department Data
  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((d) => {
      counts[d.department] = (counts[d.department] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => {
         const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
         const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
         const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
         return { name, count, abbr: abbr || name.charAt(0) };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }, [filteredData]);

  // Prepare Letter Type Data
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((d) => {
      counts[d.letterType] = (counts[d.letterType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Prepare Timeline Data (By Month)
  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          counts[monthStr] = (counts[monthStr] || 0) + 1;
        }
      }
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Department Bar Chart */}
      <div className="glass glass-card p-6 flex flex-col min-h-96 h-auto">
        <h3 className="text-lg font-semibold mb-6">قەبارەی نامەکان بەپێی لایەن</h3>
        <div className="flex-1 min-h-[300px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="abbr" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(241, 245, 249, 0.2)' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
                formatter={(value: any, name: any, props: any) => [value, props.payload.name]}
                labelFormatter={(abbr) => {
                  const dept = deptData.find(d => d.abbr === abbr);
                  return dept ? dept.name : abbr;
                }}
              />
              <Bar 
                dataKey="count" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={50} 
                onClick={(data: any) => {
                  if (data && data.name) {
                    setFilters(prev => ({ ...prev, departments: [data.name as string] }));
                    document.getElementById('data-table-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
                cursor="pointer" 
              >
                <LabelList dataKey="abbr" position="top" fill="#64748b" fontSize={12} fontWeight="bold" />
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend for Abbreviations */}
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
      <div className="glass glass-card p-6 flex flex-col h-96">
        <h3 className="text-lg font-semibold mb-6">پۆلێنکردنی جۆری نامەکان</h3>
        <div className="flex-1 min-h-0" dir="ltr">
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
                onClick={(data: any) => {
                  if (data && data.name) {
                    setFilters(prev => ({ ...prev, letterType: data.name as string }));
                    document.getElementById('data-table-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                cursor="pointer"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Area Chart - Full Width */}
      <div className="glass glass-card p-6 flex flex-col h-96 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-6">هەڵکشان و داکشانی نامەکان بەپێی کات</h3>
        <div className="flex-1 min-h-0" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={timelineData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  const monthStr = e.activePayload[0].payload.date;
                  const date = parse(monthStr, 'yyyy-MM', new Date());
                  const start = format(date, 'yyyy-MM-dd');
                  const end = format(endOfMonth(date), 'yyyy-MM-dd');
                  setFilters(prev => ({ ...prev, dateRange: { start, end } }));
                  document.getElementById('data-table-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <defs>
                <linearGradient id="colorTimeline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
              />
              <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTimeline)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
