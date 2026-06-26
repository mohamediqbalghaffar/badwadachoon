"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useData } from "../context/DataContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, Clock, AlertTriangle, Building2, PieChart as PieIcon, 
  TrendingUp, Map, ArrowRight, ArrowLeft, MousePointerClick,
  ArrowDownToLine, Inbox, Send, GitCompareArrows, BarChart2, Play, Pause
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LabelList, Legend, LineChart, Line
} from "recharts";
import { format, parseISO, isValid, startOfMonth } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

// --- View Theme Configs ---
const VIEW_THEMES: Record<string, { accent1: string; accent2: string; glowClass: string; lineColor: string }> = {
  incoming: { accent1: 'from-purple-500/15 dark:from-purple-600/25', accent2: 'from-violet-500/10 dark:from-violet-600/20', glowClass: 'shadow-purple-500/20', lineColor: '#a855f7' },
  received: { accent1: 'from-blue-500/15 dark:from-blue-600/25', accent2: 'from-cyan-500/10 dark:from-cyan-600/20', glowClass: 'shadow-blue-500/20', lineColor: '#3b82f6' },
  sent: { accent1: 'from-teal-500/15 dark:from-teal-600/25', accent2: 'from-emerald-500/10 dark:from-emerald-600/20', glowClass: 'shadow-teal-500/20', lineColor: '#14b8a6' },
  comparison: { accent1: 'from-indigo-500/15 dark:from-indigo-600/25', accent2: 'from-violet-500/10 dark:from-violet-600/20', glowClass: 'shadow-indigo-500/20', lineColor: '#6366f1' },
};

