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
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
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
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [baseFilteredIncomingData]);

  const timelineDataComparison = useMemo(() => {
    const rByMonth: Record<string, number> = {};
    const sByMonth: Record<string, number> = {};
    baseFilteredData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          rByMonth[monthStr] = (rByMonth[monthStr] || 0) + 1;
        }
      }
    });
    baseFilteredSentData.forEach((d) => {
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
  }, [baseFilteredData, baseFilteredSentData]);

  const deptComparisonData = useMemo(() => {
    if (!hasSentData) return [];
    const depts = new Set<string>();
    const receivedCounts: Record<string, number> = {};
    const sentCounts: Record<string, number> = {};

    baseFilteredData.forEach(d => {
      d.departments.forEach((dept) => {
        depts.add(dept);
        receivedCounts[dept] = (receivedCounts[dept] || 0) + 1;
      });
    });

    baseFilteredSentData.forEach(d => {
      d.departments.forEach((dept) => {
        depts.add(dept);
        sentCounts[dept] = (sentCounts[dept] || 0) + 1;
      });
    });

    return Array.from(depts).map(name => {
      const received = receivedCounts[name] || 0;
      const sent = sentCounts[name] || 0;
      const total = Math.max(received, sent);
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
                <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500 mb-4 relative z-10">{totalSent}</span>
                <span className="text-xl text-slate-500 font-bold relative z-10">سەرجەم ڕەوانەکراوەکان</span>
              </div>
            </motion.div>
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
          </motion.div>
        )}

        
        {/* ===================== COMPARISON SLIDES ===================== */}
        {/* COMP SLIDE 0: Summary */}
        {activeView === 'comparison' && activeSlide === 0 && (
          <motion.div key="comp-slide-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-indigo-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <GitCompareArrows className="text-indigo-500" size={32} />
                  بەراوردکردنی نامەکان
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">ڕێژەی ئەو نامانەی پێویستیان بە وەڵامە لە کۆی گشتی نامە ڕەوانەکراوەکان</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6 mt-4">
              <div className="glass p-10 rounded-3xl flex flex-col items-center justify-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                <Layers className="text-blue-500 mb-4 relative z-10" size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{totalLetters}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">پێویست بە وەڵام</span>
                <span className="text-sm font-bold text-blue-500 mt-2">{totalSent > 0 ? Math.round((totalLetters / Math.max(totalLetters, totalSent)) * 100) : 0}%</span>
              </div>
              <div className="glass p-10 rounded-3xl flex flex-col items-center justify-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors" />
                <Send className="text-teal-500 mb-4 relative z-10" size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{Math.max(totalLetters, totalSent)}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">سەرجەم ڕەوانەکراوەکان</span>
                <span className="text-sm font-bold text-teal-500 mt-2">100%</span>
              </div>
            </motion.div>
            {showInsights && totalSent > 0 && (
              <motion.div variants={itemVariants} className="mt-8 p-5 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-indigo-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-indigo-600 dark:text-indigo-400">شیکاری هۆشمەند: </strong> 
                  بەراورد بە نامە ڕەوانەکراوەکان، لە ئێستادا <strong className="text-blue-500">{Math.round((totalLetters / Math.max(totalLetters, totalSent)) * 100)}%</strong>ی کارەکان پێویستیان بە وەڵام و گەڕانەوەیە. ئەگەر ئەم ڕێژەیە لە 50% زیاتر بێت، ئەوا پاڵەپەستۆیەکی زۆر لەسەر تیمەکان دروست دەبێت.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* COMP SLIDE 1: Comparison Chart */}
        {activeView === 'comparison' && activeSlide === 1 && (
          <motion.div key="comp-slide-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-indigo-500/10 -z-10" />
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <GitCompareArrows className="text-indigo-500" size={32} />
              بەراوردی قەبارەی کارەکان بەپێی بەشەکان
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
                  />
                  <Bar dataKey="received" name="پێویست بە وەڵام" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="sent" name="سەرجەم ڕەوانەکراوەکان" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-x-8 gap-y-2 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm bg-[#3b82f6]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">پێویست بە وەڵام</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm bg-[#06b6d4]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">سەرجەم ڕەوانەکراوەکان</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* COMP SLIDE 2: Timeline */}
        {activeView === 'comparison' && activeSlide === 2 && (
          <motion.div key="comp-slide-2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col">
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
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  <Area type="monotone" dataKey="received" name="پێویست بە وەڵام" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                  <Area type="monotone" dataKey="sent" name="سەرجەم ڕەوانەکراوەکان" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
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
