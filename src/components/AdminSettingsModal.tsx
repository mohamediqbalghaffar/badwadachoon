"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, Download, Database, AlertCircle, CheckCircle2, Trash2, FileSpreadsheet } from "lucide-react";
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
  
  const { setData, setSentData, mode } = useData();

  const handleExport = () => {
    window.open('/api/db/export', '_blank');
  };

  const handleDownloadTemplate = () => {
    const workbook = XLSX.utils.book_new();

    const receivedHeaders = [
      "#", "بابەت", "لایەنی پەیوەندیدار 1", "لایەنی پەیوەندیدار 2", "لایەنی پەیوەندیدار 3",
      "جۆر", "جۆری نامە", "ڕۆژی ناردن", "ڕۆژی وەڵام", "تێبینی",
      "کاتی تێچوو بە کۆد بۆ خشتەی تێبینی2", "hollidays", "کاتی تێچوو بەپێی ڕێنمایی"
    ];
    
    const sentHeaders = [
      "#", "بابەت", "لایەنی پەیوەندیدار 1", "لایەنی پەیوەندیدار 2", "لایەنی پەیوەندیدار 3",
      "جۆر", "جۆری نامە", "ڕۆژی ناردن"
    ];

    const wsReceived = XLSX.utils.aoa_to_sheet([receivedHeaders]);
    const wsSent = XLSX.utils.aoa_to_sheet([sentHeaders]);

    XLSX.utils.book_append_sheet(workbook, wsReceived, "وەڵامی نووسراوە نێردراوەکان");
    XLSX.utils.book_append_sheet(workbook, wsSent, "سەرجەم نووسراوە ڕەوانەکراوەکان");

    XLSX.writeFile(workbook, "فایلی_بەتاڵ.xlsx");
  };

  const handleDeleteData = async () => {
    if (!window.confirm('دڵنیایت لە سڕینەوەی سەرجەم داتاکان؟ ئەم کارە هەڵناوەشێتەوە!')) return;

    setIsSyncing(true);
    setSyncStatus({ type: 'idle', message: 'سڕینەوەی داتابەیس...' });

    try {
      if (mode === 'live') {
        const clearRes = await fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clearFirst: true, receivedData: [], sentData: [] })
        });

        if (!clearRes.ok) {
          throw new Error('سێرڤەر نەیتوانی داتابەیس بسڕێتەوە');
        }
      }

      setData([]);
      setSentData([]);
      setSyncStatus({ type: 'success', message: mode === 'live' ? 'داتابەیس بە سەرکەوتوویی سڕایەوە!' : 'داتای لۆکاڵی سڕایەوە!' });
    } catch (error: any) {
      console.error(error);
      setSyncStatus({ type: 'error', message: error.message || 'هەڵەیەک ڕوویدا' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    setSyncStatus({ type: 'idle', message: 'شیکردنەوەی داتا...' });

    try {
      // 1. Parse Excel locally
      const parsedData = await parseFile(file);
      
      if (mode === 'live') {
        setSyncStatus({ type: 'idle', message: 'سڕینەوەی داتای کۆن...' });

        // 2. Clear DB first
        const clearRes = await fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clearFirst: true })
        });

        if (!clearRes.ok) {
          throw new Error('سێرڤەر نەیتوانی داتابەیس کۆن بسڕێتەوە');
        }

        // 3. Sync chunks to Database
        const CHUNK_SIZE = 500;
        const { receivedData, sentData } = parsedData;

        const receivedChunks = [];
        for (let i = 0; i < receivedData.length; i += CHUNK_SIZE) {
          receivedChunks.push(receivedData.slice(i, i + CHUNK_SIZE));
        }

        const sentChunks = [];
        for (let i = 0; i < sentData.length; i += CHUNK_SIZE) {
          sentChunks.push(sentData.slice(i, i + CHUNK_SIZE));
        }

        const totalChunks = receivedChunks.length + sentChunks.length;
        let processedChunks = 0;

        for (const chunk of receivedChunks) {
          processedChunks++;
          setSyncStatus({ type: 'idle', message: `بەرزکردنەوەی داتا... (${processedChunks}/${totalChunks})` });

          const res = await fetch('/api/db/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receivedData: chunk })
          });

          if (!res.ok) {
            throw new Error('سێرڤەر نەیتوانی داتابەیس نوێ بکاتەوە');
          }
        }

        for (const chunk of sentChunks) {
          processedChunks++;
          setSyncStatus({ type: 'idle', message: `بەرزکردنەوەی داتا... (${processedChunks}/${totalChunks})` });

          const res = await fetch('/api/db/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sentData: chunk })
          });

          if (!res.ok) {
            throw new Error('سێرڤەر نەیتوانی داتابەیس نوێ بکاتەوە');
          }
        }
      }

      // 4. Update local state
      setData(parsedData.receivedData);
      setSentData(parsedData.sentData);

      setSyncStatus({ type: 'success', message: mode === 'live' ? 'داتابەیس بە سەرکەوتوویی نوێ کرایەوە!' : 'داتای لۆکاڵی بارکرا!' });
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            
            {/* Import Card */}
            <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center gap-4 text-center">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                <UploadCloud size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">بارکردنی داتابەیس</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">فایلی .xlsx لێرە هەڵبژێرە</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={isSyncing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
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
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">دابەزاندنی داتابەیس</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">سەرجەم داتاکان بە ئێکسڵ</p>
              </div>
            </button>

            {/* Delete Card */}
            <button 
              onClick={handleDeleteData}
              disabled={isSyncing}
              className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center gap-4 text-center disabled:opacity-50"
            >
              <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm text-rose-500 group-hover:scale-110 transition-transform">
                <Trash2 size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">سڕینەوەی داتابەیس</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">سڕینەوەی سەرجەم داتاکان</p>
              </div>
            </button>

            {/* Template Card */}
            <button 
              onClick={handleDownloadTemplate}
              disabled={isSyncing}
              className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col items-center justify-center gap-4 text-center disabled:opacity-50"
            >
              <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm text-violet-500 group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">فایلی بەتاڵ</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">داگرتنی فایل بۆ پڕکردنەوە</p>
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
