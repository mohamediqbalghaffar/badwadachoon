"use client";

import React, { useCallback, useState } from "react";
import { UploadCloud, FileType, CheckCircle, AlertCircle } from "lucide-react";
import { parseFile } from "../utils/parser";
import { useData } from "../context/DataContext";

export const FileUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setData } = useData();

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
    setError(null);
    try {
      const parsedData = await parseFile(file);
      if (parsedData.length === 0) {
        throw new Error("پەڕگەکە بەتاڵە یان داتای دروستی تێدا نییە.");
      }
      setData(parsedData);
    } catch (err: any) {
      setError("هەڵەیەک ڕوویدا لە کاتی خوێندنەوەی پەڕگەکە.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
              هەڵبژاردنی پەڕگە
            </span>
            <input
              type="file"
              className="hidden"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>

          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">پەڕگەکە دەخوێندرێتەوە...</span>
            </div>
          )}

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
