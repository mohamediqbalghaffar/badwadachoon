"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { DashboardData } from "../utils/parser";

interface FilterState {
  dateRange: { start: string | null; end: string | null };
  departments: string[];
  letterType: string | null;
  slaStatus: string | null;
}

interface DataContextType {
  data: DashboardData[];
  setData: (data: DashboardData[]) => void;
  filteredData: DashboardData[];
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
  });

  const filteredData = useMemo(() => {
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
  }, [data, filters]);

  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      departments: [],
      letterType: null,
      slaStatus: null,
    });
  };

  return (
    <DataContext.Provider
      value={{ data, setData, filteredData, filters, setFilters, clearFilters }}
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
