"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useData } from "../context/DataContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, Clock, AlertTriangle, Building2, PieChart as PieIcon, 
  TrendingUp, Map, ArrowRight, ArrowLeft, MousePointerClick, CheckCircle2,
  ArrowDownToLine, Inbox, Send, GitCompareArrows
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LabelList
} from "recharts";
import { format, parseISO, isValid, startOfMonth, parse } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const NODES = [
  { id: 0, key: 'map', title: 'نەخشەی گشتی', icon: Map, x: 0, y: 0 },
  { id: 1, key: 'kpi', title: 'ئامارە بنەڕەتییەکان', icon: Layers, x: -1000, y: -700 },
  { id: 2, key: 'departments', title: 'لایەنە پەیوەندیدارەکان', icon: Building2, x: 1000, y: -700 },
  { id: 3, key: 'types', title: 'جۆرەکانی نامە', icon: PieIcon, x: -1000, y: 700 },
  { id: 4, key: 'timeline', title: 'ڕەوتی کات', icon: TrendingUp, x: 1000, y: 700 },
];

export const PreziPresentationView = () => {
  const { baseFilteredData, baseFilteredSentData, baseFilteredIncomingData, activeView, setActiveView } = useData();
  const [activeNode, setActiveNode] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentData = useMemo(() => {
    switch(activeView) {
      case 'incoming': return baseFilteredIncomingData;
      case 'sent': return baseFilteredSentData;
      case 'received': 
      case 'comparison': 
      default: return baseFilteredData;
    }
  }, [activeView, baseFilteredData, baseFilteredSentData, baseFilteredIncomingData]);

  // --- Calculations ---
  const safeData = currentData as any[];
  const totalLetters = safeData.length;
  const pendingLetters = safeData.filter((item) => !item.responseDate).length;
  
  const completedLetters = safeData.filter((item) => item.processingTime !== null && item.processingTime !== undefined);
  const avgProcessingTime =
    completedLetters.length > 0
      ? completedLetters.reduce((acc, curr) => acc + (curr.processingTime ?? 0), 0) / completedLetters.length
      : 0;

  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    safeData.forEach((d) => {
      if (d.departments && Array.isArray(d.departments)) {
        d.departments.forEach((dept: string) => {
          counts[dept] = (counts[dept] || 0) + 1;
        });
      } else if (d.sender) {
        counts[d.sender] = (counts[d.sender] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => {
         const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
         const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
         const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
         return { name, count, abbr: abbr || name.charAt(0) };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [currentData]);

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    safeData.forEach((d) => {
      if (d.letterType) {
        counts[d.letterType] = (counts[d.letterType] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => {
         const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
         const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
         const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
         return { name, value, abbr: abbr || name.charAt(0) };
    });
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
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [currentData]);

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActiveNode((prev) => (prev === 0 ? NODES.length - 1 : prev - 1));
      } else if (e.key === "ArrowLeft" || e.key === " " || e.key === "Enter") {
        if (e.key === " ") e.preventDefault();
        setActiveNode((prev) => (prev === NODES.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape" || e.key === "Backspace") {
        setActiveNode(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeNodeData = NODES[activeNode];

  return (
    <div className="relative w-full min-h-[85vh] overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl select-none flex items-center justify-center">
      
      {/* Background ambient blobs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} 
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-emerald-500/10 dark:bg-teal-600/20 rounded-full blur-[120px]"
      />

      {/* TOP CENTER: View Toggle */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-md shadow-sm border border-white/20 dark:border-slate-700/50 z-50 pointer-events-auto">
        <button 
          onClick={() => { setActiveView('incoming'); setActiveNode(0); }} 
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'incoming' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <ArrowDownToLine size={18} />
          <span className="hidden sm:inline">سەرجەم هاتووەکان</span>
        </button>
        <button 
          onClick={() => { setActiveView('received'); setActiveNode(0); }} 
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'received' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <Inbox size={16} />
          <span className="hidden sm:inline">پێویست بە وەڵام</span>
        </button>
        <button 
          onClick={() => { setActiveView('sent'); setActiveNode(0); }} 
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'sent' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <Send size={16} />
          <span className="hidden sm:inline">سەرجەم ڕەوانەکراوەکان</span>
        </button>
        <button 
          onClick={() => { setActiveView('comparison'); setActiveNode(0); }} 
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'comparison' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <GitCompareArrows size={16} />
          <span className="hidden sm:inline">بەراوردکردن</span>
        </button>
      </div>

      {/* Floating UI Controls */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setActiveNode(0)}
            className={`px-5 py-3 rounded-2xl text-lg font-bold backdrop-blur-md transition-all flex items-center gap-2 ${activeNode === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl'}`}
          >
            <Map size={24} />
            نەخشەی گشتی
          </button>
        </div>
        <div className="flex gap-4 pointer-events-auto bg-white/80 dark:bg-slate-800/80 p-2 rounded-3xl backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl items-center">
          <button onClick={() => setActiveNode(prev => prev === 0 ? NODES.length - 1 : prev - 1)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors text-slate-700 dark:text-slate-300">
            <ArrowRight size={24} />
          </button>
          <div className="px-6 py-2 text-lg font-semibold text-slate-600 dark:text-slate-400 border-l border-r border-slate-300 dark:border-slate-600">
            {activeNode === 0 ? 'پێشەکی' : `بەشی ${activeNode} لە ${NODES.length - 1}`}
          </div>
          <button onClick={() => setActiveNode(prev => prev === NODES.length - 1 ? 0 : prev + 1)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors text-slate-700 dark:text-slate-300">
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
          x: -activeNodeData.x,
          y: -activeNodeData.y,
          scale: activeNode === 0 ? 0.25 : 1,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 70, 
          damping: 18, 
          mass: 1.2 
        }}
        style={{ width: '4000px', height: '3000px' }}
      >
        
        {/* SVG Connection Lines for the Map view */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {NODES.slice(1).map((node, i) => (
            <motion.path
              key={`line-${node.id}`}
              d={`M 2000 1500 Q ${2000 + node.x * 0.5} ${1500 + node.y * 0.5} ${2000 + node.x} ${1500 + node.y}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray="20 20"
              className="text-slate-300 dark:text-slate-700"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: activeNode === 0 ? 0.6 : 0.1 }}
              transition={{ duration: 1.5, delay: i * 0.2 }}
            />
          ))}
        </svg>

        {/* Central Map Node */}
        <div 
          className={`absolute flex flex-col items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-110 z-10`}
          style={{ transform: `translate(0px, 0px)` }}
          onClick={() => setActiveNode(0)}
        >
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_0_100px_rgba(59,130,246,0.6)] flex items-center justify-center mb-6">
            <Map size={100} className="text-white" />
          </div>
          <h1 className="text-8xl font-black text-slate-800 dark:text-white drop-shadow-2xl">سیستەمی بەدواداچوون</h1>
          <p className="text-4xl text-slate-600 dark:text-slate-400 mt-4 font-bold">شیکاری هۆشمەندی داتاکان</p>
          
          {activeNode === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-12 flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 p-6 rounded-3xl backdrop-blur-md shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <MousePointerClick size={40} className="text-blue-500 animate-bounce" />
              <span className="text-3xl font-bold text-slate-700 dark:text-slate-300">کلیک لەسەر بەشەکان بکە بۆ بینینی وردەکاری</span>
            </motion.div>
          )}
        </div>

        {/* Node 1: KPIs */}
        <div 
          className="absolute flex flex-col items-center justify-center w-[1200px] z-10"
          style={{ transform: `translate(${NODES[1].x}px, ${NODES[1].y}px)` }}
        >
          {/* Node Wrapper for clicking from map */}
          <div 
            className={`w-full h-full relative cursor-pointer transition-all duration-500 rounded-[3rem] ${activeNode !== 1 ? 'hover:scale-105' : 'cursor-default'}`}
            onClick={() => { if (activeNode !== 1) setActiveNode(1); }}
          >
            {activeNode !== 1 && (
              <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-[2px] rounded-[3rem] z-50 flex flex-col items-center justify-center border-4 border-slate-200/50 dark:border-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl px-12 py-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-200 dark:border-slate-700 transform transition-transform group-hover:scale-105">
                  <Layers size={80} className="text-blue-500 mb-6" />
                  <h2 className="text-5xl font-black text-slate-800 dark:text-white whitespace-nowrap">{NODES[1].title}</h2>
                </div>
              </div>
            )}
            
            <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] p-16 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800">
              <h2 className="text-5xl font-black mb-16 text-center text-slate-800 dark:text-slate-100 flex items-center justify-center gap-6">
                <Layers className="text-blue-500" size={56} />
                {NODES[1].title}
              </h2>
              
              <div className="grid grid-cols-3 gap-10 w-full">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-12 rounded-[2rem] flex flex-col items-center text-center border border-blue-100 dark:border-blue-800/50">
                  <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8">
                    <Layers size={48} />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-400 mb-4">کۆی گشتی نامەکان</h3>
                  <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">{totalLetters}</span>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-12 rounded-[2rem] flex flex-col items-center text-center border border-amber-100 dark:border-amber-800/50">
                  <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-8">
                    <AlertTriangle size={48} />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-400 mb-4">هەڵپەسێردراو</h3>
                  <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">{pendingLetters}</span>
                </div>
                
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-12 rounded-[2rem] flex flex-col items-center text-center border border-emerald-100 dark:border-emerald-800/50">
                  <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8">
                    <Clock size={48} />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-400 mb-4">تێکڕای کاتی وەڵام</h3>
                  <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">{avgProcessingTime.toFixed(1)} <span className="text-3xl font-medium text-slate-400">ڕۆژ</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Node 2: Departments */}
        <div 
          className="absolute flex flex-col items-center justify-center w-[1200px] z-10"
          style={{ transform: `translate(${NODES[2].x}px, ${NODES[2].y}px)` }}
        >
          <div 
            className={`w-full h-full relative cursor-pointer transition-all duration-500 rounded-[3rem] ${activeNode !== 2 ? 'hover:scale-105' : 'cursor-default'}`}
            onClick={() => { if (activeNode !== 2) setActiveNode(2); }}
          >
            {activeNode !== 2 && (
              <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-[2px] rounded-[3rem] z-50 flex flex-col items-center justify-center border-4 border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl px-12 py-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-200 dark:border-slate-700 transform transition-transform group-hover:scale-105">
                  <Building2 size={80} className="text-emerald-500 mb-6" />
                  <h2 className="text-5xl font-black text-slate-800 dark:text-white whitespace-nowrap">{NODES[2].title}</h2>
                </div>
              </div>
            )}
            
            <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] p-16 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800">
              <h2 className="text-5xl font-black mb-16 text-center text-slate-800 dark:text-slate-100 flex items-center justify-center gap-6">
                <Building2 className="text-emerald-500" size={56} />
                {NODES[2].title}
              </h2>
              
              <div className="w-full h-[600px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                    <XAxis dataKey="abbr" tick={{ fontSize: 18, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(100,116,139,0.1)' }}
                      contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }}
                      formatter={(value: any, name: any, props: any) => [value, props.payload.name]}
                    />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]} maxBarSize={80}>
                      <LabelList dataKey="count" position="top" offset={12} fill="#64748b" fontSize={18} fontWeight="bold" />
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Node 3: Types */}
        <div 
          className="absolute flex flex-col items-center justify-center w-[1200px] z-10"
          style={{ transform: `translate(${NODES[3].x}px, ${NODES[3].y}px)` }}
        >
          <div 
            className={`w-full h-full relative cursor-pointer transition-all duration-500 rounded-[3rem] ${activeNode !== 3 ? 'hover:scale-105' : 'cursor-default'}`}
            onClick={() => { if (activeNode !== 3) setActiveNode(3); }}
          >
            {activeNode !== 3 && (
              <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-[2px] rounded-[3rem] z-50 flex flex-col items-center justify-center border-4 border-slate-200/50 dark:border-slate-700/50 hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl px-12 py-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-200 dark:border-slate-700 transform transition-transform group-hover:scale-105">
                  <PieIcon size={80} className="text-purple-500 mb-6" />
                  <h2 className="text-5xl font-black text-slate-800 dark:text-white whitespace-nowrap">{NODES[3].title}</h2>
                </div>
              </div>
            )}
            
            <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] p-16 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800">
              <h2 className="text-5xl font-black mb-16 text-center text-slate-800 dark:text-slate-100 flex items-center justify-center gap-6">
                <PieIcon className="text-purple-500" size={56} />
                {NODES[3].title}
              </h2>
              
              <div className="grid grid-cols-2 gap-12 items-center">
                <div className="h-[600px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={150}
                        outerRadius={220}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-6" dir="rtl">
                  {typeData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="text-2xl font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                      </div>
                      <span className="text-3xl font-black text-slate-600 dark:text-slate-400">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Node 4: Timeline */}
        <div 
          className="absolute flex flex-col items-center justify-center w-[1200px] z-10"
          style={{ transform: `translate(${NODES[4].x}px, ${NODES[4].y}px)` }}
        >
          <div 
            className={`w-full h-full relative cursor-pointer transition-all duration-500 rounded-[3rem] ${activeNode !== 4 ? 'hover:scale-105' : 'cursor-default'}`}
            onClick={() => { if (activeNode !== 4) setActiveNode(4); }}
          >
            {activeNode !== 4 && (
              <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-[2px] rounded-[3rem] z-50 flex flex-col items-center justify-center border-4 border-slate-200/50 dark:border-slate-700/50 hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl px-12 py-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-200 dark:border-slate-700 transform transition-transform group-hover:scale-105">
                  <TrendingUp size={80} className="text-orange-500 mb-6" />
                  <h2 className="text-5xl font-black text-slate-800 dark:text-white whitespace-nowrap">{NODES[4].title}</h2>
                </div>
              </div>
            )}
            
            <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] p-16 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800">
              <h2 className="text-5xl font-black mb-16 text-center text-slate-800 dark:text-slate-100 flex items-center justify-center gap-6">
                <TrendingUp className="text-orange-500" size={56} />
                {NODES[4].title}
              </h2>
              
              <div className="w-full h-[600px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 30, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTimelinePrezi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }} />
                    <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={6} fillOpacity={1} fill="url(#colorTimelinePrezi)" dot={{ r: 8, stroke: '#f59e0b', strokeWidth: 4, fill: '#fff' }}>
                      <LabelList dataKey="count" position="top" offset={16} fill="#f59e0b" fontSize={20} fontWeight="bold" />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
