"use client";

import React, { useEffect, useRef } from "react";
import { OmniFilter } from "./OmniFilter";
import { KPICards } from "./KPICards";
import { DashboardCharts } from "./Charts";
import { DataTable } from "./DataTable";
import { useData, ActiveView } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { PresentationView } from "./PresentationView";
import { SentDashboard } from "./SentDashboard";
import { ComparisonView } from "./ComparisonView";
import { MonitorPlay, X, Inbox, Send, GitCompareArrows, LogOut, User, ShieldCheck, Settings, Database, UploadCloud } from "lucide-react";
import { parseFile } from "../utils/parser";
import { AdminSettingsModal } from "./AdminSettingsModal";
import { LiveActivityTracker } from "./LiveActivityTracker";

const VIEW_SEGMENTS: { key: ActiveView; label: string; icon: React.ReactNode }[] = [
  { key: 'received', label: 'پێویست بە وەڵام', icon: <Inbox size={16} /> },
  { key: 'sent', label: 'سەرجەم ڕەوانەکراوەکان', icon: <Send size={16} /> },
  { key: 'comparison', label: 'بەراوردکردن', icon: <GitCompareArrows size={16} /> },
];

export const Dashboard = () => {
  const { data, setData, sentData, setSentData, mode, isPresentationMode, setIsPresentationMode, activeView, setActiveView, clearFilters } = useData();
  const { user, logout } = useAuth();
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [adminModalTab, setAdminModalTab] = React.useState<'database' | 'approvals' | 'profile'>('database');
  const [isUploading, setIsUploading] = React.useState(false);

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
          body: JSON.stringify({ clearFirst: true })
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
      }

      setData(parsedData.receivedData);
      setSentData(parsedData.sentData);
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

          // Wait 1.5 seconds to ensure the ActiveSession was created by the presence ping first (FK Constraint)
          await new Promise(resolve => setTimeout(resolve, 1500));

          await fetch('/api/presence/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: strippedData, sentData: strippedSentData })
          });
        } catch (err) {
          console.error("Failed to upload local data to presence cache:", err);
        }
      };

      uploadLocalData();
    }
  }, [data, sentData, user]);

  const handleViewChange = (view: ActiveView) => {
    clearFilters();
    setActiveView(view);
  };

  const subtitles: Record<ActiveView, string> = {
    received: 'داشبۆردی بەدواداچوونی ئەو نامانەی پێویستیان بە وەڵامە',
    sent: 'داشبۆردی شیکاری سەرجەم نووسراوە ڕەوانەکراوەکان',
    comparison: 'بەراوردکردنی سەرجەم نامەکان لەگەڵ ئەوانەی پێویستیان بە وەڵامە',
  };

  return (
    <div className="w-full max-w-[95%] 2xl:max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 relative">
      {/* Presentation Mode Toggle (Only visible in presentation mode) */}
      {isPresentationMode && (
        <button
          onClick={() => setIsPresentationMode(false)}
          className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50 p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-lg hover:scale-110 flex items-center gap-2 group"
          title="داخستنی پێشکەشکردن"
        >
          <span className="hidden group-hover:block text-sm font-medium">داخستن</span>
          <X size={24} />
        </button>
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
                {subtitles[activeView]}
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                {/* Presentation Button - Kept Outside */}
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-2 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <button 
                    onClick={() => setIsPresentationMode(true)}
                    title="پێشکەشکردن"
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:bg-blue-500/10 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <MonitorPlay size={20} />
                  </button>
                </div>

                {/* Direct Upload Button (Only when empty) */}
                {(data.length === 0 && sentData.length === 0) && user?.role === 'admin' && (
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

                {/* Profile Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-3 bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">{user.username}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {user.role === 'admin' && <ShieldCheck size={12} className="text-blue-500" />}
                        {user.role === 'admin' ? 'بەڕێوەبەر' : user.role === 'user' ? 'بەکارهێنەر' : 'بینەر'}
                      </span>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-transform overflow-hidden ${isProfileMenuOpen ? 'scale-105' : ''} ${user.role === 'admin' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : user.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-br from-teal-500 to-teal-600'}`}>
                      {(user as any).image ? (
                        <Image src={(user as any).image} alt="Profile" width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                      <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 space-y-1">
                          
                          {user.role === 'admin' && (
                            <>
                              <button 
                                onClick={() => {
                                  setAdminModalTab('database');
                                  setIsAdminSettingsOpen(true);
                                  setIsProfileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                              >
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                  <Database size={16} />
                                </div>
                                <span className="font-medium">ڕێکخستنەکانی داتابەیس</span>
                              </button>

                              <button 
                                onClick={() => {
                                  setAdminModalTab('approvals');
                                  setIsAdminSettingsOpen(true);
                                  setIsProfileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                              >
                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                  <ShieldCheck size={16} />
                                </div>
                                <span className="font-medium">پەسەندکردنی بەکارهێنەر</span>
                              </button>
                            </>
                          )}

                          <button 
                            onClick={() => {
                              setAdminModalTab('profile');
                              setIsAdminSettingsOpen(true);
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                          >
                            <div className="p-1.5 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-lg">
                              <User size={16} />
                            </div>
                            <span className="font-medium">ڕێکخستنەکانی هەژمار</span>
                          </button>

                          <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>

                          <button 
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                          >
                            <div className="p-1.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
                              <LogOut size={16} />
                            </div>
                            <span className="font-medium">چوونەدەرەوە</span>
                          </button>
                          
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

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

      {/* Admin Settings Modal */}
      {isAdminSettingsOpen && <AdminSettingsModal onClose={() => setIsAdminSettingsOpen(false)} initialTab={adminModalTab} />}

      {/* Live Activity Tracker */}
      <LiveActivityTracker />
    </div>
  );
};
