"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useData } from "../context/DataContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, Clock, AlertTriangle, Building2, PieChart as PieIcon, 
  TrendingUp, Map, ArrowRight, ArrowLeft, MousePointerClick, CheckCircle2,
  ArrowDownToLine, Inbox, Send, GitCompareArrows, BarChart2, Hash
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LabelList, Legend, LineChart, Line
} from "recharts";
import { format, parseISO, isValid, startOfMonth, parse } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const COLOR_MAP: Record<string, { bg: string, text: string, hoverText: string, hoverBorder: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-500', hoverText: 'group-hover:text-blue-500', hoverBorder: 'hover:border-blue-500' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', hoverText: 'group-hover:text-emerald-500', hoverBorder: 'hover:border-emerald-500' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-500', hoverText: 'group-hover:text-purple-500', hoverBorder: 'hover:border-purple-500' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-500', hoverText: 'group-hover:text-orange-500', hoverBorder: 'hover:border-orange-500' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', hoverText: 'group-hover:text-indigo-500', hoverBorder: 'hover:border-indigo-500' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-500', hoverText: 'group-hover:text-teal-500', hoverBorder: 'hover:border-teal-500' },
};

const getAbbr = (name: string) => {
  if (!name) return '';
  const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
  const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
  const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
  return abbr || name.charAt(0);
};

