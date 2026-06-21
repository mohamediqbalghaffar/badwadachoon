"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, Download, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useData } from "../context/DataContext";
import { parseFile } from "../utils/parser";

interface AdminSettingsModalProps {
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ onClose }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setData, setSentData } = useData();

  const handleExport = () => {
    window.open('/api/db/export', '_blank');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    setSyncStatus({ type: 'idle', message: 'شیکردنەوەی داتا...' });

    try {
      // 1. Parse Excel locally
      const parsedData = await parseFile(file);
      
      setSyncStatus({ type: 'idle', message: 'بەرزکردنەوە بۆ داتابەیس...' });

      // 2. Sync to Database in chunks to avoid payload limits
      const CHUNK_SIZE = 500;
      const totalReceived = parsedData.receivedData.length;
      const totalSent = parsedData.sentData.length;
      const maxLen = Math.max(totalReceived, totalSent);
      const totalChunks = Math.max(1, Math.ceil(maxLen / CHUNK_SIZE));

      for (let i = 0; i < totalChunks; i++) {
        setSyncStatus({ type: 'idle', message: `بەرزکردنەوەی بەشەکان... ${i + 1} لە ${totalChunks}` });

        const rChunk = parsedData.receivedData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const sChunk = parsedData.sentData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

        const res = await fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receivedData: rChunk,
            sentData: sChunk,
            isFirstChunk: i === 0,
            isLastChunk: i === totalChunks - 1
          })
        });

        if (!res.ok) {
          throw new Error('سێرڤەر نەیتوانی داتابەیس نوێ بکاتەوە');
        }
      }

      // 3. Update local state
      setData(parsedData.receivedData);
      setSentData(parsedData.sentData);

      setSyncStatus({ type: 'success', message: 'داتابەیس بە سەرکەوتوویی نوێ کرایەوە!' });
    } catch (error: any) {
      console.error(error);
      setSyncStatus({ type: 'error', message: error.message || 'هەڵەیەک ڕوویدا لە کاتی بارکردن' });
    } finally {
      setIsSyncing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 text-slate-800 dark:text-white">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Database size={20} />
            </div>
            <h2 className="text-xl font-bold">ڕێکخستنەکانی سیستەم (Admin)</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-8">
          
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-5 text-blue-800 dark:text-blue-300 flex gap-4 text-sm leading-relaxed">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p>
              لێرە دەتوانیت داتابەیسی سیستەمەکە نوێ بکەیتەوە لە ڕێگەی فایلی ئێکسڵ، یان سەرجەم داتاکان دابەزێنیت. تکایە ئاگاداربە کە بارکردنی فایلی ئێکسڵ <span className="font-bold">سەرجەم داتاکانی پێشوو دەسڕێتەوە</span> و داتای نوێ جێگیر دەکات.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Import Card */}
            <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                <UploadCloud size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">بارکردنی داتابەیس (ئێکسڵ)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">فایلی .xlsx لێرە هەڵبژێرە</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={isSyncing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
            </div>

            {/* Export Card */}
            <button 
              onClick={handleExport}
              disabled={isSyncing}
              className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center gap-4 text-center disabled:opacity-50"
            >
              <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm text-emerald-500 group-hover:scale-110 transition-transform">
                <Download size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">دابەزاندنی داتابەیس (ئێکسڵ)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">سەرجەم داتاکان بە فایلی ئێکسڵ</p>
              </div>
            </button>
            
          </div>

          {/* Status Display */}
          {isSyncing && (
            <div className="flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl animate-pulse">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">{syncStatus.message}</span>
            </div>
          )}

          {syncStatus.type === 'success' && (
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl">
              <CheckCircle2 size={20} />
              <span className="font-medium">{syncStatus.message}</span>
            </div>
          )}

          {syncStatus.type === 'error' && (
            <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-4 rounded-xl text-center">
              <AlertCircle size={20} />
              <span className="font-medium">{syncStatus.message}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
