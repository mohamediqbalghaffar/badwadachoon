"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useAuth } from "../context/AuthContext";
import { HTSLogo } from "./HTSLogoBackground";
import { KeyRound, ArrowRight, ShieldCheck, User, Mail } from "lucide-react";

export const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<"staff" | "email" | "viewer">("staff");
  const [viewerCode, setViewerCode] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateSession } = useAuth();

  const handleViewerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signIn("viewer-login", {
        code: viewerCode,
        redirect: false,
      });

      if (res?.error) {
        setError("کۆدی بینین هەڵەیە. تکایە دووبارە هەوڵ بدەرەوە.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else if (res?.ok) {
        await updateSession();
      }
    } catch (err) {
      setError("هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signIn("email-login", {
        email: loginEmail,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else if (res?.ok) {
        await updateSession();
      }
    } catch (err) {
      setError("هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = (provider: "google" | "azure-ad") => {
    setIsSubmitting(true);
    signIn(provider, { callbackUrl: "/" });
    
    // In case the user cancels the OAuth popup or navigates back using the browser's back button,
    // we reset the submitting state so the buttons don't stay permanently stuck.
    setTimeout(() => setIsSubmitting(false), 3000);
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
        <div className="flex p-1 mb-8 bg-black/5 dark:bg-white/5 rounded-2xl backdrop-blur-md overflow-x-auto">
          <button
            onClick={() => { setActiveTab("staff"); setError(null); }}
            className={`flex-1 py-2.5 px-2 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === "staff"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ShieldCheck size={16} />
            ستاف
          </button>
          <button
            onClick={() => { setActiveTab("email"); setError(null); }}
            className={`flex-1 py-2.5 px-2 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === "email"
                ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Mail size={16} />
            ئیمەیڵ
          </button>
          <button
            onClick={() => { setActiveTab("viewer"); setError(null); }}
            className={`flex-1 py-2.5 px-2 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === "viewer"
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <User size={16} />
            بینەر
          </button>
        </div>

        {activeTab === "staff" ? (
          <div className="space-y-4">
            <button
              onClick={() => handleOAuthSignIn("azure-ad")}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-all shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21"><path fill="#f25022" d="M0 0h10v10H0z"/><path fill="#7fba00" d="M11 0h10v10H11z"/><path fill="#00a4ef" d="M0 11h10v10H0z"/><path fill="#ffb900" d="M11 11h10v10H11z"/></svg>
              Sign in with Microsoft
            </button>

            <button
              onClick={() => handleOAuthSignIn("azure-ad")}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-all shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0078d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Sign in with Outlook
            </button>

            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-all shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.654-3.343-11.303-8l-6.571 4.819C9.656 39.663 16.318 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
              Sign in with Google
            </button>
            <div className="text-center mt-4">
               <p className="text-xs text-slate-500">
                 ڕێگەپێدراوە بۆ ئیمەیڵی کار (Outlook) و ئیمەیڵی کەسی (Google)
               </p>
            </div>
          </div>
        ) : activeTab === "email" ? (
          <div className="space-y-5">
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">ئیمەیڵی تۆمارکراو</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-purple-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    dir="ltr"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-4 pr-12 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm text-left text-lg font-medium"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-rose-500 dark:text-rose-400 text-sm font-medium text-center bg-rose-50 dark:bg-rose-950/30 py-2 rounded-lg border border-rose-100 dark:border-rose-900/50">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !loginEmail}
                className={`w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 disabled:opacity-50`}
              >
                <span>چوونەژوورەوە</span>
                <ArrowRight size={18} className="rotate-180" />
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-5">
            <form onSubmit={handleViewerSubmit} className="space-y-5">
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

              {error && (
                <div className="text-rose-500 dark:text-rose-400 text-sm font-medium text-center bg-rose-50 dark:bg-rose-950/30 py-2 rounded-lg border border-rose-100 dark:border-rose-900/50">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-teal-500/25 disabled:opacity-50`}
              >
                <span>چوونەژوورەوە بە کۆد</span>
                <ArrowRight size={18} className="rotate-180" />
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700/50"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-xs font-medium">یان</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700/50"></div>
            </div>
            
            <button
              type="button"
              onClick={() => { setIsSubmitting(true); signIn("guest-login", { callbackUrl: "/" }); }}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50"
            >
              <User size={18} />
              <span>بەردەوام بە وەکو میوان (Guest)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