const NodeWrapper = ({ active, node, onClick, children }: any) => {
  const colors = COLOR_MAP[node.color] || COLOR_MAP.blue;
  const Icon = node.icon;
  return (
    <div 
      className="absolute flex flex-col items-center justify-center w-[1000px] z-10"
      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
    >
      <div 
        className={`w-full h-full relative cursor-pointer transition-all duration-500 rounded-[3rem] ${!active ? 'hover:scale-105' : 'cursor-default'}`}
        onClick={() => { if (!active) onClick(); }}
      >
        {!active && (
          <div className={`absolute inset-0 bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-[2px] rounded-[3rem] z-50 flex flex-col items-center justify-center border-4 border-slate-200/50 dark:border-slate-700/50 ${colors.hoverBorder} transition-colors`}>
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl px-10 py-6 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-200 dark:border-slate-700 transform transition-transform group-hover:scale-105">
              <Icon size={64} className={`${colors.text} mb-4`} />
              <h2 className="text-4xl font-black text-slate-800 dark:text-white whitespace-nowrap">{node.title}</h2>
            </div>
          </div>
        )}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800">
          <h2 className="text-4xl font-black mb-10 text-center text-slate-800 dark:text-slate-100 flex items-center justify-center gap-6">
            <Icon className={colors.text} size={48} />
            {node.title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

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

  useEffect(() => {
    setActiveNode(0);
  }, [activeView]);

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
  }, [NODES.length]);

  const activeNodeData = NODES[activeNode] || NODES[0];

  const safeData = currentData as any[];
  
  const totalLetters = safeData.length;
  const pendingLetters = safeData.filter((item) => !item.responseDate).length;
  const completedLetters = safeData.filter((item) => item.processingTime !== null && item.processingTime !== undefined);
  const avgProcessingTime = completedLetters.length > 0 ? completedLetters.reduce((acc, curr) => acc + (curr.processingTime ?? 0), 0) / completedLetters.length : 0;

  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    const key = activeNodeData.dataKey || 'departments';
    safeData.forEach((d) => {
      if (key === 'departments' && Array.isArray(d.departments)) {
        d.departments.forEach((dept: string) => { counts[dept] = (counts[dept] || 0) + 1; });
      } else if (d[key]) {
        counts[d[key]] = (counts[d[key]] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, abbr: getAbbr(name) })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [currentData, activeNodeData.dataKey]);

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
      name: dept,
      abbr: getAbbr(dept),
      received: recCounts[dept] || 0,
      sent: sentCounts[dept] || 0,
      total: (recCounts[dept] || 0) + (sentCounts[dept] || 0)
    })).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [baseFilteredData, baseFilteredSentData, activeView]);

  const comparisonTimelineData = useMemo(() => {
    if (activeView !== 'comparison') return [];
    const dates = new Set<string>();
    const recCounts: Record<string, number> = {};
    const sentCounts: Record<string, number> = {};
    
    baseFilteredData.forEach(d => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          dates.add(monthStr); recCounts[monthStr] = (recCounts[monthStr] || 0) + 1;
        }
      }
    });
    baseFilteredSentData.forEach(d => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          dates.add(monthStr); sentCounts[monthStr] = (sentCounts[monthStr] || 0) + 1;
        }
      }
    });
    return Array.from(dates).map(date => ({
      date,
      received: recCounts[date] || 0,
      sent: sentCounts[date] || 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [baseFilteredData, baseFilteredSentData, activeView]);

  const renderNodeContent = (node: any, isActive: boolean) => {
    if (!isActive && node.type !== 'map') return null;

    if (node.type === 'map') {
      return (
        <div 
          className="absolute flex flex-col items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-110 z-10"
          style={{ transform: `translate(0px, 0px)` }}
          onClick={() => setActiveNode(0)}
        >
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_0_100px_rgba(59,130,246,0.6)] flex items-center justify-center mb-6">
            <Map size={100} className="text-white" />
          </div>
          <h1 className="text-8xl font-black text-slate-800 dark:text-white drop-shadow-2xl">سیستەمی بەدواداچوون</h1>
          <p className="text-4xl text-slate-600 dark:text-slate-400 mt-4 font-bold">شیکاری هۆشمەندی داتاکان</p>
          
          {isActive && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-12 flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 p-6 rounded-3xl backdrop-blur-md shadow-2xl border border-slate-200 dark:border-slate-700"
            >
              <MousePointerClick size={40} className="text-blue-500 animate-bounce" />
              <span className="text-3xl font-bold text-slate-700 dark:text-slate-300">کلیک لەسەر بەشەکان بکە بۆ بینینی وردەکاری</span>
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <NodeWrapper active={isActive} node={node} onClick={() => setActiveNode(node.id)}>
        {node.type === 'kpi-received' && (
          <div className="grid grid-cols-3 gap-8 w-full">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2rem] flex flex-col items-center text-center border border-blue-100 dark:border-blue-800/50">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <Layers size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">کۆی گشتی نامەکان</h3>
              <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">{totalLetters}</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-[2rem] flex flex-col items-center text-center border border-amber-100 dark:border-amber-800/50">
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">هەڵپەسێردراو</h3>
              <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">{pendingLetters}</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2rem] flex flex-col items-center text-center border border-emerald-100 dark:border-emerald-800/50">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                <Clock size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">تێکڕای کاتی وەڵام</h3>
              <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">{avgProcessingTime.toFixed(1)} <span className="text-2xl font-medium text-slate-400">ڕۆژ</span></span>
            </div>
          </div>
        )}

        {node.type === 'kpi-incoming' && (
          <div className="flex justify-center w-full">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-12 rounded-[2rem] flex flex-col items-center text-center border border-blue-100 dark:border-blue-800/50 w-2/3">
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8">
                <ArrowDownToLine size={48} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-400 mb-4">کۆی گشتی هاتووەکان</h3>
              <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">{totalLetters}</span>
            </div>
          </div>
        )}

        {node.type === 'kpi-sent' && (
          <div className="flex justify-center w-full">
            <div className="bg-teal-50 dark:bg-teal-900/20 p-12 rounded-[2rem] flex flex-col items-center text-center border border-teal-100 dark:border-teal-800/50 w-2/3">
              <div className="w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-800/50 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-8">
                <Send size={48} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-400 mb-4">کۆی گشتی ڕەوانەکراوەکان</h3>
              <span className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500">{totalLetters}</span>
            </div>
          </div>
        )}

        {node.type === 'kpi-comparison' && (
          <div className="grid grid-cols-3 gap-8 w-full">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-[2rem] flex flex-col items-center text-center border border-purple-100 dark:border-purple-800/50">
              <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <ArrowDownToLine size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">کۆی هاتووەکان</h3>
              <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-fuchsia-500">{baseFilteredIncomingData.length}</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2rem] flex flex-col items-center text-center border border-blue-100 dark:border-blue-800/50">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <Inbox size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">پێویست بە وەڵام</h3>
              <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">{baseFilteredData.length}</span>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 p-8 rounded-[2rem] flex flex-col items-center text-center border border-teal-100 dark:border-teal-800/50">
              <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-800/50 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6">
                <Send size={40} />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">کۆی ڕەوانەکراوەکان</h3>
              <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500">{baseFilteredSentData.length}</span>
            </div>
          </div>
        )}

        {node.type === 'bar' && (
          <div className="w-full h-[450px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="abbr" tick={{ fontSize: 18, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(100,116,139,0.1)' }} contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }} formatter={(value: any, name: any, props: any) => [value, props.payload.name]} />
                <Bar dataKey="count" radius={[12, 12, 0, 0]} maxBarSize={80}>
                  <LabelList dataKey="count" position="top" offset={12} fill="#64748b" fontSize={18} fontWeight="bold" />
                  {barData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {node.type === 'comp-bar' && (
          <div className="w-full h-[450px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonDeptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="abbr" tick={{ fontSize: 18, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(100,116,139,0.1)' }} contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="received" name="پێویست بە وەڵام" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="sent" name="ڕەوانەکراوەکان" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {node.type === 'pie' && (
          <div className="grid grid-cols-2 gap-8 items-center w-full">
            <div className="h-[450px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={120} outerRadius={180} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1rem', padding: '1rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4" dir="rtl">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full shadow-md" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                  </div>
                  <span className="text-2xl font-black text-slate-600 dark:text-slate-400">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {node.type === 'timeline' && (
          <div className="w-full h-[450px]" dir="ltr">
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
                <Area type="monotone" dataKey="count" stroke={node.color === 'orange' ? '#f59e0b' : '#3b82f6'} strokeWidth={6} fillOpacity={1} fill={`url(#colorTimeline-${node.color})`} dot={{ r: 8, stroke: node.color === 'orange' ? '#f59e0b' : '#3b82f6', strokeWidth: 4, fill: '#fff' }}>
                  <LabelList dataKey="count" position="top" offset={16} fill={node.color === 'orange' ? '#f59e0b' : '#3b82f6'} fontSize={20} fontWeight="bold" />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {node.type === 'comp-timeline' && (
          <div className="w-full h-[450px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonTimelineData} margin={{ top: 30, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 18, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: '1.2rem', padding: '1rem' }} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="received" name="پێویست بە وەڵام" stroke="#3b82f6" strokeWidth={6} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="sent" name="ڕەوانەکراوەکان" stroke="#10b981" strokeWidth={6} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </NodeWrapper>
    );
  };

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
          onClick={() => { setActiveView('incoming'); }} 
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'incoming' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <ArrowDownToLine size={18} />
          <span className="hidden sm:inline">سەرجەم هاتووەکان</span>
        </button>
        <button 
          onClick={() => { setActiveView('received'); }} 
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'received' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <Inbox size={16} />
          <span className="hidden sm:inline">پێویست بە وەڵام</span>
        </button>
        <button 
          onClick={() => { setActiveView('sent'); }} 
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${activeView === 'sent' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <Send size={16} />
          <span className="hidden sm:inline">سەرجەم ڕەوانەکراوەکان</span>
        </button>
        <button 
          onClick={() => { setActiveView('comparison'); }} 
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
        transition={{ type: "spring", stiffness: 70, damping: 18, mass: 1.2 }}
        style={{ width: '4000px', height: '3000px' }}
      >
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

        {NODES.map((node, index) => (
          <React.Fragment key={node.key}>
            {renderNodeContent(node, activeNode === index)}
          </React.Fragment>
        ))}

      </motion.div>
    </div>
  );
};
