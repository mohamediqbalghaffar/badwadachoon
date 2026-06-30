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
  Send,
  Lightbulb,
  LightbulbOff,
  Inbox,
  ArrowDownToLine
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
import { format, parseISO, isValid, startOfMonth, parse } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export const PresentationView = () => {
  const { baseFilteredData, filteredData, data, filters, sentData, baseFilteredSentData, incomingData, baseFilteredIncomingData } = useData();
  const [activeSlide, setActiveSlide] = useState(0);
  const [showInsights, setShowInsights] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // --- Calculations ---
  const totalLetters = baseFilteredData.length;
  const pendingLetters = baseFilteredData.filter((item) => !item.responseDate).length;
  
  const completedLetters = baseFilteredData.filter((item) => item.processingTime !== null);
  const avgProcessingTime =
    completedLetters.length > 0
      ? completedLetters.reduce((acc, curr) => acc + (curr.processingTime ?? 0), 0) / completedLetters.length
      : 0;

  // Prepare Department Data

  type DataSourceType = 'received' | 'sent' | 'incoming';
  const [compSourceA, setCompSourceA] = useState<DataSourceType>('received');
  const [compSourceB, setCompSourceB] = useState<DataSourceType>('sent');

  const getSourceConfig = (type: DataSourceType) => {
    switch (type) {
      case 'received':
        return { id: 'received', data: baseFilteredData, name: 'پێویست بە وەڵام', color: '#3b82f6', gradientText: 'from-blue-600 to-blue-400', gradientBg: 'from-blue-500 to-blue-400', lightBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', glow: 'bg-blue-500/10 group-hover:bg-blue-500/20', borderOverlay: 'from-blue-500 to-transparent', icon: Inbox };
      case 'sent':
        return { id: 'sent', data: baseFilteredSentData, name: 'سەرجەم ڕەوانەکراوەکان', color: '#06b6d4', gradientText: 'from-cyan-500 to-teal-400', gradientBg: 'from-cyan-400 to-cyan-500', lightBg: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600 dark:text-cyan-400', glow: 'bg-cyan-500/10 group-hover:bg-cyan-500/20', borderOverlay: 'from-cyan-500 to-transparent', icon: Send };
      case 'incoming':
        return { id: 'incoming', data: baseFilteredIncomingData, name: 'سەرجەم هاتووەکان', color: '#8b5cf6', gradientText: 'from-purple-600 to-purple-400', gradientBg: 'from-purple-500 to-purple-400', lightBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400', glow: 'bg-purple-500/10 group-hover:bg-purple-500/20', borderOverlay: 'from-purple-500 to-transparent', icon: ArrowDownToLine };
    }
  };

  const compConfigA = getSourceConfig(compSourceA);
  const compConfigB = getSourceConfig(compSourceB);
  const compCountA = compConfigA.data.length;
  const compCountB = compConfigB.data.length;

  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredData.forEach((d) => {
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

    baseFilteredData.forEach((d) => {
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
  }, [baseFilteredData]);

  const isSingleDeptSelected = filters.departments.length === 1;
  const chartData = isSingleDeptSelected ? monthDataForDept : deptData;
  const chartTitle = isSingleDeptSelected ? "ژمارەی نامەکان بەپێی مانگ" : "نامەکان بەپێی بەش و لایەنەکان";
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
        item.departments.forEach((dept) => {
          deptPending[dept] = (deptPending[dept] || 0) + 1;
        });
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
    const hasIncomingData = incomingData.length > 0;
  const { activeView, setActiveView } = useData();

  const slideCount = useMemo(() => {
    if (activeView === 'incoming') return 4;
      if (activeView === 'sent') return 4;
    if (activeView === 'comparison') return 3;
    return 7;
  }, [activeView]);
  
  const totalSent = baseFilteredSentData.length;

  const sentTimelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredSentData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          counts[monthStr] = (counts[monthStr] || 0) + 1;
        }
      }
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [baseFilteredSentData]);

  const sentDeptData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredSentData.forEach((d) => {
      d.departments.forEach((dept) => counts[dept] = (counts[dept] || 0) + 1);
    });
    return Object.entries(counts).map(([name, count]) => {
         const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
         const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
         const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
         return { name, count, abbr: abbr || name.charAt(0) };
    }).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [baseFilteredSentData]);

  const sentTypeDataPres = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredSentData.forEach((d) => counts[d.letterType] = (counts[d.letterType] || 0) + 1);
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
  }, [baseFilteredSentData]);

  const totalIncoming = baseFilteredIncomingData.length;

  const incomingTimelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredIncomingData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          counts[monthStr] = (counts[monthStr] || 0) + 1;
        }
      }
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [baseFilteredIncomingData]);

  const incomingDeptData = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredIncomingData.forEach((d) => {
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
  }, [baseFilteredIncomingData]);

  const incomingTypeDataPres = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFilteredIncomingData.forEach((d) => counts[d.letterType] = (counts[d.letterType] || 0) + 1);
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
  }, [baseFilteredIncomingData]);

  const timelineDataComparison = useMemo(() => {
    const rByMonth: Record<string, number> = {};
    const sByMonth: Record<string, number> = {};
    compConfigA.data.forEach((d: any) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          rByMonth[monthStr] = (rByMonth[monthStr] || 0) + 1;
        }
      }
    });
    compConfigB.data.forEach((d: any) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          sByMonth[monthStr] = (sByMonth[monthStr] || 0) + 1;
        }
      }
    });
    const allMonths = new Set([...Object.keys(rByMonth), ...Object.keys(sByMonth)]);
    return Array.from(allMonths).sort((a, b) => a.localeCompare(b)).map((month) => ({
      date: month, received: rByMonth[month] || 0, sent: sByMonth[month] || 0,
    }));
  }, [compConfigA.data, compConfigB.data]);

  const deptComparisonData = useMemo(() => {
    if (compCountA === 0 && compCountB === 0) return [];
    const depts = new Set<string>();
    const receivedCounts: Record<string, number> = {};
    const sentCounts: Record<string, number> = {};

    compConfigA.data.forEach((d: any) => {
      if (Array.isArray(d.departments) && d.departments.length > 0) {
        d.departments.forEach((dept: string) => {
          depts.add(dept);
          receivedCounts[dept] = (receivedCounts[dept] || 0) + 1;
        });
      } else if (d.sender) {
        depts.add(d.sender);
        receivedCounts[d.sender] = (receivedCounts[d.sender] || 0) + 1;
      }
    });

    compConfigB.data.forEach((d: any) => {
      if (Array.isArray(d.departments) && d.departments.length > 0) {
        d.departments.forEach((dept: string) => {
          depts.add(dept);
          sentCounts[dept] = (sentCounts[dept] || 0) + 1;
        });
      } else if (d.sender) {
        depts.add(d.sender);
        sentCounts[d.sender] = (sentCounts[d.sender] || 0) + 1;
      }
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
  }, [compConfigA.data, compConfigB.data]);


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
      <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 z-20">
        <div className="flex gap-4 items-center">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
            سڵاید {activeSlide + 1} لە {slideCount}
          </span>
          <button 
            onClick={() => setShowInsights(!showInsights)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${showInsights ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}
          >
            {showInsights ? <Lightbulb size={16} className="text-amber-500" /> : <LightbulbOff size={16} />}
            <span className="hidden sm:inline">{showInsights ? 'شیکاری هۆشمەند چالاکە' : 'شیکاری هۆشمەند'}</span>
          </button>
        </div>

        {/* TOP CENTER: View Toggle */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-md shadow-sm border border-white/20 dark:border-slate-700/50">
          <button 
            onClick={() => { setActiveView('incoming'); setActiveSlide(0); }} 
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'incoming' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <ArrowDownToLine size={18} />
            سەرجەم هاتووەکان
          </button>
          <button 
            onClick={() => { setActiveView('received'); setActiveSlide(0); }} 
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'received' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Inbox size={16} />
            پێویست بە وەڵام
          </button>
          <button 
            onClick={() => { setActiveView('sent'); setActiveSlide(0); }} 
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'sent' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Send size={16} />
            سەرجەم ڕەوانەکراوەکان
          </button>
          <button 
            onClick={() => { setActiveView('comparison'); setActiveSlide(0); }} 
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'comparison' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <GitCompareArrows size={16} />
            بەراوردکردن
          </button>
        </div>
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
        <AnimatePresence mode="wait">
        
        {/* SLIDE 1: KPI Dashboard Summary */}
        {activeView === 'received' && activeSlide === 0 && (
          <motion.div key="rec-slide-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col items-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-blue-500/10 -z-10" />
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-center mb-10 text-slate-800 dark:text-slate-200">
              کورتەی ئەدای سیستەم و ئامارە بنەڕەتییەکان
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {/* Card 1 */}
              <motion.div variants={itemVariants} className="glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:scale-[1.03] transition-transform backdrop-blur-3xl">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Layers size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">کۆی گشتی نامەکان</h3>
                <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">{totalLetters}</span>
              </motion.div>
              {/* Card 2 */}
              <motion.div variants={itemVariants} className="glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:scale-[1.03] transition-transform backdrop-blur-3xl">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">هەڵپەسێردراو</h3>
                <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">{pendingLetters}</span>
              </motion.div>
              {/* Card 3 */}
              <motion.div variants={itemVariants} className="glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:scale-[1.03] transition-transform backdrop-blur-3xl">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <Clock size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-2">تێکڕای کاتی وەڵامدانەوە</h3>
                <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">{avgProcessingTime.toFixed(1)} <span className="text-lg font-medium text-slate-400">ڕۆژ</span></span>
              </motion.div>
            </div>
            {showInsights && (
              <motion.div variants={itemVariants} className="mt-8 p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-amber-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-amber-600 dark:text-amber-400">شیکاری هۆشمەند: </strong> 
                  لە کۆی گشتی <strong className="text-blue-500">{totalLetters}</strong> نامە، تەنها <strong className="text-amber-500">{pendingLetters}</strong> نامە هەڵپەسێردراون، کە دەکاتە <strong className="text-emerald-500">{Math.round(((totalLetters - pendingLetters) / Math.max(totalLetters, 1)) * 100)}%</strong> ڕێژەی تەواوبوون بە تێکڕای کاتی <strong className="text-teal-500">{avgProcessingTime.toFixed(1)}</strong> ڕۆژ.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SLIDE 2: Timeline Trend */}
        {activeView === 'received' && activeSlide === 1 && (
          <motion.div key="rec-slide-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-emerald-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <TrendingUp className="text-emerald-500" size={32} />
                هەڵکشان و داکشانی نامەکان بەپێی کات
              </h2>
              <span className="text-sm text-slate-400">ڕەوتی گەشەکردن بەپێی مانگەکان</span>
            </motion.div>
            <motion.div variants={itemVariants} className="w-full h-[380px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
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
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorTimelinePres)" dot={{ r: 6, stroke: '#10b981', strokeWidth: 3, fill: '#fff' }}>
                    <LabelList dataKey="count" position="top" offset={12} fill="#10b981" fontSize={14} fontWeight="bold" />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
            {showInsights && timelineData.length >= 2 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-emerald-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-emerald-600 dark:text-emerald-400">شیکاری هۆشمەند: </strong> 
                  زۆرترین نامە لە مانگی <strong className="text-emerald-500">{[...timelineData].sort((a,b)=>b.count-a.count)[0].date}</strong> دا تۆمارکراوە بە بڕی <strong className="text-emerald-500">{[...timelineData].sort((a,b)=>b.count-a.count)[0].count}</strong> نامە. ڕەوتی گشتی کارەکان بەپێی کات گۆڕانکاری بەسەردا هاتووە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SLIDE 3: Department Volumes */}
        {activeView === 'received' && activeSlide === 2 && (
          <motion.div key="rec-slide-2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-blue-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <Building2 className="text-blue-500" size={32} />
                {chartTitle}
              </h2>
              <span className="text-sm text-slate-400">
                {isSingleDeptSelected ? "ڕەوتی ژمارەی کار بەپێی مانگەکان" : "لایەنە سەرەکییەکان بەپێی ژمارەی کار"}
              </span>
            </motion.div>
            <motion.div variants={itemVariants} className="w-full h-[380px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
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
            </motion.div>
            <motion.div variants={itemVariants} className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center" dir="rtl">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{entry.abbr}</span>
                  <span className="text-slate-500 dark:text-slate-400">= {entry.name}</span>
                </div>
              ))}
            </motion.div>
            {showInsights && chartData.length > 0 && (
              <motion.div variants={itemVariants} className="mt-4 p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-blue-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-blue-600 dark:text-blue-400">شیکاری هۆشمەند: </strong> 
                  زۆرترین پاڵەپەستۆی کار لەسەر <strong className="text-blue-500">{(chartData[0] as any).name || (chartData[0] as any).date}</strong>ە بە ژمارەی <strong className="text-blue-500">{(chartData[0] as any).count}</strong> نامە، کە دەکاتە نزیکەی <strong className="text-emerald-500">{Math.round(((chartData[0] as any).count / Math.max(totalLetters, 1)) * 100)}%</strong>ی کۆی گشتی کارەکان.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SLIDE 4: Letter Types */}
        {activeView === 'received' && activeSlide === 3 && (
          <motion.div key="rec-slide-3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <PieIcon className="text-purple-500" size={32} />
                پۆلێنکردنی جۆرەکانی نامە
              </h2>
              <span className="text-sm text-slate-400">دابەشبوونی کارەکان بەپێی بابەت</span>
            </motion.div>
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl">
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
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5 hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-400">{entry.value} نامە</span>
                  </div>
                ))}
              </div>
            </motion.div>
            {showInsights && typeData.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-blue-500/10 to-blue-400/10 border border-blue-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-blue-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-blue-600 dark:text-blue-400">شیکاری هۆشمەند: </strong> 
                  زۆرترین جۆری نامە پێکهاتووە لە <strong className="text-blue-500">{[...typeData].sort((a,b)=>b.value-a.value)[0].name}</strong> بە ڕێژەی بەرچاو.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SLIDE 5: SLA Status */}
        {activeView === 'received' && activeSlide === 4 && (
          <motion.div key="rec-slide-4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-amber-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <BarChart2 className="text-amber-500" size={32} />
                  کاتی تێچوو (SLA)
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">ڕێژەی پابەندبوون و ئامارەکانی کاتی وەڵامدانەوە</span>
              </div>
              {slaEnhancedData.totalOnTime + slaEnhancedData.totalLate > 0 && (
                <div className="flex flex-col items-end glass p-4 rounded-2xl border-t border-t-white/30 border-l border-l-white/20 shadow-lg">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round((slaEnhancedData.totalOnTime / (slaEnhancedData.totalOnTime + slaEnhancedData.totalLate)) * 100)}%
                  </span>
                  <span className="text-sm text-slate-500 font-medium">پابەندبوون بە کاتی دیاریکراو</span>
                </div>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants} className="w-full h-[350px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={slaEnhancedData.data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    content={(props: any) => {
                      const { active, payload, label } = props;
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 p-4 rounded-2xl shadow-xl border border-slate-700" dir="rtl">
                            <p className="font-bold text-white mb-3 pb-2 border-b border-slate-700 text-base">{label}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                                  <span className="text-sm font-medium text-slate-300">لە کاتی خۆی (کەمتر)</span>
                                </div>
                                <span className="text-sm font-bold text-white">{data.onTime}</span>
                              </div>
                              <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                                  <span className="text-sm font-medium text-slate-300">دواکەوتوو (زیاتر)</span>
                                </div>
                                <span className="text-sm font-bold text-white">{data.late}</span>
                              </div>
                              <div className="h-px bg-slate-700 my-2"></div>
                              <div className="flex items-center justify-between gap-6">
                                <span className="text-sm font-medium text-slate-300">ڕێژەی پابەندبوون</span>
                                <span className="text-sm font-bold text-[#10b981]">{data.complianceRate}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-1 rounded-full bg-[#f59e0b]"></span>
                                  <span className="text-sm font-medium text-slate-300">تێکڕای کاتی تێچوو</span>
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
                  <Bar yAxisId="left" dataKey="onTime" stackId="a" fill="#10b981" maxBarSize={55}>
                    <LabelList dataKey="onTime" position="center" fill="#fff" fontSize={14} fontWeight="bold" />
                  </Bar>
                  <Bar yAxisId="left" dataKey="late" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={55}>
                    <LabelList dataKey="late" position="center" fill="#fff" fontSize={14} fontWeight="bold" />
                  </Bar>
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
            </motion.div>
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-x-8 gap-y-2 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-full bg-[#10b981]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">لە کاتی خۆی (کەمتر)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-full bg-[#ef4444]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">دواکەوتوو (زیاتر)</span>
              </div>
              <div className="flex items-center gap-2 text-sm ml-4">
                <span className="w-5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">تێکڕای کاتی تێچوو (ڕۆژ)</span>
              </div>
            </motion.div>
            {showInsights && slaEnhancedData.data.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-amber-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-amber-600 dark:text-amber-400">شیکاری هۆشمەند: </strong> 
                  ڕێژەی گشتی پابەندبوون بە کات <strong className="text-emerald-500">{Math.round((slaEnhancedData.totalOnTime / (slaEnhancedData.totalOnTime + slaEnhancedData.totalLate)) * 100)}%</strong>ە. ئەو جۆرە نامانەی زۆرترین ڕێژەی دواکەوتنیان هەیە بریتین لە جۆری <strong className="text-red-500">{[...slaEnhancedData.data].sort((a,b)=>b.late-a.late)[0]?.name || '-'}</strong>. تەرکیز کردن لەسەر خێراکردنی ئەم جۆرە، ڕێژەی پابەندبوونی گشتی بەرز دەکاتەوە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SLIDE 6: Department Insights */}
        {activeView === 'received' && activeSlide === 5 && (
          <motion.div key="rec-slide-5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-orange-500/10 -z-10" />
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <Activity className="text-orange-500" size={32} />
              شیکاری کارایی لایەن و بەشەکان
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              
              {/* Fastest */}
              <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-4 backdrop-blur-3xl group hover:scale-[1.02] transition-transform">
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
              </motion.div>

              {/* Slowest */}
              <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-4 backdrop-blur-3xl group hover:scale-[1.02] transition-transform">
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
              </motion.div>

              {/* Most Pending */}
              <motion.div variants={itemVariants} className="glass p-6 rounded-3xl border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-4 backdrop-blur-3xl group hover:scale-[1.02] transition-transform">
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
              </motion.div>
            </div>
            {showInsights && mostPendingDepts.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border border-emerald-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-emerald-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-emerald-600 dark:text-emerald-400">شیکاری هۆشمەند: </strong> 
                  بەشی <strong className="text-emerald-500">{[...mostPendingDepts].sort((a,b)=>b.count-a.count)[0].name}</strong> زۆرترین نامەی هەڵپەسێردراوی هەیە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SLIDE 7: Urgent Actions */}
        {activeView === 'received' && activeSlide === 6 && (
          <motion.div key="rec-slide-6" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-red-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <AlertOctagon className="text-red-500" size={32} />
                کۆنترین کار و نامە هەڵپەسێردراوەکان
              </h2>
              <span className="text-sm text-red-400 font-semibold bg-red-500/10 px-3 py-1 rounded-full">پێویستی بە وەڵامدانەوەی خێرایە</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="w-full overflow-hidden rounded-3xl glass border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl">
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
                      <tr key={index} className="border-b border-white/5 hover:bg-slate-800/10 transition-colors">
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
            </motion.div>
            {showInsights && oldestPending.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-red-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-red-600 dark:text-red-400">شیکاری هۆشمەند: </strong> 
                  کۆنترین نامەی هەڵپەسێردراو تەمەنی گەیشتووەتە <strong className="text-red-500">{oldestPending[0].daysPending}</strong> ڕۆژ. پێویستە دەستبەجێ بەدواداچوون بۆ ئەم {oldestPending.length} کارە بکرێت بۆ ئەوەی ڕێژەی پابەندبوون دانەبەزێت.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        
        {/* ===================== SENT SLIDES ===================== */}
        {/* SENT SLIDE 0: Summary */}
        {activeView === 'sent' && activeSlide === 0 && (
          <motion.div key="sent-slide-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <Send className="text-teal-500" size={32} />
                  سەرجەم نووسراوە ڕەوانەکراوەکان
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">ئاماری گشتی نامە ڕەوانەکراوەکان</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 mt-4">
              <div className="glass p-12 rounded-3xl flex flex-col items-center justify-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors" />
                <Send className="text-teal-500 mb-6 relative z-10" size={56} />
                <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 mb-4 relative z-10">{totalSent}</span>
                <span className="text-xl text-slate-500 font-bold relative z-10">سەرجەم ڕەوانەکراوەکان</span>
              </div>
            </motion.div>
            {showInsights && true && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-teal-500/10 to-teal-400/10 border border-teal-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-teal-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-teal-600 dark:text-teal-400">شیکاری هۆشمەند: </strong> 
                  سەرجەم نامە ڕەوانەکراوەکان گەیشتوونەتە <strong className="text-teal-500">{totalSent}</strong> نامە، کە ئەمەش پیشاندەری ئاستی کارایی و خێرایی بەشەکانە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SENT SLIDE 1: Timeline Trend */}
        {activeView === 'sent' && activeSlide === 1 && (
          <motion.div key="sent-slide-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <TrendingUp className="text-teal-500" size={32} />
                هەڵکشان و داکشانی نامە ڕەوانەکراوەکان
              </h2>
            </motion.div>
            <motion.div variants={itemVariants} className="w-full h-[380px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentTimelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTimelineSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorTimelineSent)" dot={{ r: 6, stroke: '#06b6d4', strokeWidth: 3, fill: '#fff' }}>
                    <LabelList dataKey="count" position="top" offset={12} fill="#06b6d4" fontSize={14} fontWeight="bold" />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
            {showInsights && sentTimelineData.length >= 2 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-teal-500/10 to-teal-400/10 border border-teal-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-teal-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-teal-600 dark:text-teal-400">شیکاری هۆشمەند: </strong> 
                  لووتکەی نامە ڕەوانەکراوەکان لە مانگی <strong className="text-teal-500">{[...sentTimelineData].sort((a,b)=>b.count-a.count)[0].date}</strong> دا بووە بە بڕی <strong className="text-teal-500">{[...sentTimelineData].sort((a,b)=>b.count-a.count)[0].count}</strong> نامە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SENT SLIDE 2: Depts */}
        {activeView === 'sent' && activeSlide === 2 && (
          <motion.div key="sent-slide-2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <Building2 className="text-teal-500" size={32} />
                لایەنە سەرەکییەکان بەپێی نامەی ڕەوانەکراو
              </h2>
            </motion.div>
            <motion.div variants={itemVariants} className="w-full h-[380px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentDeptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} formatter={(value, name, props) => [value, props.payload.name]} labelFormatter={(abbr) => { const entry = sentDeptData.find(d => d.abbr === abbr); return entry ? entry.name : abbr; }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    <LabelList dataKey="count" position="top" offset={8} fill="#94a3b8" fontSize={12} fontWeight="bold" />
                    {sentDeptData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            {showInsights && sentDeptData.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-cyan-500/10 to-cyan-400/10 border border-cyan-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-cyan-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-cyan-600 dark:text-cyan-400">شیکاری هۆشمەند: </strong> 
                  بەشی <strong className="text-cyan-500">{[...sentDeptData].sort((a,b)=>b.count-a.count)[0].name}</strong> زۆرترین ڕێژەی نامەی ڕەوانەکراوی هەیە بە <strong className="text-cyan-500">{[...sentDeptData].sort((a,b)=>b.count-a.count)[0].count}</strong> نامە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SENT SLIDE 3: Types */}
        {activeView === 'sent' && activeSlide === 3 && (
          <motion.div key="sent-slide-3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <PieIcon className="text-purple-500" size={32} />
                جۆری نامە ڕەوانەکراوەکان
              </h2>
            </motion.div>
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl">
              <div className="h-[300px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentTypeDataPres} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {sentTypeDataPres.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-4" dir="rtl">
                {sentTypeDataPres.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5 hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-400">{entry.value} نامە</span>
                  </div>
                ))}
              </div>
            </motion.div>
            {showInsights && sentTypeDataPres.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-cyan-500/10 to-cyan-400/10 border border-cyan-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-cyan-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-cyan-600 dark:text-cyan-400">شیکاری هۆشمەند: </strong> 
                  جۆری <strong className="text-cyan-500">{[...sentTypeDataPres].sort((a,b)=>b.value-a.value)[0].name}</strong> بەربڵاوترین جۆری نامەی ڕەوانەکراوە بە <strong className="text-cyan-500">{[...sentTypeDataPres].sort((a,b)=>b.value-a.value)[0].value}</strong> نامە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ===================== INCOMING SLIDES ===================== */}
        {/* INCOMING SLIDE 0: Summary */}
        {activeView === 'incoming' && activeSlide === 0 && (
          <motion.div key="incoming-slide-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <Send className="text-teal-500" size={32} />
                  سەرجەم هاتووەکان
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">ئاماری گشتی نامە هاتووەکان</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 mt-4">
              <div className="glass p-12 rounded-3xl flex flex-col items-center justify-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors" />
                <Send className="text-teal-500 mb-6 relative z-10" size={56} />
                <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 mb-4 relative z-10">{totalIncoming}</span>
                <span className="text-xl text-slate-500 font-bold relative z-10">سەرجەم هاتووەکان</span>
              </div>
            </motion.div>
            {showInsights && true && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-purple-500/10 to-purple-400/10 border border-purple-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-purple-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-purple-600 dark:text-purple-400">شیکاری هۆشمەند: </strong> 
                  ژمارەی نامە هاتووەکان گەیشتووەتە <strong className="text-purple-500">{totalIncoming}</strong> نامە، کە پێویستیان بە ڕێکخستن و وەڵامدانەوەیە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* INCOMING SLIDE 1: Timeline Trend */}
        {activeView === 'incoming' && activeSlide === 1 && (
          <motion.div key="incoming-slide-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <TrendingUp className="text-teal-500" size={32} />
                هەڵکشان و داکشانی نامە هاتووەکان
              </h2>
            </motion.div>
            <motion.div variants={itemVariants} className="w-full h-[380px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incomingTimelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTimelineSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorTimelineSent)" dot={{ r: 6, stroke: '#06b6d4', strokeWidth: 3, fill: '#fff' }}>
                    <LabelList dataKey="count" position="top" offset={12} fill="#06b6d4" fontSize={14} fontWeight="bold" />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
            {showInsights && incomingTimelineData.length >= 2 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-fuchsia-500/10 to-fuchsia-400/10 border border-fuchsia-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-fuchsia-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-fuchsia-600 dark:text-fuchsia-400">شیکاری هۆشمەند: </strong> 
                  زۆرترین نامەی هاتوو لە مانگی <strong className="text-fuchsia-500">{[...incomingTimelineData].sort((a,b)=>b.count-a.count)[0].date}</strong> دا تۆمارکراوە بە بڕی <strong className="text-fuchsia-500">{[...incomingTimelineData].sort((a,b)=>b.count-a.count)[0].count}</strong> نامە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* INCOMING SLIDE 2: Depts */}
        {activeView === 'incoming' && activeSlide === 2 && (
          <motion.div key="incoming-slide-2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <Building2 className="text-teal-500" size={32} />
                لایەنە سەرەکییەکان بەپێی نامەی هاتوو
              </h2>
            </motion.div>
            <motion.div variants={itemVariants} className="w-full h-[380px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomingDeptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} formatter={(value, name, props) => [value, props.payload.name]} labelFormatter={(abbr) => { const entry = incomingDeptData.find(d => d.abbr === abbr); return entry ? entry.name : abbr; }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    <LabelList dataKey="count" position="top" offset={8} fill="#94a3b8" fontSize={12} fontWeight="bold" />
                    {incomingDeptData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            {showInsights && incomingDeptData.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-purple-500/10 to-purple-400/10 border border-purple-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-purple-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-purple-600 dark:text-purple-400">شیکاری هۆشمەند: </strong> 
                  بەشی <strong className="text-purple-500">{[...incomingDeptData].sort((a,b)=>b.count-a.count)[0].name}</strong> زۆرترین نامەی ئاراستە کراوە بە <strong className="text-purple-500">{[...incomingDeptData].sort((a,b)=>b.count-a.count)[0].count}</strong> نامە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* INCOMING SLIDE 3: Types */}
        {activeView === 'incoming' && activeSlide === 3 && (
          <motion.div key="incoming-slide-3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <PieIcon className="text-purple-500" size={32} />
                جۆری نامە هاتووەکان
              </h2>
            </motion.div>
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl">
              <div className="h-[300px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomingTypeDataPres} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {incomingTypeDataPres.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-4" dir="rtl">
                {incomingTypeDataPres.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5 hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-400">{entry.value} نامە</span>
                  </div>
                ))}
              </div>
            </motion.div>
            {showInsights && incomingTypeDataPres.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-purple-500/10 to-purple-400/10 border border-purple-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-purple-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-purple-600 dark:text-purple-400">شیکاری هۆشمەند: </strong> 
                  سەرەکیترین جۆری نامەی هاتوو بریتییە لە <strong className="text-purple-500">{[...incomingTypeDataPres].sort((a,b)=>b.value-a.value)[0].name}</strong> بە بڕی <strong className="text-purple-500">{[...incomingTypeDataPres].sort((a,b)=>b.value-a.value)[0].value}</strong> نامە.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        
        {/* ===================== COMPARISON SLIDES ===================== */}

        {/* Dynamic Selector for Comparison Slides */}
        {activeView === 'comparison' && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-white/10 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-slate-200/20 shadow-lg">
            <select 
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none font-bold text-sm px-2 cursor-pointer"
              value={compSourceA}
              onChange={(e) => setCompSourceA(e.target.value as DataSourceType)}
            >
              <option className="text-slate-900" value="received" disabled={compSourceB === 'received'}>پێویست بە وەڵام</option>
              <option className="text-slate-900" value="sent" disabled={compSourceB === 'sent'}>سەرجەم ڕەوانەکراوەکان</option>
              <option className="text-slate-900" value="incoming" disabled={compSourceB === 'incoming'}>سەرجەم هاتووەکان</option>
            </select>
            <GitCompareArrows className="text-slate-400" size={20} />
            <select 
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none font-bold text-sm px-2 cursor-pointer"
              value={compSourceB}
              onChange={(e) => setCompSourceB(e.target.value as DataSourceType)}
            >
              <option className="text-slate-900" value="received" disabled={compSourceA === 'received'}>پێویست بە وەڵام</option>
              <option className="text-slate-900" value="sent" disabled={compSourceA === 'sent'}>سەرجەم ڕەوانەکراوەکان</option>
              <option className="text-slate-900" value="incoming" disabled={compSourceA === 'incoming'}>سەرجەم هاتووەکان</option>
            </select>
          </div>
        )}

        {/* COMP SLIDE 0: Summary */}
        {activeView === 'comparison' && activeSlide === 0 && (
          <motion.div key="comp-slide-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col pt-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-indigo-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <GitCompareArrows className="text-indigo-500" size={32} />
                  بەراوردکردنی نامەکان
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">بەراوردی ژمارەی کارەکان لەنێوان دوو سەرچاوەی دیاریکراو</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6 mt-4">
              <div className="glass p-10 rounded-3xl flex flex-col items-center justify-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className={`absolute inset-0 transition-colors ${compConfigA.glow}`} />
                <compConfigA.icon className={`mb-4 relative z-10 ${compConfigA.iconColor.split(' ')[0]}`} size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{compCountA}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">{compConfigA.name}</span>
                <span className="text-sm font-bold mt-2" style={{ color: compConfigA.color }}>{compCountA + compCountB > 0 ? Math.round((compCountA / (compCountA + compCountB)) * 100) : 0}%</span>
              </div>
              <div className="glass p-10 rounded-3xl flex flex-col items-center justify-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className={`absolute inset-0 transition-colors ${compConfigB.glow}`} />
                <compConfigB.icon className={`mb-4 relative z-10 ${compConfigB.iconColor.split(' ')[0]}`} size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{compCountB}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">{compConfigB.name}</span>
                <span className="text-sm font-bold mt-2" style={{ color: compConfigB.color }}>{compCountA + compCountB > 0 ? Math.round((compCountB / (compCountA + compCountB)) * 100) : 0}%</span>
              </div>
            </motion.div>
            {showInsights && compCountA > 0 || compCountB > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-indigo-500/10 to-indigo-400/10 border border-indigo-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-indigo-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-indigo-600 dark:text-indigo-400">شیکاری هۆشمەند: </strong> 
                  ڕێژەی <strong className="text-indigo-500">{compCountA + compCountB > 0 ? Math.round((compCountA / (compCountA + compCountB)) * 100) : 0}%</strong>ی کارەکان پەیوەستە بە <strong className="text-indigo-500">{compConfigA.name}</strong> بەرامبەر بە <strong className="text-indigo-500">{compCountA + compCountB > 0 ? Math.round((compCountB / (compCountA + compCountB)) * 100) : 0}%</strong> بۆ <strong className="text-indigo-500">{compConfigB.name}</strong>.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* COMP SLIDE 1: Comparison Chart */}
        {activeView === 'comparison' && activeSlide === 1 && (
          <motion.div key="comp-slide-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col pt-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-indigo-500/10 -z-10" />
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <GitCompareArrows className="text-indigo-500" size={32} />
              بەراوردی ژمارەی کارەکان بەپێی بەشەکان
            </motion.h2>
            
            <motion.div variants={itemVariants} className="w-full h-[350px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptComparisonData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                    formatter={(value, name) => [value, name === 'received' ? compConfigA.name : compConfigB.name]}
                  />
                  <Bar dataKey="received" name="received" fill={compConfigA.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="sent" name="sent" fill={compConfigB.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-x-8 gap-y-2 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: compConfigA.color }}></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{compConfigA.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: compConfigB.color }}></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{compConfigB.name}</span>
              </div>
            </motion.div>
            {showInsights && deptComparisonData.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-indigo-500/10 to-indigo-400/10 border border-indigo-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-indigo-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-indigo-600 dark:text-indigo-400">شیکاری هۆشمەند: </strong> 
                  بەشی <strong className="text-indigo-500">{[...deptComparisonData].sort((a,b)=>b.total-a.total)[0].name}</strong> گەورەترین ژمارەی کاری هەیە لەنێوان هەردوو سەرچاوەی بەراوردکراودا.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* COMP SLIDE 2: Timeline */}
        {activeView === 'comparison' && activeSlide === 2 && (
          <motion.div key="comp-slide-2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col pt-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10 -z-10" />
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <TrendingUp className="text-purple-500" size={32} />
              بەراوردکردنی هەڵکشان و داکشان بەپێی کات
            </motion.h2>
            
            <motion.div variants={itemVariants} className="w-full h-[350px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineDataComparison} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={compConfigA.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={compConfigA.color} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={compConfigB.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={compConfigB.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} 
                    formatter={(value, name) => [value, name === 'received' ? compConfigA.name : compConfigB.name]}
                  />
                  <Area type="monotone" name="received" dataKey="received" stroke={compConfigA.color} strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" dot={{ r: 4, stroke: compConfigA.color, strokeWidth: 2, fill: '#fff' }} />
                  <Area type="monotone" name="sent" dataKey="sent" stroke={compConfigB.color} strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" dot={{ r: 4, stroke: compConfigB.color, strokeWidth: 2, fill: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-x-8 gap-y-2 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-1 rounded-sm" style={{ backgroundColor: compConfigA.color }}></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{compConfigA.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-1 rounded-sm" style={{ backgroundColor: compConfigB.color }}></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{compConfigB.name}</span>
              </div>
            </motion.div>
            {showInsights && timelineDataComparison.length >= 2 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-indigo-500/10 to-indigo-400/10 border border-indigo-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-indigo-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-indigo-600 dark:text-indigo-400">شیکاری هۆشمەند: </strong> 
                  ئەم بەراوردکارییە دەریدەخات کە چۆن گۆڕانکارییەکان بەپێی کات کاریگەرییان هەبووە لەسەر ژمارەی کار لە هەردوو سەرچاوەکەدا.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

</AnimatePresence>
      </div>

      {/* Slide Navigation Hints */}
      <div className="mt-6 text-center text-xs text-slate-400">
        بۆ گۆڕینی سڵایدەکان دەتوانیت لای چەپ/ڕاست یان دوگمەکانی <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter</kbd> و <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> بەکاربهێنیت.
      </div>

    </div>
  );
};
