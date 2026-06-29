"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, Download, Database, AlertCircle, CheckCircle2, Trash2, FileSpreadsheet, ShieldCheck, User, Users, Save } from "lucide-react";
import * as XLSX from "xlsx";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { parseFile } from "../utils/parser";
import { UserManagement } from "./UserManagement";
import { usePermissions } from "@/context/PermissionsContext";

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
  const { hasPermission } = usePermissions();
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
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-4 text-slate-800 dark:text-white">
            <div className={`p-2.5 rounded-xl ${activeTab === 'database' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : activeTab === 'approvals' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400'}`}>
              {activeTab === 'database' ? <Database size={22} /> : activeTab === 'approvals' ? <Users size={22} /> : <User size={22} />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {activeTab === 'database' ? 'ڕێکخستنەکانی داتابەیس' : activeTab === 'approvals' ? 'بەڕێوەبردنی بەکارهێنەران' : 'ڕێکخستنەکانی هەژمار'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {activeTab === 'database' ? 'بەڕێوەبردنی زانیارییەکان' : activeTab === 'approvals' ? 'کۆنترۆڵکردنی هەژمارەکان' : 'زانیارییە کەسییەکانت'}
              </p>
            </div>
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
          {hasPermission('data:upload') && (
            <>
              <button 
                onClick={() => setActiveTab('database')}
                className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'database' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                داتابەیس
              </button>
              <button 
                onClick={() => setActiveTab('approvals')}
                className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'approvals' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                بەڕێوەبردنی بەکارهێنەران
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
          
          {activeTab === 'database' && hasPermission('data:upload') && (
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

          {activeTab === 'approvals' && hasPermission('users:manage') && (
            <div className="animate-in fade-in">
              <UserManagement />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-in fade-in space-y-6">
              
              {/* Profile Header Card */}
              <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/10 rounded-[2rem] p-8 border border-violet-100 dark:border-violet-500/20 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 dark:bg-fuchsia-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="relative group z-10">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-2xl overflow-hidden border-4 border-white dark:border-slate-800 transition-transform duration-300 group-hover:scale-105">
                    {profileImagePreview || (user as any)?.image ? (
                      <Image 
                        src={profileImagePreview || (user as any)?.image} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <User size={56} />
                    )}
                    <div 
                      onClick={() => profileImageInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                    >
                      <UploadCloud size={28} className="text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={profileImageInputRef}
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 shadow-md"></div>
                </div>
                
                <div className="flex-1 text-center sm:text-right z-10 w-full">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-xs font-bold text-violet-600 dark:text-violet-400 shadow-sm border border-violet-200/50 dark:border-violet-500/30 mb-4">
                    {user?.role === 'admin' ? 'بەڕێوەبەر (Admin)' : user?.role === 'user' ? 'بەکارهێنەر (User)' : 'بینەر (Viewer)'}
                  </div>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block ml-1">ناوی بەکارهێنەر</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all font-semibold"
                        placeholder="ناوەکەت بنووسە"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block ml-1">ئیمەیڵ (گۆڕین ڕێگەپێنەدراوە)</label>
                      <input 
                        type="email" 
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono text-left text-sm"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || (!profileImage && profileName === user?.username)}
                  className="px-8 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-violet-500/25 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {isSavingProfile ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوتکردنی گۆڕانکارییەکان'}
                </button>
              </div>

              {/* Odoo API Settings Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mt-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">بەستنەوە بە Odoo API</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">بۆ ئەوەی بتوانیت ڕاستەوخۆ بە کرتەکردن لەسەر کۆدی نامە بگەیتە ناو پەڕەی نامەکە لە Odoo.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5 relative z-10">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">بەستەری Odoo (URL)</label>
                    <input 
                      type="url" 
                      value={odooUrl}
                      onChange={(e) => setOdooUrl(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left font-mono text-sm"
                      dir="ltr"
                      placeholder="https://erp.halabjagroup.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">ناوی داتابەیس (Database)</label>
                    <input 
                      type="text" 
                      value={odooDb}
                      onChange={(e) => setOdooDb(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left font-mono text-sm"
                      dir="ltr"
                      placeholder="halabja_db"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">ئیمەیڵ / ناوی بەکارهێنەر (Odoo)</label>
                    <input 
                      type="text" 
                      value={odooUsername}
                      onChange={(e) => setOdooUsername(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left font-mono text-sm"
                      dir="ltr"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">
                      وشەی تێپەڕ / API Key
                      {hasOdooApiKey && <span className="text-emerald-500 mr-2">(پێشتر داخڵ کراوە ✓)</span>}
                    </label>
                    <input 
                      type="password" 
                      value={odooApiKey}
                      onChange={(e) => setOdooApiKey(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left font-mono text-sm tracking-widest"
                      dir="ltr"
                      placeholder={hasOdooApiKey ? "••••••••••••••••" : "وشەی نهێنی بنووسە"}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleSaveOdoo}
                    disabled={isSavingOdoo}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Database size={18} />
                    {isSavingOdoo ? 'پاشەکەوت دەکرێت...' : 'بەستنەوە'}
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


