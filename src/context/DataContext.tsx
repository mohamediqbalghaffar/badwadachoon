"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { DashboardData, SentLetterData } from "../utils/parser";

export type ActiveView = 'received' | 'sent' | 'comparison';

interface FilterState {
  dateRange: { start: string | null; end: string | null };
  departments: string[];
  letterType: string[];
  slaStatus: string[];
  completionStatus: 'all' | 'pending' | 'completed';
}

interface DataContextType {
  // Received (Sheet 1)
  data: DashboardData[];
  setData: (data: DashboardData[]) => void;
  filteredData: DashboardData[];
  baseFilteredData: DashboardData[];
  // Sent (Sheet 2)
  sentData: SentLetterData[];
  setSentData: (data: SentLetterData[]) => void;
  filteredSentData: SentLetterData[];
  baseFilteredSentData: SentLetterData[];
  // Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  clearFilters: () => void;
  // View
  activeView: ActiveView;
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
  isPresentationMode: boolean;
  setIsPresentationMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<DashboardData[]>([]);
  const [sentData, setSentData] = useState<SentLetterData[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('received');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: null, end: null },
    departments: [],
    letterType: [],
    slaStatus: [],
    completionStatus: 'all',
  });
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // === RECEIVED DATA FILTERS ===

  // Base filtered data: all filters EXCEPT completionStatus
  // Used by KPI cards so their values stay stable when a KPI card is clicked
  const baseFilteredData = useMemo(() => {
    return data.filter((item) => {
      // Date filter
      if (filters.dateRange.start && item.sentDate) {
        if (new Date(item.sentDate) < new Date(filters.dateRange.start)) return false;
      }
      if (filters.dateRange.end && item.sentDate) {
        if (new Date(item.sentDate) > new Date(filters.dateRange.end)) return false;
      }

      // Department filter
      if (filters.departments.length > 0 && !filters.departments.includes(item.department)) {
        return false;
      }

      // Letter Type filter
      if (filters.letterType.length > 0 && !filters.letterType.includes(item.letterType)) {
        return false;
      }

      // SLA Status filter
      if (filters.slaStatus.length > 0 && (!item.slaTime || !filters.slaStatus.includes(item.slaTime))) {
        return false;
      }

      return true;
    });
  }, [data, filters.dateRange, filters.departments, filters.letterType, filters.slaStatus]);

  // Full filtered data: includes completionStatus filter on top of baseFilteredData
  // Used by charts, data table, and detail views
  const filteredData = useMemo(() => {
    if (filters.completionStatus === 'all') return baseFilteredData;
    return baseFilteredData.filter((item) => {
      if (filters.completionStatus === 'pending' && item.responseDate !== null) return false;
      if (filters.completionStatus === 'completed' && item.responseDate === null) return false;
      return true;
    });
  }, [baseFilteredData, filters.completionStatus]);

  // === SENT DATA FILTERS ===

  const baseFilteredSentData = useMemo(() => {
    return sentData.filter((item) => {
      // Date filter
      if (filters.dateRange.start && item.sentDate) {
        if (new Date(item.sentDate) < new Date(filters.dateRange.start)) return false;
      }
      if (filters.dateRange.end && item.sentDate) {
        if (new Date(item.sentDate) > new Date(filters.dateRange.end)) return false;
      }

      // Department filter
      if (filters.departments.length > 0 && !filters.departments.includes(item.department)) {
        return false;
      }

      // Letter Type filter
      if (filters.letterType.length > 0 && !filters.letterType.includes(item.letterType)) {
        return false;
      }

      return true;
    });
  }, [sentData, filters.dateRange, filters.departments, filters.letterType]);

  // For sent data, no completion status applies — same as base
  const filteredSentData = baseFilteredSentData;

  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      departments: [],
      letterType: [],
      slaStatus: [],
      completionStatus: 'all',
    });
  };

  return (
    <DataContext.Provider
      value={{
        data, setData,
        filteredData, baseFilteredData,
        sentData, setSentData,
        filteredSentData, baseFilteredSentData,
        filters, setFilters, clearFilters,
        activeView, setActiveView,
        isPresentationMode, setIsPresentationMode,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
