"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, KeyRound, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const PendingApprovalView = () => {
  const { user, updateSession, logout } = useAuth();
  const [status, setStatus] = useState<string>(user?.status || "pending");
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === "pending") {
      interval = setInterval(async () => {
        try {
          const res = await fetch("/api/auth/status");
          if (res.ok) {
            const data = await res.json();
            setStatus(data.status);
            if (data.status === "approved" && data.authCode) {
              setAuthCode(data.authCode);
            }
          }
        } catch (err) {
          console.error("Failed to fetch status", err);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode }),
      });

      if (res.ok) {
        await updateSession();
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || "کۆدەکە هەڵەیە");
      }
    } catch (err) {
      setError("هەڵەیەک ڕوویدا");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 w-full h-full min-h-[135vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-[2.5rem] backdrop-blur-3xl bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
        
        {status === "pending" && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-4 animate-pulse">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">چاوەڕێی پەسەندکردن</h2>
            <p className="text-slate-500 dark:text-slate-400">
              هەژمارەکەت پێویستی بە پەسەندکردنە لەلایەن بەڕێوەبەرەوە. تکایە چاوەڕێ بکە.
            </p>
            <div className="pt-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}

        {status === "approved" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">پەسەندکرا!</h2>
              <p className="text-slate-500 dark:text-slate-400">
                هەژمارەکەت پەسەندکرا. ئەم کۆدەی خوارەوە بەکاربهێنە بۆ چوونەژوورەوە:
              </p>
              
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-3xl font-mono tracking-[0.5em] font-bold text-blue-600 dark:text-blue-400 select-all">
                {authCode}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">کۆدی چوونەژوورەوە لێرە بنووسە:</label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 px-4 text-center text-lg font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="XXXXXX"
                  required
                />
                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            {error && (
              <div className="text-rose-500 text-sm text-center bg-rose-50 dark:bg-rose-950/30 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !inputCode}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg disabled:opacity-50"
            >
              <span>چەسپاندن</span>
              <ArrowRight size={18} className="rotate-180" />
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <button 
            onClick={logout}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            چوونەدەرەوە
          </button>
        </div>
      </div>
    </div>
  );
};
