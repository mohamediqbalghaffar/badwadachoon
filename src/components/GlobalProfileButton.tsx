"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, ShieldCheck, LogOut, Database, Settings } from "lucide-react";
import Image from "next/image";

export const GlobalProfileButton = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getRoleText = (role: string) => {
    if (role === "admin") return "بەڕێوەبەر";
    if (role === "user") return "بەکارهێنەر";
    return "بینەر";
  };

  return (
    <div className="fixed top-6 left-6 z-[100] font-sans">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 backdrop-blur-md px-2 py-2 pr-5 rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_6px_25px_rgb(0,0,0,0.08)] group outline-none focus:ring-2 focus:ring-blue-500/50"
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
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute left-0 top-full mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 space-y-1" dir="rtl">
                
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent("open-admin-settings", { detail: { tab: "profile" } }));
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <div className="p-1.5 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-lg">
                    <Settings size={16} />
                  </div>
                  <span className="font-medium">ڕێکخستنەکانی هەژمار</span>
                </button>

                {user.role === "admin" && (
                  <>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        window.dispatchEvent(new CustomEvent("open-admin-settings", { detail: { tab: "database" } }));
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Database size={16} />
                      </div>
                      <span className="font-medium">ڕێکخستنی سیستەم</span>
                    </button>
                  </>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <div className="p-1.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
                    <LogOut size={16} />
                  </div>
                  <span className="font-medium">چوونە دەرەوە</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
