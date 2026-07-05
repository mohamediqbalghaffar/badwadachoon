"use client";

import React, { useEffect, useRef } from "react";
import { OmniFilter } from "./OmniFilter";
import { KPICards } from "./KPICards";
import { DashboardCharts } from "./Charts";
import { DataTable } from "./DataTable";
import { useData, ActiveView } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../context/PermissionsContext";
import Image from "next/image";
import { PresentationView } from "./PresentationView";
import { PreziPresentationView } from "./PreziPresentationView";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { SentDashboard } from "./SentDashboard";
import { ComparisonView } from "./ComparisonView";
import { IncomingView } from "./IncomingView";
import { motion, useAnimation } from "framer-motion";
import { MonitorPlay, X, Inbox, Send, GitCompareArrows, ArrowDownToLine, LogOut, User, ShieldCheck, Settings, Database, UploadCloud, Edit3, Filter, Sun, Moon } from "lucide-react";
import { parseFile } from "../utils/parser";
import { useTheme } from "next-themes";
import { AdminSettingsModal } from "./AdminSettingsModal";
import { LiveActivityTracker } from "./LiveActivityTracker";
import { AdminDataEntry } from "./AdminDataEntry";
import { DrillDownModal } from "./DrillDownModal";

const VIEW_SEGMENTS: { key: ActiveView; label: string; icon: React.ReactNode }[] = [
  { key: 'incoming', label: 'سەرجەم هاتووەکان', icon: <ArrowDownToLine size={16} /> },
  { key: 'received', label: 'پێویست بە وەڵام', icon: <Inbox size={16} /> },
  { key: 'sent', label: 'سەرجەم ڕەوانەکراوەکان', icon: <Send size={16} /> },
  { key: 'comparison', label: 'بەراوردکردن', icon: <GitCompareArrows size={16} /> },
];

