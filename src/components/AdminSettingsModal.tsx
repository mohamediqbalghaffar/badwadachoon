"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, Download, Database, AlertCircle, CheckCircle2, Trash2, FileSpreadsheet, ShieldCheck, User } from "lucide-react";
import * as XLSX from "xlsx";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { parseFile } from "../utils/parser";

type Tab = 'database' | 'approvals' | 'profile';

interface AdminSettingsModalProps {
  onClose: () => void;
  initialTab?: Tab;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ onClose, initialTab = 'database' }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setData, setSentData, setIncomingData, mode } = useData();
  const { user } = useAuth();
  const { update } = useSession();
  const { theme, setTheme } = useTheme();

  const [profileName, setProfileName] = useState(user?.username || '');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // Odoo Settings State
  const [odooUrl, setOdooUrl] = useState('https://erp.halabjagroup.com');
  const [odooDb, setOdooDb] = useState('');
  const [odooUsername, setOdooUsername] = useState('');
  const [odooApiKey, setOdooApiKey] = useState('');
  const [hasOdooApiKey, setHasOdooApiKey] = useState(false);
  const [isSavingOdoo, setIsSavingOdoo] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'profile') {
      fetch('/api/user/odoo-settings')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            if (data.odooUrl) setOdooUrl(data.odooUrl);
            if (data.odooDb) setOdooDb(data.odooDb);
            if (data.odooUsername) setOdooUsername(data.odooUsername);
            setHasOdooApiKey(data.hasApiKey);
          }
        })
        .catch(console.error);
    }
  }, [activeTab]);

  const handleSaveOdoo = async () => {
    setIsSavingOdoo(true);
    try {
      const res = await fetch('/api/user/odoo-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ odooUrl, odooDb, odooUsername, odooApiKey })
      });
      if (res.ok) {
        alert('زانیارییەکانی Odoo بە سەرکەوتوویی پاشەکەوت کران');
        setHasOdooApiKey(true);
        setOdooApiKey(''); // clear field after save
      } else {
        alert('هەڵەیەک ڕوویدا لە پاشەکەوتکردن');
      }
    } catch (err) {
      console.error(err);
      alert('هەڵەیەک ڕوویدا لە پەیوەندی بە سێرڤەر');
    } finally {
      setIsSavingOdoo(false);
    }
  };

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

    const incomingHeaders = [
      "#", "بابەت", "هاتووە لە", "لایەنی پەیوەندیدار", "لایەنی پەیوەندیدار 1", "لایەنی پەیوەندیدار 2", "لایەنی پەیوەندیدار 3",
      "جۆر", "جۆری نامە", "ڕۆژی ناردن"
    ];

    const wsReceived = XLSX.utils.aoa_to_sheet([receivedHeaders]);
    const wsSent = XLSX.utils.aoa_to_sheet([sentHeaders]);
    const wsIncoming = XLSX.utils.aoa_to_sheet([incomingHeaders]);

    XLSX.utils.book_append_sheet(workbook, wsReceived, "وەڵامی نووسراوە نێردراوەکان");
    XLSX.utils.book_append_sheet(workbook, wsSent, "سەرجەم نووسراوە ڕەوانەکراوەکان");
    XLSX.utils.book_append_sheet(workbook, wsIncoming, "سەرجەم نووسراوە هاتووەکان");

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
          body: JSON.stringify({ clearFirst: true, receivedData: [], sentData: [], incomingData: [] })
        });

        if (!clearRes.ok) {
          throw new Error('سێرڤەر نەیتوانی داتابەیس بسڕێتەوە');
        }
      }

      setData([]);
      setSentData([]);
      setIncomingData([]);
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
        const { receivedData, sentData, incomingData } = parsedData;

        const receivedChunks = [];
        for (let i = 0; i < receivedData.length; i += CHUNK_SIZE) {
          receivedChunks.push(receivedData.slice(i, i + CHUNK_SIZE));
        }

        const sentChunks = [];
        for (let i = 0; i < sentData.length; i += CHUNK_SIZE) {
          sentChunks.push(sentData.slice(i, i + CHUNK_SIZE));
        }

        const incomingChunks = [];
        for (let i = 0; i < incomingData.length; i += CHUNK_SIZE) {
          incomingChunks.push(incomingData.slice(i, i + CHUNK_SIZE));
        }

        const totalChunks = receivedChunks.length + sentChunks.length + incomingChunks.length;
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

        for (const chunk of incomingChunks) {
          processedChunks++;
          setSyncStatus({ type: 'idle', message: `بەرزکردنەوەی داتا... (${processedChunks}/${totalChunks})` });

          const res = await fetch('/api/db/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ incomingData: chunk })
          });

          if (!res.ok) {
            throw new Error('سێرڤەر نەیتوانی داتابەیس نوێ بکاتەوە');
          }
        }
      }

      // 4. Update local state
      setData(parsedData.receivedData);
      setSentData(parsedData.sentData);
      setIncomingData(parsedData.incomingData);

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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      if (profileName && profileName !== user?.username) {
        formData.append('name', profileName);
      }
      if (profileImage) {
        formData.append('image', profileImage);
      }

      if (!formData.has('name') && !formData.has('image')) {
        setIsSavingProfile(false);
        return;
      }

      const res = await fetch('/api/user/profile', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        // Trigger a session update to refresh the profile picture and name across the app
        await update();
        alert('زانیارییەکان بە سەرکەوتوویی نوێکرانەوە');
      } else {
        alert('هەڵەیەک ڕوویدا لە کاتی نوێکردنەوەی زانیارییەکان');
      }
    } catch (err) {
      console.error(err);
      alert('هەڵەیەک ڕوویدا لە کاتی پەیوەندیکردن بە سێرڤەر');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 text-slate-800 dark:text-white">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              {activeTab === 'database' ? <Database size={20} /> : activeTab === 'approvals' ? <ShieldCheck size={20} /> : <User size={20} />}
            </div>
            <h2 className="text-xl font-bold">
              {activeTab === 'database' ? 'ڕێکخستنەکانی داتابەیس' : activeTab === 'approvals' ? 'پەسەندکردنی بەکارهێنەران' : 'ڕێکخستنەکانی هەژمار'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 pt-2 gap-4 overflow-x-auto">
          {user?.role === 'admin' && (
            <>
              <button 
                onClick={() => setActiveTab('database')}
                className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'database' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                داتابەیس
              </button>
              <button 
                onClick={() => setActiveTab('approvals')}
                className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'approvals' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                پەسەندکردنی بەکارهێنەر
              </button>
            </>
          )}
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            هەژماری من
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          
          {activeTab === 'database' && user?.role === 'admin' && (
            <div className="space-y-8 animate-in fade-in">
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
          )}

          {activeTab === 'approvals' && user?.role === 'admin' && (
            <div className="animate-in fade-in">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <PendingUsersList />
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-in fade-in space-y-8">
              
              {/* Profile Header */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white mb-4 shadow-xl overflow-hidden border-4 border-white dark:border-slate-800">
                    {profileImagePreview || (user as any)?.image ? (
                      <Image 
                        src={profileImagePreview || (user as any)?.image} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <User size={48} />
                    )}
                    <div 
                      onClick={() => profileImageInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <UploadCloud size={24} className="text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={profileImageInputRef}
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </div>
                
                <div className="mt-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {user?.role === 'admin' ? 'بەڕێوەبەر' : user?.role === 'user' ? 'بەکارهێنەر' : 'بینەر'}
                </div>
              </div>

              {/* Profile Form (Glassmorphism) */}
              <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ناوی بەکارهێنەر</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ئیمەیڵ</label>
                  <input 
                    type="text" 
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {isSavingProfile ? 'پاشەکەوتکردن...' : 'پاشەکەوتکردنی گۆڕانکارییەکان'}
                  </button>
                </div>
              </div>

              {/* Odoo Integration */}
              <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <Database size={18} className="text-blue-500" />
                  بەستنەوە بە Odoo API
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  بۆ ئەوەی بتوانیت ڕاستەوخۆ بە کرتەکردن لەسەر کۆدی نامە (وەک GL/04513) بچیتە ناو پەڕەی نامەکە لە Odoo، پێویستە زانیارییەکانی هەژمارەکەت لێرە پاشەکەوت بکەیت.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">بەستەری Odoo (URL)</label>
                    <input 
                      type="text" 
                      value={odooUrl}
                      onChange={(e) => setOdooUrl(e.target.value)}
                      placeholder="https://erp.halabjagroup.com"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">ناوی داتابەیس (Database)</label>
                    <input 
                      type="text" 
                      value={odooDb}
                      onChange={(e) => setOdooDb(e.target.value)}
                      placeholder="halabja_db"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">ئیمەیڵ / ناوی بەکارهێنەر (Odoo)</label>
                    <input 
                      type="text" 
                      value={odooUsername}
                      onChange={(e) => setOdooUsername(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">وشەی تێپەڕ / API Key</label>
                    <input 
                      type="password" 
                      value={odooApiKey}
                      onChange={(e) => setOdooApiKey(e.target.value)}
                      placeholder={hasOdooApiKey ? "تۆمارکراوە (بۆ گۆڕین لێرە بنووسە)" : "API Key بپێچە..."}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={handleSaveOdoo}
                    disabled={isSavingOdoo}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSavingOdoo ? 'پاشەکەوتکردن...' : 'پاشەکەوتکردنی Odoo API'}
                  </button>
                </div>
              </div>
              
              {/* Appearance Settings */}
              <div className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">شێوازی ڕووکار (Appearance)</h4>
                
                <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-xl gap-1">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                  >
                    ڕووناک
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                  >
                    تاریک
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                  >
                    سیستەم
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const PendingUsersList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users.filter((u: any) => u.status === 'pending'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500">خوێندنەوە...</div>;
  if (users.length === 0) return <div className="p-6 text-center text-slate-500">هیچ داواکارییەکی نوێ نییە بۆ پەسەندکردن.</div>;

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      {users.map((user) => (
        <div key={user.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-colors">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{user.name}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">{user.email}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleAction(user.id, 'reject')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors"
            >
              ڕەتکردنەوە
            </button>
            <button 
              onClick={() => handleAction(user.id, 'approve')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition-colors"
            >
              پەسەندکردن
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
