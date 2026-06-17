"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { DashboardData } from "../utils/parser";

interface FilterState {
  dateRange: { start: string | null; end: string | null };
  departments: string[];
  letterType: string | null;
  slaStatus: string | null;
  completionStatus: 'all' | 'pending' | 'completed';
}

interface DataContextType {
  data: DashboardData[];
  setData: (data: DashboardData[]) => void;
  filteredData: DashboardData[];
  baseFilteredData: DashboardData[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  clearFilters: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<DashboardData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: null, end: null },
    departments: [],
    letterType: null,
    slaStatus: null,
    completionStatus: 'all',
  });

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
      if (filters.letterType && item.letterType !== filters.letterType) {
        return false;
      }

      // SLA Status filter
      if (filters.slaStatus && item.slaTime !== filters.slaStatus) {
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

  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      departments: [],
      letterType: null,
      slaStatus: null,
      completionStatus: 'all',
    });
  };

  return (
    <DataContext.Provider
      value={{ data, setData, filteredData, baseFilteredData, filters, setFilters, clearFilters }}
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
