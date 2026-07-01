"use client";

import React from "react";
import { useData } from "../context/DataContext";
import { Layers, Clock, AlertTriangle, Building2, PieChart as PieIcon, Send, ArrowDownToLine } from "lucide-react";

export const KPICards = () => {
  const { baseFilteredData, baseFilteredSentData, baseFilteredIncomingData, activeView, setFilters, clearFilters } = useData();

  if (activeView === 'sent') {
    const totalLetters = baseFilteredSentData.length;
    const uniqueDepts = new Set(baseFilteredSentData.flatMap(d => d.departments || [])).size;
    const uniqueTypes = new Set(baseFilteredSentData.map(d => d.letterType)).size;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass glass-card p-6 flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">کۆی گشتی ڕەوانەکراو</p>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">{totalLetters}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative z-10">
            <Send size={24} />
          </div>
        </div>
        <div className="glass glass-card p-6 flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">کۆی لایەنەکان</p>
            <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200">{uniqueDepts}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 relative z-10">
            <Building2 size={24} />
          </div>
        </div>
        <div className="glass glass-card p-6 flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">جۆرەکانی نامە</p>
            <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200">{uniqueTypes}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 relative z-10">
            <PieIcon size={24} />
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'incoming') {
    const totalLetters = baseFilteredIncomingData.length;
    const uniqueSenders = new Set(baseFilteredIncomingData.map(d => d.sender).filter(Boolean)).size;
    const uniqueTypes = new Set(baseFilteredIncomingData.map(d => d.letterType)).size;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass glass-card p-6 flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">کۆی گشتی هاتووەکان</p>
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">{totalLetters}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 relative z-10">
            <ArrowDownToLine size={24} />
          </div>
        </div>
        <div className="glass glass-card p-6 flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">سەرچاوەکان (نێرەر)</p>
            <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200">{uniqueSenders}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative z-10">
            <Building2 size={24} />
          </div>
        </div>
        <div className="glass glass-card p-6 flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">جۆرەکانی نامە</p>
            <h3 className="text-3xl font-bold text-slate-700 dark:text-slate-200">{uniqueTypes}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 relative z-10">
            <PieIcon size={24} />
          </div>
        </div>
      </div>
    );
  }

  const totalLetters = baseFilteredData.length;
  const pendingLetters = baseFilteredData.filter((item) => !item.responseDate).length;
  
  const completedLetters = baseFilteredData.filter((item) => item.processingTime !== null);
  const avgProcessingTime =
    completedLetters.length > 0
      ? completedLetters.reduce((acc, curr) => acc + (curr.processingTime ?? 0), 0) / completedLetters.length
      : 0;

  const handleCardClick = (status: 'all' | 'pending' | 'completed') => {
    if (status === 'all') {
      clearFilters();
    } else {
      setFilters(prev => ({ ...prev, completionStatus: status }));
    }
    document.getElementById('data-table-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Letters */}
      <div 
        onClick={() => handleCardClick('all')}
        className="glass glass-card glass-interactive p-6 flex items-center justify-between group cursor-pointer relative overflow-hidden"
      >
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">کۆی گشتی نامەکان</p>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            {totalLetters}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:animate-pulse-ring relative z-10 transition-colors">
          <Layers size={24} className="group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
      </div>

      {/* Pending Letters */}
      <div 
        onClick={() => handleCardClick('pending')}
        className="glass glass-card glass-interactive p-6 flex items-center justify-between group cursor-pointer relative overflow-hidden"
      >
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">نامە هەڵپەسێردراوەکان (بێ وەڵام)</p>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">
            {pendingLetters}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:animate-pulse-ring relative z-10 transition-colors">
          <AlertTriangle size={24} className="group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />
      </div>

      {/* Avg Processing Time */}
      <div 
        onClick={() => handleCardClick('completed')}
        className="glass glass-card glass-interactive p-6 flex items-center justify-between group cursor-pointer relative overflow-hidden"
      >
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">تێکڕای کاتی وەڵامدانەوە</p>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 flex items-baseline gap-1">
            {avgProcessingTime.toFixed(1)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">ڕۆژ</span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:animate-pulse-ring relative z-10 transition-colors">
          <Clock size={24} className="group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
      </div>
    </div>
  );
};
