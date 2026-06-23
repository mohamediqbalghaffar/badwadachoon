"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, ShieldCheck, LogOut, Database, Settings } from "lucide-react";
import Image from "next/image";
import { LiquidGlassCard } from "./ui/liquid-glass";

export const GlobalProfileButton = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getRoleText = (role: string | null) => {
    if (role === "admin") return "بەڕێوەبەر";
    if (role === "user") return "بەکارهێنەر";
    return "بینەر";
  };

  return (
    <div className="fixed top-6 left-6 z-[100] font-sans">
      <div className="relative">
        <LiquidGlassCard
          glowIntensity="sm"
          shadowIntensity="sm"
          blurIntensity="sm"
          borderRadius="2rem"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-2 py-2 pr-5 transition-all duration-300 group outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          dir="ltr"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-inner transition-transform duration-300 overflow-hidden ${isOpen ? "scale-105 ring-2 ring-blue-500/30" : "group-hover:scale-105"} ${user.role === "admin" ? "bg-blue-600" : user.role === "user" ? "bg-indigo-600" : "bg-teal-600"}`}>
            {(user as any).image ? (
              <Image src={(user as any).image} alt="Profile" width={44} height={44} className="object-cover w-full h-full" />
            ) : (
              <User size={22} className="opacity-90" />
            )}
          </div>

          <div className="flex flex-col items-start pr-2">
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{user.username}</span>
            <div className="flex items-center gap-1.5 mt-0.5" dir="rtl">
              <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                {getRoleText(user.role)}
              </span>
              {user.role === "admin" && <ShieldCheck size={14} className="text-blue-500" />}
            </div>
          </div>
        </LiquidGlassCard>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <LiquidGlassCard 
              glowIntensity="sm"
              shadowIntensity="md"
              blurIntensity="sm"
              borderRadius="16px"
              className="absolute left-0 top-full mt-3 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200 p-2"
            >
              <div className="space-y-1 relative z-30" dir="rtl">
                
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent("open-admin-settings", { detail: { tab: "profile" } }));
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-colors font-medium"
                >
                  <div className="p-1.5 bg-violet-100/50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-lg backdrop-blur-md">
                    <Settings size={16} />
                  </div>
                  <span>ڕێکخستنەکانی هەژمار</span>
                </button>

                {user.role === "admin" && (
                  <>
                    <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-1 mx-2"></div>
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        window.dispatchEvent(new CustomEvent("open-admin-settings", { detail: { tab: "database" } }));
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-colors font-medium"
                    >
                      <div className="p-1.5 bg-blue-100/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg backdrop-blur-md">
                        <Database size={16} />
                      </div>
                      <span>ڕێکخستنی سیستەم</span>
                    </button>
                  </>
                )}

                <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 my-1 mx-2"></div>

                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
                >
                  <div className="p-1.5 bg-rose-100/50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg backdrop-blur-md">
                    <LogOut size={16} />
                  </div>
                  <span>چوونە دەرەوە</span>
                </button>
              </div>
            </LiquidGlassCard>
          </>
        )}
      </div>
    </div>
  );
};
