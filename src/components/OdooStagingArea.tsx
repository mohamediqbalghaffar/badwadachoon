"use client";

import React, { useState } from 'react';
import { Cloud, Check, Download, AlertCircle, X } from 'lucide-react';
import { DataGrid, renderTextEditor } from 'react-data-grid';

export interface OdooRow {
  id: string;
  odooDate: string;
  approvalSubject: string;
  subject: string;
  requestOwner: string;
  
  // Editable fields
  department: string;
  dept1: string;
  dept2: string;
  dept3: string;
  letterType: string;
  responseDate: string; // YYYY-MM-DD string
  sender: string; // for Incoming
  
  // Destinations
  isReceived: boolean;
  isSent: boolean;
  isIncoming: boolean;
}

interface Props {
  onApply: (receivedRows: any[], sentRows: any[], incomingRows: any[]) => void;
  existingOptions?: Record<string, Record<string, string[]>>;
}

const DateFormatter = (props: any) => {
  const val = props.row[props.column.key];
  if (!val) return null;
  return String(val).split('T')[0];
};

const BooleanFormatter = (props: any) => {
  return (
    <div className="flex items-center justify-center h-full">
      <input 
        type="checkbox" 
        checked={props.row[props.column.key] || false} 
        onChange={(e) => {
          props.onRowChange({ ...props.row, [props.column.key]: e.target.checked });
        }}
        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
      />
    </div>
  );
};

const EditableCellFormatter = (props: any) => {
  const { column, row } = props;
  const isAnySelected = row.isReceived || row.isSent || row.isIncoming;
  
  let isDisabled = !isAnySelected;
  if (column.key === 'sender') isDisabled = !row.isIncoming;
  if (column.key === 'responseDate') isDisabled = !row.isReceived;

  if (isDisabled) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 select-none">
        <span className="text-lg opacity-50">-</span>
      </div>
    );
  }
  
  return <div className="px-2">{row[column.key] || ''}</div>;
};

