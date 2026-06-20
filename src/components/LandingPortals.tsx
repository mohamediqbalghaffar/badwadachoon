"use client";

import React, { useState } from "react";
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
          onClick={onSelectAdmin}
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
    </div>
  );
};
