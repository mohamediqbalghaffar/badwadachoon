"use client";

import React, { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import { User, Activity, Clock, MonitorPlay } from "lucide-react";

interface SessionData {
  userId: string;
  name: string;
  role: string;
  activeView: string;
  lastActive: string;
  image: string | null;
}

export const ViewerSelectionScreen = () => {
  const { setViewerSelectedUserId } = useData();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/presence/sessions-with-data');
        if (res.ok && isSubscribed) {
          const json = await res.json();
          setSessions(json.sessions || []);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center p-8 pt-20 relative overflow-hidden" dir="rtl">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] bg-teal-500/10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[120px] bg-blue-500/10 pointer-events-none" />

      <div className="z-10 text-center mb-12 animate-fade-in">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-teal-400 to-blue-500 mb-4 flex items-center justify-center gap-3">
          <MonitorPlay size={40} className="text-teal-400" />
          پەخشی ڕاستەوخۆی داتا
        </h1>
        <p className="text-slate-400 text-lg">
          تکایە بەکارهێنەرێک هەڵبژێرە بۆ بینینی داتاکانی لە کاتی ڕاستەوخۆدا
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-20 z-10">
          <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-400">گەڕان بۆ پەخشی چالاک...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 z-10 glass p-12 rounded-3xl border border-white/5 max-w-lg text-center">
          <Activity size={64} className="text-slate-600 mb-6" />
          <h2 className="text-2xl font-bold text-slate-300 mb-2">هیچ پەخشێک بەردەست نییە</h2>
          <p className="text-slate-500">
            لە ئێستادا هیچ بەکارهێنەرێک داتای لۆکاڵی بەرزنەکردۆتەوە بۆ ئەوەی پەخشی بکات.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl z-10">
          {sessions.map((session) => (
            <div
              key={session.userId}
              onClick={() => setViewerSelectedUserId(session.userId)}
              className="glass p-6 rounded-2xl border border-white/10 hover:border-teal-500/50 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="relative">
                  {session.image ? (
                    <img src={session.image} alt={session.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/10 group-hover:border-teal-500/50 transition-colors" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-white/10 group-hover:border-teal-500/50 transition-colors">
                      <User size={32} className="text-slate-400" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0f172a] animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">{session.name}</h3>
                  <span className="text-sm text-slate-400">{session.userId}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500 relative z-10 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <MonitorPlay size={16} className="text-teal-500" />
                  <span>دۆخی پەخش: <strong className="text-slate-300">{session.activeView === 'received' ? 'هاتوو' : session.activeView === 'sent' ? 'ڕۆیشتوو' : 'بەراورد'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>زیندوو</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