export const Dashboard = () => {
  const filterControls = useAnimation();
  const { theme, setTheme } = useTheme();
  const { data, setData, sentData, setSentData, incomingData, setIncomingData, mode, isPresentationMode, setIsPresentationMode, activeView, setActiveView, clearFilters } = useData();
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const hasAnalytics = hasPermission('view:analytics');
  const hasPresentation = hasPermission('view:presentation');
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [adminModalTab, setAdminModalTab] = React.useState<'database' | 'approvals' | 'profile'>('database');
  const [isUploading, setIsUploading] = React.useState(false);
  const [showPresentationMenu, setShowPresentationMenu] = React.useState(false);
  const [presentationStyle, setPresentationStyle] = React.useState<'powerpoint' | 'prezi'>('powerpoint');
  const [scrolledPastTop, setScrolledPastTop] = React.useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [isDraggingFilter, setIsDraggingFilter] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolledPastTop(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (isPresentationMode) {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    }
  }, [isPresentationMode]);

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const parsedData = await parseFile(file);

      if (mode === 'live') {
        const clearRes = await fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clearFirst: true, receivedData: [], sentData: [], incomingData: [] })
        });
        if (!clearRes.ok) throw new Error('سێرڤەر نەیتوانی داتابەیس کۆن بسڕێتەوە');

        const CHUNK_SIZE = 500;
        for (let i = 0; i < parsedData.receivedData.length; i += CHUNK_SIZE) {
          await fetch('/api/db/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receivedData: parsedData.receivedData.slice(i, i + CHUNK_SIZE) })
          });
        }
        for (let i = 0; i < parsedData.sentData.length; i += CHUNK_SIZE) {
          await fetch('/api/db/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sentData: parsedData.sentData.slice(i, i + CHUNK_SIZE) })
          });
        }
        for (let i = 0; i < parsedData.incomingData.length; i += CHUNK_SIZE) {
          await fetch('/api/db/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ incomingData: parsedData.incomingData.slice(i, i + CHUNK_SIZE) })
          });
        }
      }

      setData(parsedData.receivedData);
      setSentData(parsedData.sentData);
      setIncomingData(parsedData.incomingData);
    } catch (err) {
      console.error(err);
      alert('هەڵەیەک ڕوویدا لە کاتی بارکردن');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Create a stable viewer ID for anonymous viewers
  const viewerIdRef = useRef(`viewer-${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    const broadcastPresence = async () => {
      try {
        await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            activeView: isPresentationMode ? 'presentation' : activeView,
            viewerId: user?.role === 'viewer' ? viewerIdRef.current : undefined,
            hasData: data.length > 0 || sentData.length > 0
          })
        });
      } catch (err) {
        // Silent fail for presence
      }
    };

    broadcastPresence();
    const interval = setInterval(broadcastPresence, 15000);
    return () => clearInterval(interval);
  }, [activeView, isPresentationMode, user, data.length, sentData.length]);

  useEffect(() => {
    if (user?.role !== 'viewer' && (data.length > 0 || sentData.length > 0)) {
      const uploadLocalData = async () => {
        try {
          // Strip _raw to drastically reduce JSON payload size and prevent Vercel 413 limit
          const strippedData = data.map(d => {
            const { _raw, ...rest } = d;
            return rest;
          });
          const strippedSentData = sentData.map(d => {
            const { _raw, ...rest } = d;
            return rest;
          });
          const strippedIncomingData = incomingData.map(d => {
            const { _raw, ...rest } = d;
            return rest;
          });

          // Wait 1.5 seconds to ensure the ActiveSession was created by the presence ping first (FK Constraint)
          await new Promise(resolve => setTimeout(resolve, 1500));

          await fetch('/api/presence/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: strippedData, sentData: strippedSentData, incomingData: strippedIncomingData })
          });
        } catch (err) {
          console.error("Failed to upload local data to presence cache:", err);
        }
      };

      uploadLocalData();
    }
  }, [data, sentData, incomingData, user]);

  useEffect(() => {
    const handleOpenSettings = (e: any) => {
      if (e.detail?.tab) {
        setAdminModalTab(e.detail.tab);
        setIsAdminSettingsOpen(true);
      }
    };
    window.addEventListener('open-admin-settings', handleOpenSettings);
    return () => window.removeEventListener('open-admin-settings', handleOpenSettings);
  }, []);

  const handleViewChange = (view: ActiveView) => {
    clearFilters();
    setActiveView(view);
  };

  const subtitles: Record<string, string> = {
    incoming: 'داشبۆردی شیکاری سەرجەم نووسراوە هاتووەکان',
    received: 'داشبۆردی بەدواداچوونی ئەو نامانەی پێویستیان بە وەڵامە',
    sent: 'داشبۆردی شیکاری سەرجەم نووسراوە ڕەوانەکراوەکان',
    comparison: 'بەراوردکردنی سەرجەم نامەکان لەگەڵ ئەوانەی پێویستیان بە وەڵامە',
    'data-entry': 'بەڕێوەبردنی داتای سیستەم',
  };

  return (
    <div className="w-full max-w-[98%] 2xl:max-w-[98%] mx-auto p-2 sm:p-4 lg:p-6 relative">
      {/* Presentation Mode Toggle (Only visible in presentation mode) */}
      {isPresentationMode && (
        <>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 sm:top-2 z-50">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-lg hover:scale-110 flex items-center gap-2 group border border-slate-300 dark:border-slate-700"
              title="دۆخی ڕووناکی / تاریک"
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
          <button
            onClick={() => setIsPresentationMode(false)}
          className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50 p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-lg hover:scale-110 flex items-center gap-2 group"
          title="داخستنی پێشکەشکردن"
        >
          <span className="hidden group-hover:block text-sm font-medium">داخستن</span>
          <X size={24} />
        </button>
        </>
      )}

      {!isPresentationMode ? (
        <>
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 animate-fade-up relative z-50">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-blue-600 to-red-600 dark:from-red-500 dark:via-blue-500 dark:to-red-500 text-gradient-animate pb-2 tracking-tight">
                بەدواداچوون
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg animate-fade-up delay-100">
                {subtitles[activeView] || ''}
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                {/* Presentation Button - Kept Outside */}
                {hasPresentation && (
                  <div className="relative bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-2 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <button 
                    onClick={() => setShowPresentationMenu(!showPresentationMenu)}
                    title="پێشکەشکردن"
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:bg-blue-500/10 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <MonitorPlay size={20} />
                  </button>

                  {/* Presentation Style Menu */}
                  {showPresentationMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowPresentationMenu(false)}></div>
                      <LiquidGlassCard
                        glowIntensity='sm'
                        shadowIntensity='md'
                        borderRadius='1rem'
                        blurIntensity='sm'
                        className="absolute top-full left-0 mt-3 w-64 p-2 z-50 animate-in fade-in zoom-in-95 border-t border-white/40 dark:border-white/10"
                      >
                        <button
                          onClick={() => {
                            setPresentationStyle('powerpoint');
                            setIsPresentationMode(true);
                            setShowPresentationMenu(false);
                          }}
                          className="w-full text-right px-4 py-3 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-300 mb-1 group flex justify-end"
                        >
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                            شێوازی ئاسایی (Classic)
                            <span className="text-blue-500 group-hover:scale-125 transition-transform">📊</span>
                          </div>
                        </button>
                        
                        <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-1 mx-2"></div>
                        
                        <button
                          onClick={() => {
                            setPresentationStyle('prezi');
                            setIsPresentationMode(true);
                            setShowPresentationMenu(false);
                          }}
                          className="w-full text-right px-4 py-3 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl transition-all duration-300 group flex justify-end"
                        >
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                            شێوازی نوێ (Prezi)
                            <span className="text-teal-500 group-hover:scale-125 transition-transform">🌌</span>
                          </div>
                        </button>
                      </LiquidGlassCard>
                    </>
                  )}
                  </div>
                )}

                {/* Direct Upload Button (Only when empty) */}
                {(data.length === 0 && sentData.length === 0 && incomingData.length === 0) && user?.role !== 'viewer' && (
                  <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg shadow-blue-500/30 transition-all group overflow-hidden cursor-pointer flex items-center justify-center">
                    <label className="flex items-center gap-2 cursor-pointer w-full h-full text-white">
                      {isUploading ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                         <UploadCloud size={20} className="group-hover:scale-110 transition-transform" />
                      )}
                      <span className="text-sm font-semibold whitespace-nowrap hidden sm:inline">
                        {isUploading ? 'بارکردن...' : 'بارکردنی داتابەیس'}
                      </span>
                      <input 
                        type="file" 
                        accept=".xlsx, .xls"
                        onChange={handleDirectUpload}
                        disabled={isUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                  </div>
                )}
                
                {/* Admin Data Entry Button */}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setActiveView('data-entry')}
                    title="بەڕێوەبردنی داتا"
                    className={`relative backdrop-blur-md px-4 py-2 rounded-2xl border transition-all flex items-center gap-2 ${
                      activeView === 'data-entry'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-lg shadow-amber-500/30'
                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Edit3 size={18} />
                    <span className="font-bold whitespace-nowrap">بەڕێوەبردنی داتا</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content Views */}
          {!hasAnalytics && activeView !== 'data-entry' ? (
            hasPresentation ? (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in">
                <MonitorPlay size={64} className="text-blue-500 mb-6" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 text-center">
                  شێوازی پێشکەشکردن هەڵبژێرە
                </h2>
                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl px-4 justify-center">
                  <button
                    onClick={() => {
                      setPresentationStyle('powerpoint');
                      setIsPresentationMode(true);
                    }}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 group flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform text-3xl">
                      📊
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      شێوازی ئاسایی (Classic)
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                      شێوازی ئاسایی پێشکەشکردن بە بەکارهێنانی چارتی سادە و ڕوون.
                    </p>
                  </button>
                  
                  <button
                    onClick={() => {
                      setPresentationStyle('prezi');
                      setIsPresentationMode(true);
                    }}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-300 group flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform text-3xl">
                      🌌
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      شێوازی نوێ (Prezi)
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                      شێوازی پێشکەوتوو بە جوڵە و ئەنیمەیشنی سەرنجڕاکێش.
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in">
                <ShieldCheck size={64} className="text-slate-300 dark:text-slate-700 mb-6" />
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">دەسەڵاتت نییە</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md text-center">
                  تکایە داوای دەسەڵات بکە لە بەڕێوەبەر بۆ بینینی ئەم پەڕەیە.
                </p>
              </div>
            )
          ) : (
            <>
              {/* 3-Segment View Switcher */}
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

              {/* Global Filter and KPIs for the 3 main views */}
              {(activeView === 'received' || activeView === 'sent' || activeView === 'incoming') && (
                <div className="flex flex-col gap-4 mb-4">
                  <div className="animate-fade-up delay-200 relative z-30">
                    <OmniFilter />
                  </div>
                  <div className="animate-fade-up delay-300 relative z-20">
                    <KPICards />
                  </div>
                </div>
              )}

              {/* Main Content — Conditional on activeView */}
              {activeView === 'incoming' && (
                <div className="animate-fade-in">
                  <IncomingView />
                </div>
              )}

              {activeView === 'received' && (
                <div className="flex flex-col gap-4">
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
          )}

          {activeView === 'data-entry' && (
            <div className="animate-fade-in">
              <AdminDataEntry />
            </div>
          )}
        </>
      ) : (
        <div className="animate-fade-in mt-12 sm:mt-0">
          {presentationStyle === 'powerpoint' ? <PresentationView /> : <PreziPresentationView />}
        </div>
      )}

      {/* Admin Settings Modal */}
      {isAdminSettingsOpen && <AdminSettingsModal onClose={() => setIsAdminSettingsOpen(false)} initialTab={adminModalTab} />}

      {/* Live Activity Tracker */}
      <LiveActivityTracker />

      {/* Floating Filter Button */}
      {(isPresentationMode || scrolledPastTop) && (activeView === 'received' || activeView === 'sent' || activeView === 'incoming') && (
        <motion.button
          drag
          dragElastic={0}
          dragMomentum={false}
          animate={filterControls}
          onDragStart={() => setIsDraggingFilter(true)}
          onDragEnd={(e, info) => {
            setTimeout(() => setIsDraggingFilter(false), 150);
            const windowWidth = document.documentElement.clientWidth;
            const buttonRect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect();
            const btnWidth = buttonRect?.width || 64;
            
            if (info.point.x < windowWidth / 2) {
              filterControls.start({ x: -(windowWidth - btnWidth - 32) });
            } else {
              filterControls.start({ x: 0 });
            }
          }}
          initial={{ right: '1rem', top: '50%', y: '-50%' }}
          style={{ position: 'fixed', zIndex: 60 }}
          onClick={() => {
            if (!isDraggingFilter) setIsFilterModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-colors group flex items-center justify-center animate-in fade-in cursor-grab active:cursor-grabbing"
          title="فلتەری کاتی"
        >
          <Filter size={24} className="group-hover:scale-110 transition-transform pointer-events-none" />
        </motion.button>
      )}

      {/* Floating Filter Modal */}
      {isFilterModalOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsFilterModalOpen(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[95%] max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Filter size={20} className="text-blue-500" />
                پاڵاوتنی داتا
              </h3>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="py-2">
              <OmniFilter inModal />
            </div>
            
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-6 py-2 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
              >
                پێشاندانی داتاکان
              </button>
            </div>
          </div>
        </>
      )}

      {/* Drill Down Modal */}
      <DrillDownModal />
    </div>
  );
};
