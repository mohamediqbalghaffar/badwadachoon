"use client";

import React, { useEffect, useState } from "react";
import { Users, Presentation, Radio, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type ActiveSession = {
  id: string;
  userId: string;
  name: string;
  role: string;
  activeView: string;
  lastActive: string;
};

export const LiveActivityTracker = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchPresence = async () => {
      try {
        const res = await fetch('/api/admin/presence');
        if (res.ok) {
          const data = await res.json();
          setSessions(data.activeSessions);
        }
      } catch (err) {
        console.error('Failed to fetch presence', err);
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 10000);
    return () => clearInterval(interval);
  }, [user?.role]);

  if (user?.role !== 'admin') return null;

  const getViewLabel = (view: string) => {
    switch (view) {
      case 'received': return 'پێویست بە وەڵام';
      case 'sent': return 'سەرجەم ڕەوانەکراوەکان';
      case 'comparison': return 'بەراوردکردن';
      case 'presentation': return 'دۆخی پێشکەشکردن';
      default: return 'نەزانراو';
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-[90] flex flex-col items-end"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Expanded Panel */}
      <div 
        className={`mb-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${
          isExpanded ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Radio size={14} className="text-emerald-500 animate-pulse" />
            چاودێری ڕاستەوخۆ
          </h3>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">
            {sessions.length} چاڵاک
          </span>
        </div>
        
        <div className="max-h-60 overflow-y-auto p-2 w-64 space-y-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 py-4">کەس لە هێڵ نییە</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${Date.now() - new Date(session.lastActive).getTime() < 15000 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize truncate max-w-[120px]" title={session.name}>
                      {session.name}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      {session.role === 'admin' ? 'بەڕێوەبەر' : session.role === 'user' ? 'بەکارهێنەر' : 'بینەر'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md truncate max-w-[80px]" title={getViewLabel(session.activeView)}>
                  {session.activeView === 'presentation' ? <Presentation size={10} className="mr-1" /> : <Eye size={10} className="mr-1" />}
                  {getViewLabel(session.activeView)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Button */}
      <button className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg px-4 py-3 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group">
        <div className="relative">
          <Users size={20} className="text-slate-700 dark:text-slate-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse" />
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {sessions.length}
        </span>
      </button>
    </div>
  );
};