const COLOR_MAP: Record<string, { text: string; hoverBorder: string; glow: string; ring: string }> = {
  blue:    { text: 'text-blue-500',    hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-400',    glow: 'shadow-blue-500/30',    ring: 'rgba(59,130,246,0.4)' },
  emerald: { text: 'text-emerald-500', hoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-400', glow: 'shadow-emerald-500/30', ring: 'rgba(16,185,129,0.4)' },
  purple:  { text: 'text-purple-500',  hoverBorder: 'hover:border-purple-500 dark:hover:border-purple-400',  glow: 'shadow-purple-500/30',  ring: 'rgba(168,85,247,0.4)' },
  orange:  { text: 'text-orange-500',  hoverBorder: 'hover:border-orange-500 dark:hover:border-orange-400',  glow: 'shadow-orange-500/30',  ring: 'rgba(249,115,22,0.4)' },
  indigo:  { text: 'text-indigo-500',  hoverBorder: 'hover:border-indigo-500 dark:hover:border-indigo-400',  glow: 'shadow-indigo-500/30',  ring: 'rgba(99,102,241,0.4)' },
  teal:    { text: 'text-teal-500',    hoverBorder: 'hover:border-teal-500 dark:hover:border-teal-400',    glow: 'shadow-teal-500/30',    ring: 'rgba(20,184,166,0.4)' },
};

const AUTO_PLAY_OPTIONS = [
  { label: 'ناکار', value: 0 },
  { label: '5 چرکە', value: 5 },
  { label: '8 چرکە', value: 8 },
  { label: '12 چرکە', value: 12 },
  { label: '20 چرکە', value: 20 },
];

const getAbbr = (name: string) => {
  if (!name) return '';
  const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
  const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
  const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
  return abbr || name.charAt(0);
};

// --- Animated Counter Hook ---
const useAnimatedNumber = (target: number, duration = 1200) => {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
};

// --- Staggered content wrapper ---
const StaggerContainer = ({ children, isActive }: { children: React.ReactNode; isActive: boolean }) => (
  <AnimatePresence>
    {isActive && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Glassmorphism NodeWrapper ---
const NodeWrapper = ({ active, node, onClick, children }: any) => {
  const colors = COLOR_MAP[node.color] || COLOR_MAP.blue;
  const Icon = node.icon;
  return (
    <div 
      className="absolute flex flex-col items-center justify-center w-[1000px] z-10"
      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
    >
      <div 
        className={`w-full h-full relative cursor-pointer transition-all duration-500 rounded-[3rem] ${!active ? 'hover:scale-105 group' : 'cursor-default'}`}
        onClick={() => { if (!active) onClick(); }}
      >
        {/* Overlay when not active (map view) */}
        {!active && (
          <div className={`absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-sm rounded-[3rem] z-50 flex flex-col items-center justify-center border-2 border-white/30 dark:border-slate-700/50 ${colors.hoverBorder} transition-all duration-300`}>
            {/* Pulsing ring beacon */}
            <motion.div
              className="absolute inset-0 rounded-[3rem] border-2 opacity-0"
              style={{ borderColor: colors.ring }}
              animate={{ scale: [1, 1.08, 1], opacity: [0, 0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl px-10 py-6 rounded-3xl shadow-2xl flex flex-col items-center border border-white/50 dark:border-slate-700/50 transform transition-transform group-hover:scale-105">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon size={56} className={`${colors.text} mb-3`} />
              </motion.div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white whitespace-nowrap">{node.title}</h2>
            </div>
          </div>
        )}

        {/* Glassmorphism card body */}
        <div className={`w-full rounded-[3rem] p-10 border transition-all duration-500 ${
          active 
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl border-white/40 dark:border-slate-700/60' 
            : 'bg-white/60 dark:bg-slate-900/50 backdrop-blur-md shadow-xl border-white/20 dark:border-slate-800/30'
        }`}>
          {/* Animated gradient underline on header */}
          <div className="relative mb-10">
            <h2 className="text-4xl font-black text-center text-slate-800 dark:text-slate-100 flex items-center justify-center gap-6">
              <Icon className={colors.text} size={48} />
              {node.title}
            </h2>
            {active && (
              <motion.div 
                className={`h-1 rounded-full mt-4 mx-auto bg-gradient-to-r ${
                  node.color === 'blue' ? 'from-blue-500 to-cyan-400' :
                  node.color === 'emerald' ? 'from-emerald-500 to-teal-400' :
                  node.color === 'purple' ? 'from-purple-500 to-fuchsia-400' :
                  node.color === 'orange' ? 'from-orange-500 to-amber-400' :
                  node.color === 'indigo' ? 'from-indigo-500 to-violet-400' :
                  node.color === 'teal' ? 'from-teal-500 to-cyan-400' :
                  'from-blue-500 to-cyan-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: '60%' }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- KPI Card with animated number ---
const KPICard = ({ icon: Icon, label, value, gradient, bgLight, bgDark, borderLight, borderDark, delay = 0 }: any) => {
  const animatedVal = useAnimatedNumber(typeof value === 'number' ? value : 0);
  const isNumber = typeof value === 'number';
  return (
    <motion.div 
      className={`${bgLight} ${bgDark} p-8 rounded-[2rem] flex flex-col items-center text-center border ${borderLight} ${borderDark}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={`w-20 h-20 rounded-full ${bgLight.replace('bg-', 'bg-').replace('/20', '/40')} flex items-center justify-center mb-6`}>
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">{label}</h3>
      <span className={`text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
        {isNumber ? animatedVal : value}
      </span>
    </motion.div>
  );
};


export const PreziPresentationView = () => {
  const { baseFilteredData, baseFilteredSentData, baseFilteredIncomingData, activeView, setActiveView } = useData();
  const [activeNode, setActiveNode] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(0);
  const [autoPlayRemaining, setAutoPlayRemaining] = useState(0);
  const [showAutoPlayMenu, setShowAutoPlayMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const theme = VIEW_THEMES[activeView] || VIEW_THEMES.received;

  const currentData = useMemo(() => {
    switch(activeView) {
      case 'incoming': return baseFilteredIncomingData;
      case 'sent': return baseFilteredSentData;
      case 'received': 
      case 'comparison': 
      default: return baseFilteredData;
    }
  }, [activeView, baseFilteredData, baseFilteredSentData, baseFilteredIncomingData]);

  const NODES = useMemo(() => {
    const mapNode = { id: 0, key: 'map', type: 'map', title: 'نەخشەی گشتی', icon: Map, x: 0, y: 0, color: 'blue' };
    if (activeView === 'incoming') {
      return [
        mapNode,
        { id: 1, key: 'kpi', type: 'kpi-incoming', title: 'ئامارە بنەڕەتییەکان', icon: Layers, x: -1000, y: -700, color: 'blue' },
        { id: 2, key: 'senders', type: 'bar', title: 'لایەنی نێرەر', icon: Building2, x: 1000, y: -700, color: 'emerald', dataKey: 'sender' },
        { id: 3, key: 'types', type: 'pie', title: 'جۆرەکانی نامە', icon: PieIcon, x: -1000, y: 700, color: 'purple' },
        { id: 4, key: 'timeline', type: 'timeline', title: 'ڕەوتی کات', icon: TrendingUp, x: 1000, y: 700, color: 'orange' },
      ];
    }
    if (activeView === 'sent') {
      return [
        mapNode,
        { id: 1, key: 'kpi', type: 'kpi-sent', title: 'ئامارە بنەڕەتییەکان', icon: Send, x: -1000, y: -700, color: 'teal' },
        { id: 2, key: 'departments', type: 'bar', title: 'لایەنە پەیوەندیدارەکان', icon: Building2, x: 1000, y: -700, color: 'emerald', dataKey: 'departments' },
        { id: 3, key: 'types', type: 'pie', title: 'جۆرەکانی نامە', icon: PieIcon, x: -1000, y: 700, color: 'purple' },
        { id: 4, key: 'timeline', type: 'timeline', title: 'ڕەوتی کات', icon: TrendingUp, x: 1000, y: 700, color: 'orange' },
      ];
    }
    if (activeView === 'comparison') {
      return [
        mapNode,
        { id: 1, key: 'kpi', type: 'kpi-comparison', title: 'پوختەی بەراورد', icon: GitCompareArrows, x: -1000, y: -700, color: 'indigo' },
        { id: 2, key: 'comp-dept', type: 'comp-bar', title: 'بەراوردی بەشەکان', icon: BarChart2, x: 1000, y: -700, color: 'emerald' },
        { id: 3, key: 'comp-timeline', type: 'comp-timeline', title: 'بەراوردی کات', icon: TrendingUp, x: -1000, y: 700, color: 'orange' },
      ];
    }
    return [
      mapNode,
      { id: 1, key: 'kpi', type: 'kpi-received', title: 'ئامارە بنەڕەتییەکان', icon: Layers, x: -1000, y: -700, color: 'blue' },
      { id: 2, key: 'departments', type: 'bar', title: 'لایەنە پەیوەندیدارەکان', icon: Building2, x: 1000, y: -700, color: 'emerald', dataKey: 'departments' },
      { id: 3, key: 'types', type: 'pie', title: 'جۆرەکانی نامە', icon: PieIcon, x: -1000, y: 700, color: 'purple' },
      { id: 4, key: 'timeline', type: 'timeline', title: 'ڕەوتی کات', icon: TrendingUp, x: 1000, y: 700, color: 'orange' },
    ];
  }, [activeView]);

  // --- Navigation with cinematic transition ---
  const navigateTo = useCallback((nodeIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveNode(nodeIndex);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  useEffect(() => {
    setActiveNode(0);
  }, [activeView]);

  // --- Keyboard navigation ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        navigateTo(activeNode === 0 ? NODES.length - 1 : activeNode - 1);
      } else if (e.key === "ArrowLeft" || e.key === " " || e.key === "Enter") {
        if (e.key === " ") e.preventDefault();
        navigateTo(activeNode === NODES.length - 1 ? 0 : activeNode + 1);
      } else if (e.key === "Escape" || e.key === "Backspace") {
        navigateTo(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [NODES.length, activeNode, navigateTo]);

  // --- Auto-play ---
  useEffect(() => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    if (autoPlayInterval > 0) {
      setAutoPlayRemaining(autoPlayInterval);
      countdownRef.current = setInterval(() => {
        setAutoPlayRemaining(prev => prev <= 1 ? autoPlayInterval : prev - 1);
      }, 1000);
      autoPlayTimerRef.current = setInterval(() => {
        setActiveNode(prev => (prev >= NODES.length - 1 ? 0 : prev + 1));
        setAutoPlayRemaining(autoPlayInterval);
      }, autoPlayInterval * 1000);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoPlayInterval, NODES.length]);

  const activeNodeData = NODES[activeNode] || NODES[0];

  // --- Data calculations ---
  const safeData = currentData as any[];
  const totalLetters = safeData.length;
  const pendingLetters = safeData.filter((item) => !item.responseDate).length;
  const completedLetters = safeData.filter((item) => item.processingTime !== null && item.processingTime !== undefined);
  const avgProcessingTime = completedLetters.length > 0 ? completedLetters.reduce((acc, curr) => acc + (curr.processingTime ?? 0), 0) / completedLetters.length : 0;

  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    const key = (activeNodeData as any).dataKey || 'departments';
    safeData.forEach((d) => {
      if (key === 'departments' && Array.isArray(d.departments)) {
        d.departments.forEach((dept: string) => { counts[dept] = (counts[dept] || 0) + 1; });
      } else if (d[key]) {
        counts[d[key]] = (counts[d[key]] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, abbr: getAbbr(name) })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [currentData, (activeNodeData as any).dataKey]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    safeData.forEach((d) => {
      if (d.letterType) counts[d.letterType] = (counts[d.letterType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value, abbr: getAbbr(name) }));
  }, [currentData]);

  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    safeData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          counts[monthStr] = (counts[monthStr] || 0) + 1;
        }
      }
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [currentData]);

  const comparisonDeptData = useMemo(() => {
    if (activeView !== 'comparison') return [];
    const depts = new Set<string>();
    const recCounts: Record<string, number> = {};
    const sentCounts: Record<string, number> = {};
    baseFilteredData.forEach(d => {
      if (Array.isArray(d.departments)) {
        d.departments.forEach(dept => { depts.add(dept); recCounts[dept] = (recCounts[dept] || 0) + 1; });
      }
    });
    baseFilteredSentData.forEach(d => {
      if (Array.isArray(d.departments)) {
        d.departments.forEach(dept => { depts.add(dept); sentCounts[dept] = (sentCounts[dept] || 0) + 1; });
      }
    });
    return Array.from(depts).map(dept => ({
      name: dept, abbr: getAbbr(dept),
      received: recCounts[dept] || 0, sent: sentCounts[dept] || 0,
      total: (recCounts[dept] || 0) + (sentCounts[dept] || 0)
    })).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [baseFilteredData, baseFilteredSentData, activeView]);

  const comparisonTimelineData = useMemo(() => {
    if (activeView !== 'comparison') return [];
    const dates = new Set<string>();
    const recCounts: Record<string, number> = {};
    const sentCounts: Record<string, number> = {};
    baseFilteredData.forEach(d => {
      if (d.sentDate) { const date = parseISO(d.sentDate); if (isValid(date)) { const m = format(startOfMonth(date), 'yyyy-MM'); dates.add(m); recCounts[m] = (recCounts[m] || 0) + 1; } }
    });
    baseFilteredSentData.forEach(d => {
      if (d.sentDate) { const date = parseISO(d.sentDate); if (isValid(date)) { const m = format(startOfMonth(date), 'yyyy-MM'); dates.add(m); sentCounts[m] = (sentCounts[m] || 0) + 1; } }
    });
    return Array.from(dates).map(date => ({ date, received: recCounts[date] || 0, sent: sentCounts[date] || 0 })).sort((a, b) => a.date.localeCompare(b.date));
  }, [baseFilteredData, baseFilteredSentData, activeView]);

  // --- Render Node Content ---
  const renderNodeContent = (node: any, isActive: boolean) => {
    if (node.type === 'map') {
      return (
        <div 
          className="absolute flex flex-col items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-110 z-10"
          style={{ transform: `translate(0px, 0px)` }}
          onClick={() => navigateTo(0)}
        >
          {/* Pulsing glow behind central orb */}
          <motion.div
            className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 dark:from-blue-500/20 dark:to-indigo-500/20 blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_0_100px_rgba(59,130,246,0.6)] flex items-center justify-center mb-6">
            <Map size={100} className="text-white" />
          </div>
          <h1 className="text-8xl font-black text-slate-800 dark:text-white drop-shadow-2xl">سیستەمی بەدواداچوون</h1>
          <p className="text-4xl text-slate-600 dark:text-slate-400 mt-4 font-bold">شیکاری هۆشمەندی داتاکان</p>
          
          {isActive && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-12 flex items-center gap-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50"
            >
              <MousePointerClick size={40} className="text-blue-500 animate-bounce" />
              <span className="text-3xl font-bold text-slate-700 dark:text-slate-300">کلیک لەسەر بەشەکان بکە بۆ بینینی وردەکاری</span>
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <NodeWrapper active={isActive} node={node} onClick={() => navigateTo(node.id)}>
        <StaggerContainer isActive={isActive}>
          {/* KPI RECEIVED */}
          {node.type === 'kpi-received' && (
            <div className="grid grid-cols-3 gap-8 w-full">
              <KPICard icon={Layers} label="کۆی گشتی نامەکان" value={totalLetters} gradient="from-blue-600 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900/20" borderLight="border-blue-100" borderDark="dark:border-blue-800/50" delay={0.1} />
              <KPICard icon={AlertTriangle} label="هەڵپەسێردراو" value={pendingLetters} gradient="from-amber-500 to-orange-500" bgLight="bg-amber-50" bgDark="dark:bg-amber-900/20" borderLight="border-amber-100" borderDark="dark:border-amber-800/50" delay={0.25} />
              <KPICard icon={Clock} label="تێکڕای کاتی وەڵام" value={avgProcessingTime.toFixed(1) + ' ڕۆژ'} gradient="from-emerald-500 to-teal-500" bgLight="bg-emerald-50" bgDark="dark:bg-emerald-900/20" borderLight="border-emerald-100" borderDark="dark:border-emerald-800/50" delay={0.4} />
            </div>
          )}

          {/* KPI INCOMING */}
          {node.type === 'kpi-incoming' && (
            <motion.div className="flex justify-center w-full" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2rem] flex flex-col items-center text-center border border-blue-100 dark:border-blue-800/50 w-2/3">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8">
                  <ArrowDownToLine size={48} />
                </div>
                <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-400 mb-4">کۆی گشتی هاتووەکان</h3>
                <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">{totalLetters}</span>
              </div>
            </motion.div>
          )}

          {/* KPI SENT */}
          {node.type === 'kpi-sent' && (
            <motion.div className="flex justify-center w-full" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="bg-teal-50 dark:bg-teal-900/20 p-8 rounded-[2rem] flex flex-col items-center text-center border border-teal-100 dark:border-teal-800/50 w-2/3">
                <div className="w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-800/50 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-8">
                  <Send size={48} />
                </div>
                <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-400 mb-4">کۆی گشتی ڕەوانەکراوەکان</h3>
                <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500">{totalLetters}</span>
              </div>
            </motion.div>
          )}

          {/* KPI COMPARISON */}
          {node.type === 'kpi-comparison' && (
            <div className="grid grid-cols-3 gap-8 w-full">
              <KPICard icon={ArrowDownToLine} label="کۆی هاتووەکان" value={baseFilteredIncomingData.length} gradient="from-purple-500 to-fuchsia-500" bgLight="bg-purple-50" bgDark="dark:bg-purple-900/20" borderLight="border-purple-100" borderDark="dark:border-purple-800/50" delay={0.1} />
              <KPICard icon={Inbox} label="پێویست بە وەڵام" value={baseFilteredData.length} gradient="from-blue-500 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900/20" borderLight="border-blue-100" borderDark="dark:border-blue-800/50" delay={0.25} />
              <KPICard icon={Send} label="کۆی ڕەوانەکراوەکان" value={baseFilteredSentData.length} gradient="from-teal-500 to-emerald-500" bgLight="bg-teal-50" bgDark="dark:bg-teal-900/20" borderLight="border-teal-100" borderDark="dark:border-teal-800/50" delay={0.4} />
            </div>
          )}

          {/* BAR CHART */}
          {node.type === 'bar' && (
            <motion.div className="w-full h-[380px]" dir="ltr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 18, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(100,116,139,0.1)' }} contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }} formatter={(value: any, name: any, props: any) => [value, props.payload.name]} />
                  <Bar dataKey="count" radius={[12, 12, 0, 0]} maxBarSize={80} animationDuration={1200} animationEasing="ease-out">
                    <LabelList dataKey="count" position="top" offset={12} fill="#64748b" fontSize={18} fontWeight="bold" />
                    {barData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* COMPARISON BAR (side by side) */}
          {node.type === 'comp-bar' && (
            <motion.div className="w-full h-[380px]" dir="ltr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonDeptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 18, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(100,116,139,0.1)' }} contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="received" name="پێویست بە وەڵام" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1200} />
                  <Bar dataKey="sent" name="ڕەوانەکراوەکان" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* PIE CHART */}
          {node.type === 'pie' && (
            <div className="grid grid-cols-2 gap-8 items-center w-full">
              <motion.div className="h-[380px]" dir="ltr" initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={120} outerRadius={180} paddingAngle={5} dataKey="value" stroke="none" animationDuration={1200} animationEasing="ease-out">
                      {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1rem', padding: '1rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div className="flex flex-col gap-4 overflow-y-auto max-h-[380px] pr-2 custom-scrollbar" dir="rtl" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/30 dark:border-slate-700 transition-all hover:scale-[1.02] hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full shadow-md" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                    </div>
                    <span className="text-2xl font-black text-slate-600 dark:text-slate-400">{entry.value}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          )}

          {/* TIMELINE */}
          {node.type === 'timeline' && (
            <motion.div className="w-full h-[380px]" dir="ltr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 30, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`colorTimeline-${node.color}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={node.color === 'orange' ? '#f59e0b' : '#3b82f6'} stopOpacity={0.5} />
                      <stop offset="95%" stopColor={node.color === 'orange' ? '#f59e0b' : '#3b82f6'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }} />
                  <Area type="monotone" dataKey="count" stroke={node.color === 'orange' ? '#f59e0b' : '#3b82f6'} strokeWidth={6} fillOpacity={1} fill={`url(#colorTimeline-${node.color})`} dot={{ r: 8, stroke: node.color === 'orange' ? '#f59e0b' : '#3b82f6', strokeWidth: 4, fill: '#fff' }} animationDuration={1500}>
                    <LabelList dataKey="count" position="top" offset={16} fill={node.color === 'orange' ? '#f59e0b' : '#3b82f6'} fontSize={20} fontWeight="bold" />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* COMPARISON TIMELINE */}
          {node.type === 'comp-timeline' && (
            <motion.div className="w-full h-[380px]" dir="ltr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonTimelineData} margin={{ top: 30, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="received" name="پێویست بە وەڵام" stroke="#3b82f6" strokeWidth={6} dot={{ r: 6 }} animationDuration={1500} />
                  <Line type="monotone" dataKey="sent" name="ڕەوانەکراوەکان" stroke="#10b981" strokeWidth={6} dot={{ r: 6 }} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </StaggerContainer>
      </NodeWrapper>
    );
  };

  const progressPct = NODES.length > 1 ? (activeNode / (NODES.length - 1)) * 100 : 0;

  return (
    <div className="relative w-full min-h-[85vh] overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl select-none flex items-center justify-center">
      
      {/* Section-specific background aurora */}
      <motion.div 
        key={`aurora1-${activeView}`}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className={`absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-radial ${theme.accent1} to-transparent rounded-full blur-[120px]`}
      />
      <motion.div 
        key={`aurora2-${activeView}`}
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} 
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className={`absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-gradient-radial ${theme.accent2} to-transparent rounded-full blur-[120px]`}
      />

      {/* Motion blur overlay during transitions */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none bg-gradient-radial from-transparent via-white/5 to-white/20 dark:via-slate-900/5 dark:to-slate-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* TOP CENTER: View Toggle */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-xl shadow-lg border border-white/30 dark:border-slate-700/50 z-50 pointer-events-auto">
        {[
          { key: 'incoming', label: 'سەرجەم هاتووەکان', icon: ArrowDownToLine, activeColor: 'text-purple-600 dark:text-purple-400' },
          { key: 'received', label: 'پێویست بە وەڵام', icon: Inbox, activeColor: 'text-blue-600 dark:text-blue-400' },
          { key: 'sent', label: 'سەرجەم ڕەوانەکراوەکان', icon: Send, activeColor: 'text-teal-600 dark:text-teal-400' },
          { key: 'comparison', label: 'بەراوردکردن', icon: GitCompareArrows, activeColor: 'text-indigo-600 dark:text-indigo-400' },
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => { setActiveView(tab.key as any); }} 
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === tab.key ? `bg-white dark:bg-slate-700 ${tab.activeColor} shadow-sm` : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-slate-800/50 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-r-full"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Node breadcrumb dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-50 pointer-events-auto">
        {NODES.map((node, idx) => (
          <button
            key={node.key}
            onClick={() => navigateTo(idx)}
            className={`transition-all duration-300 rounded-full ${
              activeNode === idx 
                ? 'w-8 h-3 bg-blue-500 dark:bg-blue-400' 
                : idx < activeNode 
                  ? 'w-3 h-3 bg-blue-400/60 dark:bg-blue-500/40 hover:bg-blue-400'
                  : 'w-3 h-3 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
            }`}
            title={node.title}
          />
        ))}
      </div>

      {/* Floating UI Controls */}
      <div className="absolute bottom-20 left-8 right-8 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => navigateTo(0)}
            className={`px-5 py-3 rounded-2xl text-lg font-bold backdrop-blur-xl transition-all flex items-center gap-2 ${activeNode === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-white/30 dark:border-slate-700 shadow-xl'}`}
          >
            <Map size={24} />
            نەخشەی گشتی
          </button>

          {/* Auto-play control */}
          <div className="relative">
            <button 
              onClick={() => setShowAutoPlayMenu(!showAutoPlayMenu)}
              className={`px-4 py-3 rounded-2xl text-lg font-bold backdrop-blur-xl transition-all flex items-center gap-2 border shadow-xl ${
                autoPlayInterval > 0 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-blue-600/30' 
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-white/30 dark:border-slate-700'
              }`}
            >
              {autoPlayInterval > 0 ? <Pause size={20} /> : <Play size={20} />}
              {autoPlayInterval > 0 && (
                <span className="text-sm font-mono">{autoPlayRemaining}s</span>
              )}
            </button>
            
            <AnimatePresence>
              {showAutoPlayMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full mb-2 left-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-2 min-w-[140px]"
                >
                  {AUTO_PLAY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setAutoPlayInterval(opt.value); setShowAutoPlayMenu(false); }}
                      className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        autoPlayInterval === opt.value 
                          ? 'bg-blue-500 text-white' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-4 pointer-events-auto bg-white/70 dark:bg-slate-800/70 p-2 rounded-3xl backdrop-blur-xl border border-white/30 dark:border-slate-700 shadow-xl items-center">
          <button onClick={() => navigateTo(activeNode === 0 ? NODES.length - 1 : activeNode - 1)} className="p-3 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-2xl transition-colors text-slate-700 dark:text-slate-300">
            <ArrowRight size={24} />
          </button>
          <div className="px-6 py-2 text-lg font-semibold text-slate-600 dark:text-slate-400 border-l border-r border-slate-300/50 dark:border-slate-600/50">
            {activeNode === 0 ? 'پێشەکی' : `بەشی ${activeNode} لە ${NODES.length - 1}`}
          </div>
          <button onClick={() => navigateTo(activeNode === NODES.length - 1 ? 0 : activeNode + 1)} className="p-3 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-2xl transition-colors text-slate-700 dark:text-slate-300">
            <ArrowLeft size={24} />
          </button>
        </div>
      </div>

      {/* The massive virtual canvas */}
      <motion.div
        ref={containerRef}
        className="absolute flex items-center justify-center"
        initial={false}
        animate={{
          x: -activeNodeData.x * (activeNode === 0 ? 0.25 : 0.65),
          y: -activeNodeData.y * (activeNode === 0 ? 0.25 : 0.65),
          scale: activeNode === 0 ? 0.25 : 0.65,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 50, 
          damping: 20, 
          mass: 1.5,
        }}
        style={{ width: '4000px', height: '3000px' }}
      >
        {/* SVG Connection Lines with themed colors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {NODES.slice(1).map((node, i) => (
            <motion.path
              key={`line-${node.id}-${activeView}`}
              d={`M 2000 1500 Q ${2000 + node.x * 0.5} ${1500 + node.y * 0.5} ${2000 + node.x} ${1500 + node.y}`}
              fill="none"
              stroke={theme.lineColor}
              strokeWidth="8"
              strokeDasharray="20 15"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: activeNode === 0 ? 0.5 : 0.08 }}
              transition={{ duration: 1.5, delay: i * 0.2 }}
            />
          ))}
        </svg>

        {/* Dynamic Nodes */}
        {NODES.map((node, index) => (
          <React.Fragment key={`${node.key}-${activeView}`}>
            {renderNodeContent(node, activeNode === index)}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

