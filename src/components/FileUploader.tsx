"use client";

import React, { useCallback, useState, useEffect } from "react";
import { UploadCloud, FileType, AlertCircle, Database } from "lucide-react";
import { parseFile } from "../utils/parser";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export const FileUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("خوێندنەوەی داتابەیس لە سێرڤەر...");
  const [error, setError] = useState<string | null>(null);
  const { setData, setSentData } = useData();
  const { user } = useAuth();

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const { url } = await res.json();
          if (url) {
            setLoadingText("دابەزاندنی پەڕگە...");
            const fileRes = await fetch(url);
            const blob = await fileRes.blob();
            const file = new File([blob], "latest_data.xlsx", { type: blob.type });
            setLoadingText("شیکردنەوەی داتا...");
            const result = await parseFile(file);
            setData(result.receivedData);
            setSentData(result.sentData);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
      // If we reach here, no data was loaded
      setIsLoading(false);
    };

    fetchLatestData();
  }, [setData, setSentData]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setLoadingText("خوێندنەوەی پەڕگەکە...");
    setError(null);
    try {
      // 1. Parse locally
      const result = await parseFile(file);
      if (result.receivedData.length === 0 && result.sentData.length === 0) {
        throw new Error("پەڕگەکە بەتاڵە یان داتای دروستی تێدا نییە.");
      }
      
      // 2. Upload to Vercel Blob
      setLoadingText("بارکردنی پەڕگە بۆ سێرڤەر (داتابەیس)...");
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        let errorDetails = "";
        try {
          const resJson = await uploadRes.json();
          errorDetails = resJson.details || resJson.error || uploadRes.statusText;
        } catch(e) {}
        throw new Error(`سێرڤەر نەیتوانی پەڕگەکە پاشەکەوت بکات. ${errorDetails ? `(${errorDetails})` : ''}`);
      }

      // 3. Set data in UI
      setData(result.receivedData);
      setSentData(result.sentData);
    } catch (err: any) {
      setError(err.message || "هەڵەیەک ڕوویدا لە کاتی خوێندنەوەی پەڕگەکە.");
      console.error(err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="relative w-full max-w-xl p-12 glass glass-card text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center animate-pulse">
            <Database size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 justify-center text-blue-600 dark:text-blue-400">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <h2 className="text-xl font-semibold tracking-tight">{loadingText}</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              تکایە چاوەڕێبە...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === "viewer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="relative w-full max-w-xl p-12 glass glass-card text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Database size={32} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-700 dark:text-slate-200">
            هیچ داتایەک نەدۆزرایەوە لە سێرڤەر
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            چاوەڕێی کارگێڕی بکە بۆ بارکردنی پەڕگەی داتا.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div
        className={`relative w-full max-w-xl p-12 transition-all duration-300 transform glass glass-card glass-interactive text-center
          ${isDragging ? "scale-[1.02] border-blue-500/50 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] animate-pulse-ring" : "scale-100"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          <div className={`p-5 rounded-full transition-all duration-500 ${isDragging ? 'bg-blue-100/50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 scale-110' : 'bg-slate-100/50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 group-hover:scale-105 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20'}`}>
            <UploadCloud size={48} strokeWidth={1.5} className={isDragging ? 'animate-bounce' : ''} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">پەڕگەی داتا لێرە دابنێ</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              یان کرتە بکە بۆ هەڵبژاردنی پەڕگە (.xlsx, .csv)
            </p>
          </div>

          <label className="cursor-pointer group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
            <span className="relative z-10 flex items-center gap-2">
              <FileType size={18} />
              هەڵبژاردنی پەڕگە بۆ بارکردن لە داتابەیس
            </span>
            <input
              type="file"
              className="hidden"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>

          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
