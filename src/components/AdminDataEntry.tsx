"use client";

import React, { useState, useMemo } from 'react';
import { DataGrid, renderTextEditor } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, Database, Cloud, Trash2 } from 'lucide-react';
import { DashboardData, IncomingLetterData, SentLetterData } from '../utils/parser';

type TableType = 'incoming' | 'received' | 'sent';
type EntryMode = 'manual' | 'auto';

const DateFormatter = (props: any) => {
  const val = props.row[props.column.key];
  if (!val) return null;
  if (typeof val === 'string') return val.split('T')[0];
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return val;
};

const incomingColumns = [
  { key: 'id', name: '# (ID)', width: '5%', minWidth: 60, renderEditCell: renderTextEditor },
  { key: 'subject', name: 'بابەت (Subject)', width: '20%', minWidth: 150, renderEditCell: renderTextEditor },
  { key: 'sender', name: 'هاتووە لە (Sender)', width: '10%', minWidth: 120, renderEditCell: renderTextEditor },
  { key: 'department', name: 'لایەنی پەیوەندیدار (Dept)', width: '15%', minWidth: 130, renderEditCell: renderTextEditor },
  { key: 'dept1', name: 'بەشی 1', width: '8%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'dept2', name: 'بەشی 2', width: '8%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'dept3', name: 'بەشی 3', width: '8%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'refCode', name: 'جۆر (Ref Code)', width: '10%', minWidth: 120, renderEditCell: renderTextEditor },
  { key: 'letterType', name: 'جۆری نامە', width: '8%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'sentDate', name: 'ڕۆژی ناردن', width: '8%', minWidth: 100, renderCell: DateFormatter, renderEditCell: renderTextEditor },
];

const receivedColumns = [
  { key: 'id', name: '# (ID)', width: '4%', minWidth: 60, renderEditCell: renderTextEditor },
  { key: 'subject', name: 'بابەت', width: '16%', minWidth: 150, renderEditCell: renderTextEditor },
  { key: 'department', name: 'لایەنی پەیوەندیدار (Dept)', width: '12%', minWidth: 130, renderEditCell: renderTextEditor },
  { key: 'dept1', name: 'بەشی 1', width: '8%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'dept2', name: 'بەشی 2', width: '8%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'dept3', name: 'بەشی 3', width: '8%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'refCode', name: 'جۆر (Ref Code)', width: '10%', minWidth: 120, renderEditCell: renderTextEditor },
  { key: 'letterType', name: 'جۆری نامە', width: '8%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'sentDate', name: 'ڕۆژی ناردن', width: '8%', minWidth: 100, renderCell: DateFormatter, renderEditCell: renderTextEditor },
  { key: 'responseDate', name: 'ڕۆژی وەڵام', width: '8%', minWidth: 100, renderCell: DateFormatter, renderEditCell: renderTextEditor },
  { key: 'processingTime', name: 'تێبینی (رۆژ)', width: '5%', minWidth: 80, renderEditCell: renderTextEditor },
  { key: 'slaTime', name: 'کاتی تێچوو بەپێی ڕێنمایی', width: '5%', minWidth: 100, renderEditCell: renderTextEditor },
];

const sentColumns = [
  { key: 'id', name: '# (ID)', width: '5%', minWidth: 60, renderEditCell: renderTextEditor },
  { key: 'subject', name: 'بابەت', width: '23%', minWidth: 150, renderEditCell: renderTextEditor },
  { key: 'department', name: 'لایەنی پەیوەندیدار (Dept)', width: '16%', minWidth: 130, renderEditCell: renderTextEditor },
  { key: 'dept1', name: 'بەشی 1', width: '10%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'dept2', name: 'بەشی 2', width: '10%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'dept3', name: 'بەشی 3', width: '10%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'refCode', name: 'جۆر (Ref Code)', width: '10%', minWidth: 120, renderEditCell: renderTextEditor },
  { key: 'letterType', name: 'جۆری نامە', width: '8%', minWidth: 100, renderEditCell: renderTextEditor },
  { key: 'sentDate', name: 'ڕۆژی ناردن', width: '8%', minWidth: 100, renderCell: DateFormatter, renderEditCell: renderTextEditor },
];

const gridStyles = `
  .rdg {
    --rdg-color: #334155;
    --rdg-border-color: #e2e8f0;
    --rdg-summary-border-color: #cbd5e1;
    --rdg-background-color: #ffffff;
    --rdg-header-background-color: #f8fafc;
    --rdg-row-hover-background-color: #f1f5f9;
    --rdg-row-selected-background-color: #e0f2fe;
    --rdg-row-selected-hover-background-color: #bae6fd;
    --rdg-selection-color: #3b82f6;
    border: none;
    font-size: 14px;
  }
  .dark .rdg {
    --rdg-color: #cbd5e1;
    --rdg-border-color: #334155;
    --rdg-summary-border-color: #475569;
    --rdg-background-color: #0f172a;
    --rdg-header-background-color: #1e293b;
    --rdg-row-hover-background-color: #334155;
    --rdg-row-selected-background-color: #1e3a8a;
    --rdg-row-selected-hover-background-color: #1e40af;
    --rdg-selection-color: #60a5fa;
  }
  .rdg-cell {
    border-right: 1px solid var(--rdg-border-color);
    border-bottom: 1px solid var(--rdg-border-color);
    padding: 0 12px;
  }
  .rdg-header-row .rdg-cell {
    font-weight: 700;
    color: #475569;
  }
  .dark .rdg-header-row .rdg-cell {
    color: #94a3b8;
  }
`;

export const AdminDataEntry = () => {
  const { user } = useAuth();
  const { 
    data: receivedData, setData: setReceivedData,
    sentData, setSentData,
    incomingData, setIncomingData
  } = useData();

  const [activeTab, setActiveTab] = useState<TableType>('received');
  const [entryMode, setEntryMode] = useState<EntryMode>('manual');
  
  const sortDesc = (arr: any[]) => [...arr].sort((a, b) => {
    const idA = typeof a.id === 'number' ? a.id : parseInt(String(a.id).replace('new-', '')) || 0;
    const idB = typeof b.id === 'number' ? b.id : parseInt(String(b.id).replace('new-', '')) || 0;
    return idB - idA;
  });

  // Local state for grid edits
  const [localReceived, setLocalReceived] = useState<any[]>(() => sortDesc(receivedData));
  const [localSent, setLocalSent] = useState<any[]>(() => sortDesc(sentData));
  const [localIncoming, setLocalIncoming] = useState<any[]>(() => sortDesc(incomingData));
  
  const [isSaving, setIsSaving] = useState(false);

  // Update local states when context data changes (e.g. after save)
  React.useEffect(() => {
    setLocalReceived(sortDesc(receivedData));
  }, [receivedData]);
  
  React.useEffect(() => {
    setLocalSent(sortDesc(sentData));
  }, [sentData]);
  
  React.useEffect(() => {
    setLocalIncoming(sortDesc(incomingData));
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

  const handleDeleteRow = (id: string | number) => {
    if (activeTab === 'received') {
      setLocalReceived(localReceived.filter(r => r.id !== id));
    } else if (activeTab === 'sent') {
      setLocalSent(localSent.filter(r => r.id !== id));
    } else {
      setLocalIncoming(localIncoming.filter(r => r.id !== id));
    }
  };

  const addRow = () => {
    let currentData = activeTab === 'received' ? localReceived : activeTab === 'sent' ? localSent : localIncoming;
    let maxId = 0;
    currentData.forEach((row: any) => {
      const idNum = typeof row.id === 'number' ? row.id : parseInt(String(row.id).replace('new-', '')) || 0;
      if (idNum > maxId) maxId = idNum;
    });
    
    const newId = maxId > 0 ? maxId + 1 : 1;
    
    if (activeTab === 'received') {
      setLocalReceived([{ id: newId, subject: '', department: '', departments: [], refCode: '', letterType: '', sentDate: null, responseDate: null, processingTime: null, slaTime: '-' }, ...localReceived]);
    } else if (activeTab === 'sent') {
      setLocalSent([{ id: newId, subject: '', department: '', departments: [], refCode: '', letterType: '', sentDate: null }, ...localSent]);
    } else {
      setLocalIncoming([{ id: newId, subject: '', department: '', departments: [], refCode: '', letterType: '', sentDate: null }, ...localIncoming]);
    }
  };

  const getColumnsWithDelete = (cols: any[]) => {
    return [
      ...cols,
      {
        key: 'actions',
        name: '',
        width: '5%',
        minWidth: 50,
        renderCell: (props: any) => (
          <button 
            onClick={() => handleDeleteRow(props.row.id)}
            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors flex items-center justify-center w-full"
            title="سڕینەوەی ئەم دێڕە"
          >
            <Trash2 size={16} />
          </button>
        )
      }
    ];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <style>{gridStyles}</style>
      
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

          {/* Add Row Button (Center) */}
          {entryMode === 'manual' && (
            <div className="flex-1 flex justify-center w-full xl:w-auto">
              <button 
                onClick={addRow}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold rounded-xl transition-colors border border-blue-200 dark:border-blue-800 shadow-sm"
              >
                <Plus size={18} />
                زیادکردنی دێڕ (Add Row)
              </button>
            </div>
          )}

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
                columns={activeTab === 'received' ? getColumnsWithDelete(receivedColumns) : activeTab === 'sent' ? getColumnsWithDelete(sentColumns) : getColumnsWithDelete(incomingColumns)} 
                rows={activeTab === 'received' ? localReceived : activeTab === 'sent' ? localSent : localIncoming} 
                onRowsChange={(newRows) => {
                  if (activeTab === 'received') {
                    const updatedRows = newRows.map(row => {
                      let pTime = row.processingTime;
                      let sTime = row.slaTime;

                      // Auto-calculate processingTime if sentDate exists
                      if (row.sentDate) {
                        const start = new Date(row.sentDate);
                        const end = row.responseDate ? new Date(row.responseDate) : new Date();
                        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                          const diff = end.getTime() - start.getTime();
                          pTime = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
                        }
                      }

                      // Auto-calculate SLA status based on Excel Column M formula
                      if (pTime !== null && pTime !== undefined && pTime !== "") {
                        const pTimeNum = typeof pTime === 'string' ? parseInt(pTime) : pTime;
                        if (!isNaN(pTimeNum)) {
                          const lType = row.letterType || "";
                          const rCode = String(row.refCode || "").trim().toLowerCase();

                          if (rCode === "2" || lType === "داواکاری کاندیدکردن") {
                            if (pTimeNum > 12) sTime = "زیاتر لە 12 ڕۆژ";
                            else if (pTimeNum >= 8) sTime = "بەپێی کاتی ڕێنمایی";
                            else sTime = "کەمتر لە 8 ڕۆژ";
                          } 
                          else if (rCode === "4" || lType === "داواکاری زیاد کردنی ڕاژە") {
                            if (pTimeNum > 15) sTime = "زیاتر لە 15 ڕۆژ";
                            else if (pTimeNum >= 12) sTime = "بەپێی کاتی ڕێنمایی";
                            else sTime = "کەمتر لە 12 ڕۆژ";
                          } 
                          else if (rCode === "7" || lType === "داواکاریی گۆڕانکاریی پۆست") {
                            if (pTimeNum > 12) sTime = "زیاتر لە 12 ڕۆژ";
                            else if (pTimeNum >= 8) sTime = "بەپێی کاتی ڕێنمایی";
                            else sTime = "کەمتر لە 8 ڕۆژ";
                          } 
                          else if (rCode === "1a") {
                            if (pTimeNum > 10) sTime = "زیاتر لە 10 ڕۆژ";
                            else if (pTimeNum >= 5) sTime = "کەمتر لە 10 ڕۆژ";
                            else sTime = "کەمتر لە5 ڕۆژ";
                          } 
                          else {
                            if (pTimeNum > 15) sTime = "زیاتر لە 15 ڕۆژ";
                            else if (pTimeNum >= 5) sTime = "بەپێی کاتی ئاسایی بۆ نووسراوی گشتیی";
                            else sTime = "کەمتر لە 5 ڕۆژ";
                          }
                        }
                      } else {
                        sTime = "-";
                      }

                      return { ...row, processingTime: pTime, slaTime: sTime };
                    });
                    setLocalReceived(updatedRows);
                  }
                  else if (activeTab === 'sent') setLocalSent(newRows);
                  else setLocalIncoming(newRows);
                }}
                className="rdg-light h-full w-full rounded-xl border border-slate-200 shadow-sm"
              />
            </div>
            
            {/* Action Bar */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end items-center" dir="rtl">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={20} />
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
