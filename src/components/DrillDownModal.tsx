import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { X } from 'lucide-react';
import { DataTable } from './DataTable';
import { IncomingView } from './IncomingView';
import { SentDashboard } from './SentDashboard';

export const DrillDownModal = () => {
  const { drillDown, setDrillDown } = useData();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (drillDown) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drillDown]);

  if (!drillDown) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setDrillDown(null)}
      />
      <div className="relative w-full max-w-7xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-500 rounded-full" />
            {drillDown.title}
            <span className="text-sm font-medium text-slate-500 bg-slate-200/50 dark:bg-slate-700/50 px-3 py-1 rounded-full ml-4">
              {drillDown.data.length} تۆمار
            </span>
          </h2>
          <button
            onClick={() => setDrillDown(null)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          {drillDown.viewType === 'received' && (
            <DataTable customData={drillDown.data} hideHeader={true} />
          )}
          {drillDown.viewType === 'incoming' && (
            <IncomingView customData={drillDown.data} hideHeader={true} />
          )}
          {drillDown.viewType === 'sent' && (
            <SentDashboard customData={drillDown.data} hideHeader={true} />
          )}
        </div>
      </div>
    </div>
  );
};
