"use client";

import React, { useState } from "react";
import { HTSLogo } from "./HTSLogoBackground";
import { Database, Laptop, X } from "lucide-react";
import { AdminMode } from "../context/DataContext";

interface LandingPortalsProps {
  onSelectAdmin: (mode: AdminMode) => void;
}

export const LandingPortals: React.FC<LandingPortalsProps> = ({ onSelectAdmin }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const liquidGlassClasses = "group relative flex flex-col items-center justify-center h-36 w-full max-w-[220px] mx-auto rounded-[2rem] backdrop-blur-[40px] bg-white/5 dark:bg-black/10 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 hover:scale-[1.05] ring-1 ring-inset ring-white/40 dark:ring-white/20 hover:shadow-2xl hover:bg-white/10 dark:hover:bg-white/5 z-10";

  return (
    <div className="relative z-10 w-full h-full min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-10 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <HTSLogo className="w-56 md:w-72 h-auto drop-shadow-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        {/* گەنجینە */}
        <button
          onClick={() => showToast("ئەم بەشە لە قۆناغی پەرەپێداندایە")}
          className={liquidGlassClasses}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/0 dark:from-orange-500/20 dark:to-orange-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h2 className="text-2xl font-semibold tracking-wide text-slate-800 dark:text-slate-100 z-10">گەنجینە</h2>
        </button>

        {/* کارگێڕی (Active) */}
        <button
          onClick={() => setShowModeModal(true)}
          className={`${liquidGlassClasses} ring-blue-400/30 dark:ring-blue-500/30 hover:shadow-blue-500/20 dark:hover:shadow-blue-500/20`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/0 dark:from-blue-500/20 dark:to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h2 className="text-2xl font-semibold tracking-wide text-slate-800 dark:text-slate-100 z-10">کارگێڕی</h2>
        </button>

        {/* تەکنیکی */}
        <button
          onClick={() => showToast("ئەم بەشە لە قۆناغی پەرەپێداندایە")}
          className={liquidGlassClasses}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/0 dark:from-emerald-500/20 dark:to-emerald-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h2 className="text-2xl font-semibold tracking-wide text-slate-800 dark:text-slate-100 z-10">تەکنیکی</h2>
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-slate-800/90 dark:bg-slate-200/90 border border-white/20 text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl font-medium text-sm animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          {toast}
        </div>
      )}

      {/* Mode Selection Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">جۆری چوونەژوورەوە</h2>
              <button 
                onClick={() => setShowModeModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <button 
                onClick={() => { setShowModeModal(false); onSelectAdmin('live'); }}
                className="w-full group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-800/50 p-5 flex items-center gap-4 text-right"
              >
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">داتابەیسی سەرهێڵ (Online Live)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">بینین و بارکردنی داتا ڕاستەوخۆ لەسەر داتابەیسی سەرەکی.</p>
                </div>
              </button>

              <button 
                onClick={() => { setShowModeModal(false); onSelectAdmin('local'); }}
                className="w-full group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/50 p-5 flex items-center gap-4 text-right"
              >
                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-emerald-500 group-hover:scale-110 transition-transform">
                  <Laptop size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">داتای لۆکاڵی کاتی (Local Upload)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">بینینی داتا بە شێوەی کاتی تەنها لەسەر ئەم ئامێرە (سەیڤ نابێت).</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
