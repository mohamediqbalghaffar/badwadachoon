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
  const { filteredData, setFilters, filters } = useData();

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
    return Object.entries(counts).map(([name, value]) => {
         const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
         const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
         const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
         return { name, value, abbr: abbr || name.charAt(0) };
    });
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

  // Prepare Month Data when exactly one department is selected
  const monthDataForDept = useMemo(() => {
    if (filters.departments.length !== 1) return [];
    
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
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => {
        const dateObj = parse(date, 'yyyy-MM', new Date());
        const monthIndex = dateObj.getMonth();
        const kurdishMonths = [
          "کانوونی دووەم", "شوبات", "ئازار", "نیسان", "ئایار", "حوزەیران",
          "تەممووز", "ئاب", "ئەیلوول", "تشرینی یەکەم", "تشرینی دووەم", "کانوونی یەکەم"
        ];
        const monthName = `${kurdishMonths[monthIndex]} ${dateObj.getFullYear()}`;
        const abbr = format(dateObj, 'yyyy-MM');
        return { name: monthName, count, abbr };
      });
  }, [filteredData, filters.departments]);

  const isSingleDeptSelected = filters.departments.length === 1;
  const chartData = isSingleDeptSelected ? monthDataForDept : deptData;
  const chartTitle = isSingleDeptSelected ? "قەبارەی نامەکان بەپێی مانگ" : "قەبارەی نامەکان بەپێی لایەن";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Department Bar Chart */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 h-auto relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <h3 className="text-lg font-semibold mb-6">{chartTitle}</h3>
        <div className="flex-1 min-h-[300px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="abbr" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(241, 245, 249, 0.2)' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
                formatter={(value: any, name: any, props: any) => [value, props.payload.name]}
                labelFormatter={(abbr) => {
                  const entry = chartData.find(d => d.abbr === abbr);
                  return entry ? entry.name : abbr;
                }}
              />
              <Bar 
                dataKey="count" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={50} 
                onClick={(data: any) => {
                  if (isSingleDeptSelected) return;
                  if (data && data.name) {
                    setFilters(prev => ({ ...prev, departments: [data.name as string] }));
                    document.getElementById('data-table-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
                cursor={isSingleDeptSelected ? "default" : "pointer"} 
              >
                <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} fontWeight="bold" />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend for Abbreviations */}
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 justify-center border-t border-slate-200 dark:border-slate-800 pt-4" dir="rtl">
          {chartData.map((entry, index) => (
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
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <h3 className="text-lg font-semibold mb-6">پۆلێنکردنی جۆری نامەکان</h3>
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
                onClick={(data: any) => {
                  if (data && data.name) {
                    setFilters(prev => ({ ...prev, letterType: [data.name as string] }));
                    document.getElementById('data-table-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                cursor="pointer"
              >
                <LabelList dataKey="abbr" position="inside" fill="#ffffff" fontSize={14} fontWeight="bold" />
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: 'rgba(241, 245, 249, 0.2)' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
                formatter={(value: any, name: any, props: any) => [value, props.payload.name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend for Abbreviations */}
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

      {/* Timeline Area Chart - Full Width */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col h-96 lg:col-span-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorTimeline)" 
                dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
              >
                <LabelList dataKey="count" position="top" offset={10} fill="#10b981" fontSize={12} fontWeight="bold" />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
