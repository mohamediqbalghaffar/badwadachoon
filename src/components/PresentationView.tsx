"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useData } from "../context/DataContext";
import { 
  Layers, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  Building2, 
  PieChart as PieIcon, 
  Activity, 
  AlertOctagon, 
  Award,
  Zap,
  BarChart2,
  GitCompareArrows,
  Send
} from "lucide-react";
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
import { format, parseISO, isValid, startOfMonth, parse } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export const PresentationView = () => {
  const { baseFilteredData, filteredData, data, filters, sentData, baseFilteredSentData } = useData();
  const [activeSlide, setActiveSlide] = useState(0);

  // --- Calculations ---
  const totalLetters = baseFilteredData.length;
  const pendingLetters = baseFilteredData.filter((item) => !item.responseDate).length;
  
  const completedLetters = baseFilteredData.filter((item) => item.processingTime !== null);
  const avgProcessingTime =
    completedLetters.length > 0
      ? completedLetters.reduce((acc, curr) => acc + (curr.processingTime ?? 0), 0) / completedLetters.length
      : 0;

  // Prepare Department Data
  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredData.forEach((d) => {
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
      .slice(0, 8); // Top 8 for clean display
  }, [baseFilteredData]);

  // Prepare Letter Type Data
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredData.forEach((d) => {
      counts[d.letterType] = (counts[d.letterType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => {
         const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
         const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
         const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
         return { name, value, abbr: abbr || name.charAt(0) };
    });
  }, [baseFilteredData]);

  // Prepare Timeline Data
  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredData.forEach((d) => {
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
  }, [baseFilteredData]);

  // Prepare Month Data when exactly one department is selected (web app last update)
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

  // Prepare Enhanced SLA Data
  const slaEnhancedData = useMemo(() => {
    const groups: Record<string, { name: string, onTime: number, late: number, order: number, exactOnTimeName: string, exactLateName: string }> = {
      '12': { name: '12 ڕۆژ', onTime: 0, late: 0, order: 6, exactOnTimeName: '', exactLateName: '' },
      '10': { name: '10 ڕۆژ', onTime: 0, late: 0, order: 5, exactOnTimeName: '', exactLateName: '' },
      '8': { name: '8 ڕۆژ', onTime: 0, late: 0, order: 4, exactOnTimeName: '', exactLateName: '' },
      '5': { name: '5 ڕۆژ', onTime: 0, late: 0, order: 3, exactOnTimeName: '', exactLateName: '' },
      '4': { name: '4 ڕۆژ', onTime: 0, late: 0, order: 2, exactOnTimeName: '', exactLateName: '' },
      '2': { name: '2 ڕۆژ', onTime: 0, late: 0, order: 1, exactOnTimeName: '', exactLateName: '' },
      'ڕێنمایی': { name: 'ڕێنمایی', onTime: 0, late: 0, order: 7, exactOnTimeName: '', exactLateName: '' },
      '-': { name: 'نەزانراو', onTime: 0, late: 0, order: 8, exactOnTimeName: '', exactLateName: '' },
    };

    let totalOnTime = 0;
    let totalLate = 0;

    baseFilteredData.forEach((d) => {
      const sla = d.slaTime || '-';
      
      let matchedKey = '-';
      if (sla.includes('12')) matchedKey = '12';
      else if (sla.includes('10')) matchedKey = '10';
      else if (sla.includes('8')) matchedKey = '8';
      else if (sla.includes('5')) matchedKey = '5';
      else if (sla.includes('4')) matchedKey = '4';
      else if (sla.includes('2')) matchedKey = '2';
      else if (sla.includes('ڕێنمایی')) matchedKey = 'ڕێنمایی';

      const isLate = sla.includes('زیاتر');

      if (isLate) {
        groups[matchedKey].late += 1;
        groups[matchedKey].exactLateName = sla;
        totalLate += 1;
      } else {
        groups[matchedKey].onTime += 1;
        groups[matchedKey].exactOnTimeName = sla;
        if (matchedKey !== '-' && matchedKey !== 'ڕێنمایی') totalOnTime += 1;
        if (matchedKey === 'ڕێنمایی') totalOnTime += 1;
      }
    });

    const data = Object.values(groups)
      .filter(g => g.onTime > 0 || g.late > 0)
      .sort((a, b) => a.order - b.order);

    return { data, totalOnTime, totalLate };
  }, [baseFilteredData]);

  const isSingleDeptSelected = filters.departments.length === 1;
  const chartData = isSingleDeptSelected ? monthDataForDept : deptData;
  const chartTitle = isSingleDeptSelected ? "قەبارەی نامەکان بەپێی مانگ" : "نامەکان بەپێی بەش و لایەنەکان";
  // Actual fastest replied letters (subjects and actual times)
  const fastestLetters = useMemo(() => {
    return baseFilteredData
      .filter((item) => item.processingTime !== null)
      .sort((a, b) => (a.processingTime ?? 0) - (b.processingTime ?? 0))
      .slice(0, 3);
  }, [baseFilteredData]);

  // Actual slowest replied letters (subjects and actual times)
  const slowestLetters = useMemo(() => {
    return baseFilteredData
      .filter((item) => item.processingTime !== null)
      .sort((a, b) => (b.processingTime ?? 0) - (a.processingTime ?? 0))
      .slice(0, 3);
  }, [baseFilteredData]);

  // Department pending counts
  const mostPendingDepts = useMemo(() => {
    const deptPending: Record<string, number> = {};
    baseFilteredData.forEach((item) => {
      if (!item.responseDate) {
        deptPending[item.department] = (deptPending[item.department] || 0) + 1;
      }
    });
    return Object.entries(deptPending)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [baseFilteredData]);

  // Oldest pending letters (calculated from baseFilteredData to respect active dashboard filters)
  const oldestPending = useMemo(() => {
    return baseFilteredData
      .filter((item) => !item.responseDate && item.sentDate)
      .map(item => {
        const sent = parseISO(item.sentDate!);
        const diffTime = Math.abs(new Date().getTime() - sent.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...item,
          daysPending: diffDays
        };
      })
      .sort((a, b) => b.daysPending - a.daysPending)
      .slice(0, 5);
  }, [baseFilteredData]);

  // --- Sent Data Calculations ---
  const hasSentData = sentData.length > 0;
  const slideCount = hasSentData ? 9 : 7;
  
  const totalSent = baseFilteredSentData.length;

  const deptComparisonData = useMemo(() => {
    if (!hasSentData) return [];
    const depts = new Set<string>();
    const receivedCounts: Record<string, number> = {};
    const sentCounts: Record<string, number> = {};

    baseFilteredData.forEach(d => {
      depts.add(d.department);
      receivedCounts[d.department] = (receivedCounts[d.department] || 0) + 1;
    });

    baseFilteredSentData.forEach(d => {
      depts.add(d.department);
      sentCounts[d.department] = (sentCounts[d.department] || 0) + 1;
    });

    return Array.from(depts).map(name => {
      const received = receivedCounts[name] || 0;
      const sent = sentCounts[name] || 0;
      const total = received + sent;
      const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
      const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
      const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
      return { name, received, sent, total, abbr: abbr || name.charAt(0) };
    }).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [baseFilteredData, baseFilteredSentData, hasSentData]);


  const handleNext = useCallback(() => {
    setActiveSlide((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  }, [slideCount]);

  const handlePrev = useCallback(() => {
    setActiveSlide((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  }, [slideCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handlePrev();
      } else if (e.key === "ArrowLeft" || e.key === " " || e.key === "Enter") {
        if (e.key === " ") e.preventDefault();
        handleNext();
      } else if (e.key === "Backspace") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div className="relative w-full min-h-[85vh] flex flex-col items-center justify-between overflow-hidden rounded-3xl bg-slate-900/5 dark:bg-slate-950/60 backdrop-blur-3xl border border-white/20 dark:border-slate-800/80 shadow-2xl p-6 sm:p-10 select-none">
      
      {/* Top Slide Progress and Title */}
      <div className="w-full flex justify-between items-center mb-6 z-20">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
          سڵاید {activeSlide + 1} لە {slideCount}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: slideCount }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeSlide ? "w-8 bg-blue-500" : "w-2 bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/30 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/80 text-slate-800 dark:text-white transition-all hover:scale-110 backdrop-blur-md"
      >
        <ChevronRight size={32} />
      </button>
      
      <button 
        onClick={handleNext}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/30 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/80 text-slate-800 dark:text-white transition-all hover:scale-110 backdrop-blur-md"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Slide Contents */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[500px]">
        
        {/* SLIDE 1: KPI Dashboard Summary */}
        {activeSlide === 0 && (
          <div className="w-full max-w-5xl flex flex-col items-center animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-blue-500/10 -z-10" />
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-slate-800 dark:text-slate-200">
              کورتەی ئەدای سیستەم و ئامارە بنەڕەتییەکان
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {/* Card 1 */}
              <div className="glass p-8 rounded-2xl flex flex-col items-center text-center border border-white/10 shadow-lg relative overflow-hidden group hover:scale-[1.03] transition-transform">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Layers size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">کۆی گشتی نامەکان</h3>
                <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">{totalLetters}</span>
              </div>
              {/* Card 2 */}
              <div className="glass p-8 rounded-2xl flex flex-col items-center text-center border border-white/10 shadow-lg relative overflow-hidden group hover:scale-[1.03] transition-transform">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">هەڵپەسێردراو</h3>
                <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">{pendingLetters}</span>
              </div>
              {/* Card 3 */}
              <div className="glass p-8 rounded-2xl flex flex-col items-center text-center border border-white/10 shadow-lg relative overflow-hidden group hover:scale-[1.03] transition-transform">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <Clock size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">تێکڕای کاتی وەڵامدانەوە</h3>
                <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">{avgProcessingTime.toFixed(1)} <span className="text-lg font-medium text-slate-400">ڕۆژ</span></span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Timeline Trend */}
        {activeSlide === 1 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-emerald-500/10 -z-10" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <TrendingUp className="text-emerald-500" size={32} />
                هەڵکشان و داکشانی نامەکان بەپێی کات
              </h2>
              <span className="text-sm text-slate-400">ڕەوتی گەشەکردن بەپێی مانگەکان</span>
            </div>
            <div className="w-full h-[380px] bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTimelinePres" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorTimelinePres)" 
                    dot={{ r: 6, stroke: '#10b981', strokeWidth: 3, fill: '#fff' }}
                  >
                    <LabelList dataKey="count" position="top" offset={12} fill="#10b981" fontSize={14} fontWeight="bold" />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SLIDE 3: Department Volumes */}
        {activeSlide === 2 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-blue-500/10 -z-10" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <Building2 className="text-blue-500" size={32} />
                {chartTitle}
              </h2>
              <span className="text-sm text-slate-400">
                {isSingleDeptSelected ? "ڕەوتی قەبارەی کار بەپێی مانگەکان" : "لایەنە سەرەکییەکان بەپێی قەبارەی کار"}
              </span>
            </div>
            <div className="w-full h-[380px] bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                    formatter={(value: any, name: any, props: any) => [value, props.payload.name]}
                    labelFormatter={(abbr) => {
                      const entry = chartData.find(d => d.abbr === abbr);
                      return entry ? entry.name : abbr;
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    <LabelList dataKey="count" position="top" offset={8} fill="#94a3b8" fontSize={12} fontWeight="bold" />
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center" dir="rtl">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{entry.abbr}</span>
                  <span className="text-slate-500 dark:text-slate-400">= {entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 4: Letter Types */}
        {activeSlide === 3 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10 -z-10" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <PieIcon className="text-purple-500" size={32} />
                پۆلێنکردنی جۆرەکانی نامە
              </h2>
              <span className="text-sm text-slate-400">دابەشبوونی کارەکان بەپێی بابەت</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10">
              <div className="h-[300px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-4" dir="rtl">
                {typeData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-400">{entry.value} نامە</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: SLA Status */}
        {activeSlide === 4 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-amber-500/10 -z-10" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <BarChart2 className="text-amber-500" size={32} />
                  کاتی تێچوو (SLA)
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">ڕێژەی پابەندبوون و ئامارەکانی کاتی وەڵامدانەوە</span>
              </div>
              {slaEnhancedData.totalOnTime + slaEnhancedData.totalLate > 0 && (
                <div className="flex flex-col items-end bg-white/5 dark:bg-slate-900/40 p-4 rounded-xl border border-white/10">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round((slaEnhancedData.totalOnTime / (slaEnhancedData.totalOnTime + slaEnhancedData.totalLate)) * 100)}%
                  </span>
                  <span className="text-sm text-slate-500 font-medium">پابەندبوون بە کاتی دیاریکراو</span>
                </div>
              )}
            </div>
            
            <div className="w-full h-[350px] bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaEnhancedData.data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                    formatter={(value: any, name: any, props: any) => {
                      if (name === 'onTime') return [value, props.payload.exactOnTimeName || 'کەمتر / لە کاتی'];
                      if (name === 'late') return [value, props.payload.exactLateName || 'زیاتر / دواکەوتوو'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `ئامانجی: ${label}`}
                  />
                  <Bar dataKey="onTime" stackId="a" fill="#10b981" maxBarSize={55}>
                    <LabelList dataKey="onTime" position="center" fill="#fff" fontSize={14} fontWeight="bold" />
                  </Bar>
                  <Bar dataKey="late" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={55}>
                    <LabelList dataKey="late" position="center" fill="#fff" fontSize={14} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-full bg-[#10b981]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">لە کاتی خۆی (کەمتر)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-full bg-[#ef4444]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">دواکەوتوو (زیاتر)</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: Department Insights */}
        {activeSlide === 5 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-orange-500/10 -z-10" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <Activity className="text-orange-500" size={32} />
              شیکاری کارایی لایەن و بەشەکان
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Fastest */}
              <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 text-emerald-500">
                  <Award size={24} />
                  <h3 className="font-bold text-lg">خێراترین وەڵامدانەوەکان</h3>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {fastestLetters.length > 0 ? (
                    fastestLetters.map((d, i) => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-b-0">
                        <div className="w-2/3">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-1" title={d.subject}>{d.subject}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5 line-clamp-1">{d.department}</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-500 shrink-0">{d.processingTime} ڕۆژ</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">داتا نییە</span>
                  )}
                </div>
              </div>

              {/* Slowest */}
              <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 text-red-500">
                  <AlertOctagon size={24} />
                  <h3 className="font-bold text-lg">خاوترین وەڵامدانەوەکان</h3>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {slowestLetters.length > 0 ? (
                    slowestLetters.map((d, i) => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-b-0">
                        <div className="w-2/3">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-1" title={d.subject}>{d.subject}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5 line-clamp-1">{d.department}</span>
                        </div>
                        <span className="text-sm font-bold text-red-500 shrink-0">{d.processingTime} ڕۆژ</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">داتا نییە</span>
                  )}
                </div>
              </div>

              {/* Most Pending */}
              <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 text-amber-500">
                  <Zap size={24} />
                  <h3 className="font-bold text-lg">زۆرترین کار و نامەی بەجێماو</h3>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {mostPendingDepts.length > 0 ? (
                    mostPendingDepts.map((d, i) => (
                      <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-b-0">
                        <span className="text-sm text-slate-750 dark:text-slate-300 line-clamp-1 w-2/3">{d.name}</span>
                        <span className="text-sm font-bold text-amber-500 shrink-0">{d.count} نامە</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm">داتا نییە</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SLIDE 7: Urgent Actions */}
        {activeSlide === 6 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-red-500/10 -z-10" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <AlertOctagon className="text-red-500" size={32} />
                کۆنترین کار و نامە هەڵپەسێردراوەکان
              </h2>
              <span className="text-sm text-red-400 font-semibold bg-red-500/10 px-3 py-1 rounded-full">پێویستی بە وەڵامدانەوەی خێرایە</span>
            </div>
            
            <div className="w-full overflow-hidden rounded-2xl bg-white/5 dark:bg-slate-900/40 border border-white/10">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-800/30 dark:bg-slate-950/40 text-slate-400 text-sm border-b border-white/5">
                    <th className="p-4">ژمارەی نامە</th>
                    <th className="p-4">بابەت</th>
                    <th className="p-4">لایەنی پەیوەندیدار</th>
                    <th className="p-4">رێکەوتی ناردن</th>
                    <th className="p-4 text-left">ماوەی مانەوە</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 dark:text-slate-300">
                  {oldestPending.length > 0 ? (
                    oldestPending.map((item, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono">{item.refCode}</td>
                        <td className="p-4 font-semibold line-clamp-1 max-w-[200px]">{item.subject}</td>
                        <td className="p-4">{item.department}</td>
                        <td className="p-4">{item.sentDate}</td>
                        <td className="p-4 text-left font-bold text-red-500">{item.daysPending} ڕۆژ</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">هیچ نامەیەکی هەڵپەسێردراو بوونی نییە!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SLIDE 8: Sent Summary */}
        {hasSentData && activeSlide === 7 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <Send className="text-teal-500" size={32} />
                  سەرجەم نووسراوە ڕەوانەکراوەکان
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">ئاماری گشتی نامە ڕەوانەکراوەکان</span>
              </div>
              <div className="flex flex-col items-end bg-white/5 dark:bg-slate-900/40 p-4 rounded-xl border border-white/10">
                <span className="text-4xl font-black text-teal-600 dark:text-teal-400">
                  {totalSent}
                </span>
                <span className="text-sm text-slate-500 font-medium">کۆی نامەکان</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                <Layers className="text-blue-500 mb-4 relative z-10" size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{totalLetters}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">پێویست بە وەڵام</span>
              </div>
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors" />
                <Send className="text-teal-500 mb-4 relative z-10" size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{totalSent}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">سەرجەم ڕەوانەکراوەکان</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 9: Comparison Chart */}
        {hasSentData && activeSlide === 8 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-indigo-500/10 -z-10" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <GitCompareArrows className="text-indigo-500" size={32} />
              بەراوردی قەبارەی کارەکان بەپێی بەشەکان
            </h2>
            
            <div className="w-full h-[350px] bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptComparisonData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                  />
                  <Bar dataKey="received" name="پێویست بە وەڵام" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="sent" name="سەرجەم ڕەوانەکراوەکان" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm bg-[#3b82f6]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">پێویست بە وەڵام</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm bg-[#06b6d4]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">سەرجەم ڕەوانەکراوەکان</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Slide Navigation Hints */}
      <div className="mt-6 text-center text-xs text-slate-400">
        بۆ گۆڕینی سڵایدەکان دەتوانیت لای چەپ/ڕاست یان دوگمەکانی <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter</kbd> و <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> بەکاربهێنیت.
      </div>

    </div>
  );
};
