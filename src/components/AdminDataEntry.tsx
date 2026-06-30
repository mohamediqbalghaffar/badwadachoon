"use client";

import React, { useState, useMemo } from 'react';
import { DataGrid, renderTextEditor } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, Database, Cloud } from 'lucide-react';
import { DashboardData, IncomingLetterData, SentLetterData } from '../utils/parser';

type TableType = 'incoming' | 'received' | 'sent';
type EntryMode = 'manual' | 'auto';

const incomingColumns = [
  { key: 'id', name: '# (ID)', renderEditCell: renderTextEditor },
  { key: 'subject', name: 'بابەت (Subject)', renderEditCell: renderTextEditor },
  { key: 'sender', name: 'هاتووە لە (Sender)', renderEditCell: renderTextEditor },
  { key: 'department', name: 'لایەنی پەیوەندیدار (Dept)', renderEditCell: renderTextEditor },
  { key: 'dept1', name: 'بەشی 1', renderEditCell: renderTextEditor },
  { key: 'dept2', name: 'بەشی 2', renderEditCell: renderTextEditor },
  { key: 'dept3', name: 'بەشی 3', renderEditCell: renderTextEditor },
  { key: 'refCode', name: 'جۆر (Ref Code)', renderEditCell: renderTextEditor },
  { key: 'letterType', name: 'جۆری نامە', renderEditCell: renderTextEditor },
  { key: 'sentDate', name: 'ڕۆژی ناردن', renderEditCell: renderTextEditor },
];

const receivedColumns = [
  { key: 'id', name: '# (ID)', renderEditCell: renderTextEditor },
  { key: 'subject', name: 'بابەت', renderEditCell: renderTextEditor },
  { key: 'department', name: 'لایەنی پەیوەندیدار (Dept)', renderEditCell: renderTextEditor },
  { key: 'dept1', name: 'بەشی 1', renderEditCell: renderTextEditor },
  { key: 'dept2', name: 'بەشی 2', renderEditCell: renderTextEditor },
  { key: 'dept3', name: 'بەشی 3', renderEditCell: renderTextEditor },
  { key: 'refCode', name: 'جۆر (Ref Code)', renderEditCell: renderTextEditor },
  { key: 'letterType', name: 'جۆری نامە', renderEditCell: renderTextEditor },
  { key: 'sentDate', name: 'ڕۆژی ناردن', renderEditCell: renderTextEditor },
  { key: 'responseDate', name: 'ڕۆژی وەڵام', renderEditCell: renderTextEditor },
  { key: 'processingTime', name: 'تێبینی (رۆژ)', renderEditCell: renderTextEditor },
  { key: 'slaTime', name: 'کاتی تێچوو بەپێی ڕێنمایی', renderEditCell: renderTextEditor },
];

const sentColumns = [
  { key: 'id', name: '# (ID)', renderEditCell: renderTextEditor },
  { key: 'subject', name: 'بابەت', renderEditCell: renderTextEditor },
  { key: 'department', name: 'لایەنی پەیوەندیدار (Dept)', renderEditCell: renderTextEditor },
  { key: 'dept1', name: 'بەشی 1', renderEditCell: renderTextEditor },
  { key: 'dept2', name: 'بەشی 2', renderEditCell: renderTextEditor },
  { key: 'dept3', name: 'بەشی 3', renderEditCell: renderTextEditor },
  { key: 'refCode', name: 'جۆر (Ref Code)', renderEditCell: renderTextEditor },
  { key: 'letterType', name: 'جۆری نامە', renderEditCell: renderTextEditor },
  { key: 'sentDate', name: 'ڕۆژی ناردن', renderEditCell: renderTextEditor },
];

