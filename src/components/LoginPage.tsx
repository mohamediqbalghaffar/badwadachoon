"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { HTSLogo } from "./HTSLogoBackground";
import { Lock, User, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";

export const LoginPage = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"staff" | "viewer">("staff");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [viewerCode, setViewerCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let success = false;
    if (activeTab === "staff") {
      success = login(username, password);
    } else {
      success = login("viewer", viewerCode);
    }

    if (!success) {
      setError("زانیارییەکان هەڵەن. تکایە دووبارە هەوڵ بدەرەوە.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="relative z-10 w-full h-full min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-12 md:top-20 animate-in fade-in slide-in-from-top-8 duration-1000">
        <HTSLogo className="w-48 md:w-64 h-auto drop-shadow-2xl opacity-90" />
      </div>

      <div 
        className={`w-full max-w-md mt-24 md:mt-32 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-3xl bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both ${shake ? "animate-shake" : ""}`}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
            چوونەژوورەوە
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            تکایە جۆری بەکارهێنەر هەڵبژێرە
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-8 bg-black/5 dark:bg-white/5 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => { setActiveTab("staff"); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "staff"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ShieldCheck size={16} />
            ستاف
          </button>
          <button
            onClick={() => { setActiveTab("viewer"); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "viewer"
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <User size={16} />
            بینەر
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {activeTab === "staff" ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">نازناو</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    dir="ltr"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-4 pr-12 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">تێپەڕوشە</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-4 pr-12 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">کۆدی بینین</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  dir="ltr"
                  value={viewerCode}
                  onChange={(e) => setViewerCode(e.target.value)}
                  className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-4 pr-12 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all backdrop-blur-sm tracking-widest text-center font-mono text-lg"
                  placeholder="CODE"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-rose-500 dark:text-rose-400 text-sm font-medium text-center bg-rose-50 dark:bg-rose-950/30 py-2 rounded-lg border border-rose-100 dark:border-rose-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
              activeTab === "staff"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25"
                : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-teal-500/25"
            }`}
          >
            <span>چوونەژوورەوە</span>
            <ArrowRight size={18} className="rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
