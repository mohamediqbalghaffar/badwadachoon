"use client";

import React from "react";
import { OmniFilter } from "./OmniFilter";
import { KPICards } from "./KPICards";
import { DashboardCharts } from "./Charts";
import { DataTable } from "./DataTable";
import { useData } from "../context/DataContext";
import { PresentationView } from "./PresentationView";
import { SentDashboard } from "./SentDashboard";
import { ComparisonView } from "./ComparisonView";
import { MonitorPlay, X, Inbox, Send, GitCompareArrows } from "lucide-react";
import { ActiveView } from "../context/DataContext";

const VIEW_SEGMENTS: { key: ActiveView; label: string; icon: React.ReactNode }[] = [
  { key: 'received', label: 'نووسراوە نێردراوەکان', icon: <Inbox size={16} /> },
  { key: 'sent', label: 'نووسراوە ڕەوانەکراوەکان', icon: <Send size={16} /> },
  { key: 'comparison', label: 'بەراوردکردن', icon: <GitCompareArrows size={16} /> },
];

export const Dashboard = () => {
  const { isPresentationMode, setIsPresentationMode, activeView, setActiveView, sentData, clearFilters } = useData();

  const handleViewChange = (view: ActiveView) => {
    clearFilters();
    setActiveView(view);
  };

  const subtitles: Record<ActiveView, string> = {
    received: 'داشبۆردی شیکاری داتای نامەکان و بەدواداچوونی مامەڵەکان',
    sent: 'داشبۆردی شیکاری داتای نووسراوە ڕەوانەکراوەکان',
    comparison: 'بەراوردکردنی داتای نووسراوە نێردراوەکان و ڕەوانەکراوەکان',
  };

  return (
    <div className="w-full max-w-[95%] 2xl:max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 relative">
      {/* Presentation Mode Toggle */}
      <button
        onClick={() => setIsPresentationMode(!isPresentationMode)}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50 p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-lg hover:scale-110 flex items-center gap-2 group"
        title={isPresentationMode ? "داخستنی پێشکەشکردن" : "پێشکەشکردن"}
      >
        {isPresentationMode ? (
          <>
            <span className="hidden group-hover:block text-sm font-medium">داخستن</span>
            <X size={24} />
          </>
        ) : (
          <>
            <span className="hidden group-hover:block text-sm font-medium">پێشکەشکردن</span>
            <MonitorPlay size={24} />
          </>
        )}
      </button>

      {!isPresentationMode ? (
        <>
          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-blue-600 to-red-600 dark:from-red-500 dark:via-blue-500 dark:to-red-500 text-gradient-animate pb-2 tracking-tight">
              بەدواداچوون
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg animate-fade-up delay-100">
              {subtitles[activeView]}
            </p>
          </div>

          {/* 3-Segment View Switcher */}
          {sentData.length > 0 && (
            <div className="flex justify-center mb-6 animate-fade-up delay-100">
              <div className="inline-flex items-center p-1.5 rounded-2xl glass glass-card shadow-lg border border-white/20 dark:border-slate-700/50 gap-1">
                {VIEW_SEGMENTS.map((seg) => {
                  const isActive = activeView === seg.key;
                  return (
                    <button
                      key={seg.key}
                      onClick={() => handleViewChange(seg.key)}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer select-none whitespace-nowrap ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                        {seg.icon}
                      </span>
                      <span className="hidden sm:inline">{seg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Content — Conditional on activeView */}
          {activeView === 'received' && (
            <div className="flex flex-col gap-4">
              <div className="animate-fade-up delay-200 relative z-30">
                <OmniFilter />
              </div>
              <div className="animate-fade-up delay-300 relative z-20">
                <KPICards />
              </div>
              <div className="animate-fade-up delay-400 relative z-10">
                <DashboardCharts />
              </div>
              <div className="animate-fade-up delay-500 relative z-0">
                <DataTable />
              </div>
            </div>
          )}

          {activeView === 'sent' && (
            <div className="animate-fade-in">
              <SentDashboard />
            </div>
          )}

          {activeView === 'comparison' && (
            <div className="animate-fade-in">
              <ComparisonView />
            </div>
          )}
        </>
      ) : (
        <div className="animate-fade-in mt-12 sm:mt-0">
          <PresentationView />
        </div>
      )}
    </div>
  );
};
