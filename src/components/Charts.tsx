"use client";

import React, { useMemo } from "react";
import { useData } from "../context/DataContext";
import {
  BarChart,
  ComposedChart,
  Line,
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

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, value, name, fill } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  
  // Starting point at the outer edge of the pie slice
  const sx = cx + (outerRadius) * cos;
  const sy = cy + (outerRadius) * sin;
  
  // Middle point for the elbow bend
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  
  // End point of the connecting line
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* Connecting Line */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dot at the end of the line */}
      <circle cx={ex} cy={ey} r={4} fill={fill} stroke="none" />
      {/* Label text */}
      <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} dy={4} textAnchor={textAnchor} fill={fill} className="text-[11px] font-bold" style={{ fontFamily: 'inherit' }}>
        {`${name} : ${value}`}
      </text>
    </g>
  );
};

export const DashboardCharts = () => {
  const { filteredData, setFilters, filters } = useData();

  // Prepare Department Data
  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((d) => {
      d.departments.forEach((dept) => {
        counts[dept] = (counts[dept] || 0) + 1;
      });
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

  // Prepare Enhanced SLA Data (Stacked Bar + Line)
  const slaEnhancedData = useMemo(() => {
    const groups: Record<string, { 
      name: string, 
      originalCategory: string, 
      onTime: number, 
      late: number, 
      exactOnTimeName: string, 
      exactLateName: string,
      processingTimeSum: number,
      processingTimeCount: number
    }> = {};

    let totalOnTime = 0;
    let totalLate = 0;

    filteredData.forEach((d) => {
      const sla = d.slaTime || '-';
      const category = d.letterType || 'نەزانراو';

      if (!groups[category]) {
        const cleanName = category.replace('بەشی ', '').replace('سێکتەری ', '');
        groups[category] = { 
          name: cleanName, 
          originalCategory: category, 
          onTime: 0, 
          late: 0, 
          exactOnTimeName: '', 
          exactLateName: '',
          processingTimeSum: 0,
          processingTimeCount: 0
        };
      }

      if (d.processingTime != null && !isNaN(d.processingTime)) {
        groups[category].processingTimeSum += d.processingTime;
        groups[category].processingTimeCount += 1;
      }

      const isLate = sla.includes('زیاتر');

      if (isLate) {
        groups[category].late += 1;
        groups[category].exactLateName = sla;
        totalLate += 1;
      } else {
        groups[category].onTime += 1;
        groups[category].exactOnTimeName = sla;
        if (sla !== '-') totalOnTime += 1;
      }
    });

    const data = Object.values(groups)
      .filter(g => g.onTime > 0 || g.late > 0)
      .map(g => ({
        ...g,
        complianceRate: Math.round((g.onTime / (g.onTime + g.late)) * 100) || 0,
        avgProcessingTime: g.processingTimeCount > 0 ? parseFloat((g.processingTimeSum / g.processingTimeCount).toFixed(1)) : 0
      }))
      .sort((a, b) => (b.onTime + b.late) - (a.onTime + a.late));

    return { data, totalOnTime, totalLate };
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
                labelLine={false}
                label={renderCustomizedLabel}
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

      {/* SLA Enhanced Status Chart */}
      <div className="glass glass-card glass-interactive p-6 flex flex-col min-h-96 h-auto relative overflow-hidden group lg:col-span-2">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold">کاتی تێچوو (SLA)</h3>
          {slaEnhancedData.totalOnTime + slaEnhancedData.totalLate > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((slaEnhancedData.totalOnTime / (slaEnhancedData.totalOnTime + slaEnhancedData.totalLate)) * 100)}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">ڕێژەی پابەندبوون</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-h-[300px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={slaEnhancedData.data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(241, 245, 249, 0.2)' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                content={(props: any) => {
                  const { active, payload, label } = props;
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800" dir="rtl">
                        <p className="font-bold text-slate-800 dark:text-white mb-3 pb-2 border-b border-slate-100 dark:border-slate-800 text-base">{label}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">لە کاتی خۆی (کەمتر)</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{data.onTime}</span>
                          </div>
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">دواکەوتوو (زیاتر)</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{data.late}</span>
                          </div>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">ڕێژەی پابەندبوون</span>
                            <span className="text-sm font-bold text-[#10b981]">{data.complianceRate}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-1 rounded-full bg-[#f59e0b]"></span>
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">تێکڕای کاتی تێچوو</span>
                            </div>
                            <span className="text-sm font-bold text-[#f59e0b]">{data.avgProcessingTime} ڕۆژ</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                yAxisId="left"
                dataKey="onTime" 
                stackId="a" 
                fill="#10b981" 
                maxBarSize={45}
                cursor="pointer"
                onClick={(data: any) => {
                  if (data) {
                    const newFilters: any = {};
                    if (data.originalCategory) newFilters.letterType = [data.originalCategory];
                    if (data.exactOnTimeName) newFilters.slaStatus = [data.exactOnTimeName];
                    setFilters(prev => ({ ...prev, ...newFilters }));
                    document.getElementById('data-table-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
              <Bar 
                yAxisId="left"
                dataKey="late" 
                stackId="a" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={45}
                cursor="pointer"
                onClick={(data: any) => {
                  if (data) {
                    const newFilters: any = {};
                    if (data.originalCategory) newFilters.letterType = [data.originalCategory];
                    if (data.exactLateName) newFilters.slaStatus = [data.exactLateName];
                    setFilters(prev => ({ ...prev, ...newFilters }));
                    document.getElementById('data-table-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgProcessingTime" 
                stroke="#f59e0b" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 justify-center border-t border-slate-200 dark:border-slate-800 pt-4" dir="rtl">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full shrink-0 bg-[#10b981]"></span>
            <span className="font-bold text-slate-700 dark:text-slate-300">لە کاتی خۆی (کەمتر)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full shrink-0 bg-[#ef4444]"></span>
            <span className="font-bold text-slate-700 dark:text-slate-300">دواکەوتوو (زیاتر)</span>
          </div>
          <div className="flex items-center gap-2 text-xs ml-4">
            <span className="w-4 h-1 rounded-full shrink-0 bg-[#f59e0b]"></span>
            <span className="font-bold text-slate-700 dark:text-slate-300">تێکڕای کاتی تێچوو (ڕۆژ)</span>
          </div>
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
