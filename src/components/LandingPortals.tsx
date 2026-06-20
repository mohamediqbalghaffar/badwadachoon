"use client";

import React, { useState } from "react";
import { Warehouse, Wrench, Briefcase } from "lucide-react";
import { HTSLogo } from "./HTSLogoBackground";

interface LandingPortalsProps {
  onSelectAdmin: () => void;
}

export const LandingPortals: React.FC<LandingPortalsProps> = ({ onSelectAdmin }) => {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const liquidGlassClasses = "group relative flex flex-col items-center justify-center p-6 w-full max-w-[240px] mx-auto rounded-[2rem] backdrop-blur-3xl bg-white/30 dark:bg-black/30 border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-500 hover:scale-[1.03] ring-1 ring-white/60 dark:ring-white/20 hover:shadow-2xl hover:bg-white/40 dark:hover:bg-white/10 z-10";

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
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/5 dark:from-orange-500/30 dark:to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/60 dark:to-orange-800/40 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Warehouse size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">گەنجینە</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-xs">بەڕێوەبردنی کۆگا و کەلوپەلەکان</p>
        </button>

        {/* کارگێڕی (Active) */}
        <button
          onClick={onSelectAdmin}
          className={`${liquidGlassClasses} ring-blue-400/50 dark:ring-blue-500/40 hover:shadow-blue-500/30 dark:hover:shadow-blue-500/20`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/5 dark:from-blue-500/30 dark:to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-20 h-20 mb-4 rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/60 dark:to-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Briefcase size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">کارگێڕی</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-xs">بەڕێوەبردنی داتا و ڕاپۆرتەکان</p>
        </button>

        {/* تەکنیکی */}
        <button
          onClick={() => showToast("ئەم بەشە لە قۆناغی پەرەپێداندایە")}
          className={liquidGlassClasses}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 dark:from-emerald-500/30 dark:to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/60 dark:to-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Wrench size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">تەکنیکی</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-xs">بەڕێوەبردنی تاوەر و پڕۆژەکان</p>
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-slate-800/90 dark:bg-slate-200/90 border border-white/20 text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl font-medium text-sm animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          {toast}
        </div>
      )}
    </div>
  );
};