export const AdminDataEntry = () => {
  const { user } = useAuth();
  const { 
    data: receivedData, setData: setReceivedData,
    sentData, setSentData,
    incomingData, setIncomingData
  } = useData();

  const [activeTab, setActiveTab] = useState<TableType>('received');
  const [entryMode, setEntryMode] = useState<EntryMode>('manual');
  
  // Local state for grid edits
  const [localReceived, setLocalReceived] = useState<any[]>(() => [...receivedData]);
  const [localSent, setLocalSent] = useState<any[]>(() => [...sentData]);
  const [localIncoming, setLocalIncoming] = useState<any[]>(() => [...incomingData]);
  
  const [isSaving, setIsSaving] = useState(false);

  // Update local states when context data changes (e.g. after save)
  React.useEffect(() => {
    setLocalReceived([...receivedData]);
  }, [receivedData]);
  
  React.useEffect(() => {
    setLocalSent([...sentData]);
  }, [sentData]);
  
  React.useEffect(() => {
    setLocalIncoming([...incomingData]);
  }, [incomingData]);

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/db/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receivedData: localReceived,
          sentData: localSent,
          incomingData: localIncoming
        })
      });
      
      if (!res.ok) throw new Error("Failed to save changes");
      
      // Update global context state
      setReceivedData(localReceived);
      setSentData(localSent);
      setIncomingData(localIncoming);
      
      alert("گۆڕانکارییەکان بە سەرکەوتوویی پاشەکەوتکران (Changes saved successfully!)");
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addRow = () => {
    const newId = `new-${Date.now()}`;
    if (activeTab === 'received') {
      setLocalReceived([{ id: newId, subject: '', department: '', departments: [], refCode: '', letterType: '', sentDate: null, responseDate: null, processingTime: null, slaTime: '-' }, ...localReceived]);
    } else if (activeTab === 'sent') {
      setLocalSent([{ id: newId, subject: '', department: '', departments: [], refCode: '', letterType: '', sentDate: null }, ...localSent]);
    } else {
      setLocalIncoming([{ id: newId, subject: '', department: '', departments: [], refCode: '', letterType: '', sentDate: null }, ...localIncoming]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header and Sub-Navigation */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0">
            <button 
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 font-bold rounded-xl transition-colors whitespace-nowrap ${activeTab === 'received' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              پێویست بە وەڵام (Received)
            </button>
            <button 
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 font-bold rounded-xl transition-colors whitespace-nowrap ${activeTab === 'sent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              سەرجەم ڕەوانەکراوەکان (Sent)
            </button>
            <button 
              onClick={() => setActiveTab('incoming')}
              className={`px-4 py-2 font-bold rounded-xl transition-colors whitespace-nowrap ${activeTab === 'incoming' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              سەرجەم هاتووەکان (Incoming)
            </button>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-end xl:self-auto">
            <button 
              onClick={() => setEntryMode('manual')}
              className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2 transition-colors ${entryMode === 'manual' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <Database size={16} />
              دەستی (Manual Entry)
            </button>
            <button 
              onClick={() => setEntryMode('auto')}
              className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2 transition-colors ${entryMode === 'auto' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              <Cloud size={16} />
              سەرهێڵ (Auto API)
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {entryMode === 'auto' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900/50">
            <div className="w-24 h-24 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 animate-pulse">
              <Cloud size={48} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">بەم زووانە (Coming Soon)</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
              ئەم بەشە تەرخانکراوە بۆ بەستنەوەی ڕاستەوخۆ بە سیستەمی Odoo API. لە ئایندەدا دەتوانیت داتاکان بە یەک کلیک نوێ بکەیتەوە.
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col" dir="ltr">
            <div className="flex-1 overflow-hidden p-2">
              <DataGrid 
                columns={activeTab === 'received' ? receivedColumns : activeTab === 'sent' ? sentColumns : incomingColumns} 
                rows={activeTab === 'received' ? localReceived : activeTab === 'sent' ? localSent : localIncoming} 
                onRowsChange={(newRows) => {
                  if (activeTab === 'received') setLocalReceived(newRows);
                  else if (activeTab === 'sent') setLocalSent(newRows);
                  else setLocalIncoming(newRows);
                }}
                className="rdg-light h-full w-full rounded-xl border border-slate-200 shadow-sm"
              />
            </div>
            
            {/* Action Bar */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center" dir="rtl">
              <button 
                onClick={addRow}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
              >
                <Plus size={18} />
                زیادکردنی دێڕ (Add Row)
              </button>
              
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                پاشەکەوتکردن (Save Changes)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