const EditableTextEditor = (props: any) => {
  const { column, row } = props;
  const isAnySelected = row.isReceived || row.isSent || row.isIncoming;
  
  let isDisabled = !isAnySelected;
  if (column.key === 'sender') isDisabled = !row.isIncoming;
  if (column.key === 'responseDate') isDisabled = !row.isReceived;

  if (isDisabled) {
    return (
      <input 
        autoFocus
        disabled
        className="w-full h-full bg-slate-100 dark:bg-slate-800 px-2 cursor-not-allowed text-center text-slate-400"
        value="-"
        readOnly
        onBlur={() => props.onClose(true)}
      />
    );
  }
  const listId = `datalist-${column.key}`;
  const optionsData = column.optionsData || {};
  let options: string[] = [];
  
  if (optionsData) {
    const optsSet = new Set<string>();
    if (row.isReceived && optionsData.received) {
      optionsData.received[column.key]?.forEach((opt: string) => optsSet.add(opt));
    }
    if (row.isSent && optionsData.sent) {
      optionsData.sent[column.key]?.forEach((opt: string) => optsSet.add(opt));
    }
    if (row.isIncoming && optionsData.incoming) {
      optionsData.incoming[column.key]?.forEach((opt: string) => optsSet.add(opt));
    }
    options = Array.from(optsSet);
  }

  return (
    <div className="w-full h-full relative">
      <input 
        autoFocus
        className="rdg-text-editor w-full h-full px-2 outline-none border-2 border-blue-500 focus:border-blue-600 bg-white dark:bg-slate-800 dark:text-slate-100"
        value={row[column.key] as string || ''}
        list={listId}
        onChange={(e) => props.onRowChange({ ...row, [column.key]: e.target.value })}
        onBlur={() => props.onClose(true)}
      />
      {options.length > 0 && (
        <datalist id={listId}>
          {options.map((opt: string) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      )}
    </div>
  );
};

export const OdooStagingArea = ({ onApply, existingOptions }: Props) => {
  const [rows, setRows] = useState<OdooRow[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const columns = [
    // Read-only Odoo data
    { key: 'odooDate', name: 'Date (Odoo)', width: '8%', minWidth: 100, renderCell: DateFormatter },
    { key: 'approvalSubject', name: 'Ref Code (Odoo)', width: '10%', minWidth: 120 },
    { key: 'subject', name: 'Subject (Odoo)', width: '20%', minWidth: 150 },
    { key: 'requestOwner', name: 'Sender (Owner)', width: '12%', minWidth: 130 },
    
    // Checkboxes for destinations
    { key: 'isReceived', name: '+ پێویست بە وەڵام', width: '8%', minWidth: 120, renderCell: BooleanFormatter },
    { key: 'isSent', name: '+ ڕەوانەکراوەکان', width: '8%', minWidth: 120, renderCell: BooleanFormatter },
    { key: 'isIncoming', name: '+ هاتووەکان', width: '8%', minWidth: 120, renderCell: BooleanFormatter },

    // Editable missing fields
    { key: 'sender', name: 'هاتووە لە (Incoming)', width: '10%', minWidth: 120, renderCell: EditableCellFormatter, renderEditCell: EditableTextEditor, optionsData: existingOptions },
    { key: 'department', name: 'لایەنی پەیوەندیدار', width: '12%', minWidth: 130, renderCell: EditableCellFormatter, renderEditCell: EditableTextEditor, optionsData: existingOptions },
    { key: 'dept1', name: 'بەشی 1', width: '8%', minWidth: 100, renderCell: EditableCellFormatter, renderEditCell: EditableTextEditor, optionsData: existingOptions },
    { key: 'dept2', name: 'بەشی 2', width: '8%', minWidth: 100, renderCell: EditableCellFormatter, renderEditCell: EditableTextEditor, optionsData: existingOptions },
    { key: 'dept3', name: 'بەشی 3', width: '8%', minWidth: 100, renderCell: EditableCellFormatter, renderEditCell: EditableTextEditor, optionsData: existingOptions },
    { key: 'letterType', name: 'جۆری نامە', width: '8%', minWidth: 100, renderCell: EditableCellFormatter, renderEditCell: EditableTextEditor, optionsData: existingOptions },
    { key: 'responseDate', name: 'ڕۆژی وەڵام', width: '8%', minWidth: 100, renderCell: EditableCellFormatter, renderEditCell: EditableTextEditor },
  ];

  const fetchOdooData = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/odoo/fetch');
      const json = await res.json();
      if (json.success) {
        const initialRows: OdooRow[] = json.data.map((item: any) => ({
          ...item,
          department: '',
          dept1: '',
          dept2: '',
          dept3: '',
          letterType: '',
          responseDate: '',
          sender: '',
          isReceived: false,
          isSent: false,
          isIncoming: false
        }));
        setRows(initialRows);
        setHasFetched(true);
      } else {
        alert("Failed to fetch Odoo data");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleApply = () => {
    const receivedToApply: any[] = [];
    const sentToApply: any[] = [];
    const incomingToApply: any[] = [];

    // Helper to generate a dummy ID. AdminDataEntry will re-assign proper IDs on addRow, 
    // but here we just need a unique string to identify new rows that the DB will ignore.
    const generateId = () => `new-${Math.floor(Math.random() * 1000000)}`;

    for (const row of rows) {
      if (row.isReceived) {
        receivedToApply.push({
          id: generateId(),
          subject: row.subject,
          department: row.department,
          dept1: row.dept1,
          dept2: row.dept2,
          dept3: row.dept3,
          refCode: row.approvalSubject,
          letterType: row.letterType,
          sentDate: row.odooDate ? new Date(row.odooDate).toISOString() : null,
          responseDate: row.responseDate ? new Date(row.responseDate).toISOString() : null,
          processingTime: null,
          slaTime: '-'
        });
      }
      
      if (row.isSent) {
        sentToApply.push({
          id: generateId(),
          subject: row.subject,
          department: row.department,
          dept1: row.dept1,
          dept2: row.dept2,
          dept3: row.dept3,
          refCode: row.approvalSubject,
          letterType: row.letterType,
          sentDate: row.odooDate ? new Date(row.odooDate).toISOString() : null,
        });
      }

      if (row.isIncoming) {
        incomingToApply.push({
          id: generateId(),
          subject: row.subject,
          sender: row.sender || row.requestOwner, // Fallback to owner if empty
          department: row.department,
          dept1: row.dept1,
          dept2: row.dept2,
          dept3: row.dept3,
          refCode: row.approvalSubject,
          letterType: row.letterType,
          sentDate: row.odooDate ? new Date(row.odooDate).toISOString() : null,
        });
      }
    }

    if (receivedToApply.length === 0 && sentToApply.length === 0 && incomingToApply.length === 0) {
      alert("No rows selected. Please check at least one destination checkbox for a row.");
      return;
    }

    onApply(receivedToApply, sentToApply, incomingToApply);
    
    // Clear handled rows
    setRows(rows.filter(r => !r.isReceived && !r.isSent && !r.isIncoming));
  };

  if (!hasFetched) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900/50">
        <div className="w-24 h-24 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 shadow-inner">
          <Cloud size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">Odoo API Integration</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg leading-relaxed mb-8">
          Fetch the latest Approval Requests directly from Odoo. Select destination tables for each row and fill out any missing info easily.
        </p>
        <button 
          onClick={fetchOdooData}
          disabled={isFetching}
          className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 text-lg"
        >
          {isFetching ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download size={22} />
          )}
          کێشانی داتا (Fetch Last 10 Days)
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" dir="ltr">
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-start gap-3" dir="rtl">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed font-medium">
          <strong>هەنگاوەکان:</strong> 
          ١- ئەو خشتەیە هەڵبژێرە کە دەتەوێت دێڕەکەی بۆ بنێریت (دەتوانیت زیاتر لە یەکێک هەڵبژێریت). 
          ٢- خانە بەتاڵەکان پڕبکەرەوە (وەک لایەنی پەیوەندیدار، جۆری نامە). 
          ٣- کلیک لە "Apply Selections" بکە بۆ زیادکردنیان بۆ خشتە سەرەکییەکان.
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden p-2">
        <DataGrid 
          columns={columns} 
          rows={rows} 
          onRowsChange={setRows}
          className="rdg-light h-full w-full rounded-xl border border-slate-200 shadow-sm"
        />
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center" dir="rtl">
        <button 
          onClick={() => { setRows([]); setHasFetched(false); }}
          className="flex items-center gap-2 px-6 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-colors"
        >
          <X size={18} />
          پاشگەزبوونەوە (Cancel)
        </button>
        
        <button 
          onClick={handleApply}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Check size={20} />
          جێبەجێکردنی هەڵبژێردراوەکان (Apply Selections)
        </button>
      </div>
    </div>
  );
};
