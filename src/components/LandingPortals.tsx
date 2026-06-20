"use client";

import React, { useState } from "react";
import { Warehouse, Wrench, Briefcase } from "lucide-react";

interface LandingPortalsProps {
  onSelectAdmin: () => void;
}

export const LandingPortals: React.FC<LandingPortalsProps> = ({ onSelectAdmin }) => {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="relative z-10 w-full h-full min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
          بەخێربێیت بۆ سیستەمی کۆمپانیا
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          تکایە ئەو بەشە هەڵبژێرە کە دەتەوێت کاری تێدا بکەیت
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        {/* گەنجینە */}
        <button
          onClick={() => showToast("ئەم بەشە لە قۆناغی پەرەپێداندایە")}
          className="group relative flex flex-col items-center justify-center p-8 rounded-3xl glass glass-card glass-interactive overflow-hidden transition-all duration-500 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-24 h-24 mb-6 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Warehouse size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">گەنجینە</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm">بەڕێوەبردنی کۆگا و کەلوپەلەکان</p>
        </button>

        {/* کارگێڕی (Active) */}
        <button
          onClick={onSelectAdmin}
          className="group relative flex flex-col items-center justify-center p-8 rounded-3xl glass glass-card glass-interactive overflow-hidden transition-all duration-500 hover:scale-[1.05] ring-2 ring-blue-500/20 hover:ring-blue-500/50 shadow-xl hover:shadow-blue-500/20 z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-28 h-28 mb-6 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Briefcase size={56} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">کارگێڕی</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm">بەڕێوەبردنی داتا و ڕاپۆرتەکان</p>
        </button>

        {/* تەکنیکی */}
        <button
          onClick={() => showToast("ئەم بەشە لە قۆناغی پەرەپێداندایە")}
          className="group relative flex flex-col items-center justify-center p-8 rounded-3xl glass glass-card glass-interactive overflow-hidden transition-all duration-500 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-24 h-24 mb-6 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Wrench size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">تەکنیکی</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm">بەڕێوەبردنی تاوەر و پڕۆژەکان</p>
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-lg font-medium text-sm animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          {toast}
        </div>
      )}
    </div>
  );
};
