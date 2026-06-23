"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { DashboardData, SentLetterData, IncomingLetterData } from "../utils/parser";

export type ActiveView = 'incoming' | 'received' | 'sent' | 'comparison';
export type AdminMode = 'live' | 'local';

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
  // Incoming (Sheet 3)
  incomingData: IncomingLetterData[];
  setIncomingData: (data: IncomingLetterData[]) => void;
  filteredIncomingData: IncomingLetterData[];
  baseFilteredIncomingData: IncomingLetterData[];
  // Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  clearFilters: () => void;
  // View
  activeView: ActiveView;
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
  isPresentationMode: boolean;
  setIsPresentationMode: React.Dispatch<React.SetStateAction<boolean>>;
  dbLoading: boolean;
  mode: AdminMode;
  viewerSelectedUserId: string | null;
  setViewerSelectedUserId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children, mode }: { children: React.ReactNode, mode: AdminMode }) => {
  const [data, setData] = useState<DashboardData[]>([]);
  const [sentData, setSentData] = useState<SentLetterData[]>([]);
  const [incomingData, setIncomingData] = useState<IncomingLetterData[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('incoming');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: null, end: null },
    departments: [],
    letterType: [],
    slaStatus: [],
    completionStatus: 'all',
  });
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [viewerSelectedUserId, setViewerSelectedUserId] = useState<string | null>(null);

  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  // Fetch initial data from DB on mount
  React.useEffect(() => {
    if (mode === 'local' || userRole === 'viewer') {
      setDbLoading(false);
      return;
    }

    const fetchFromDb = async () => {
      try {
        setDbLoading(true);
        const [resReceived, resSent, resIncoming] = await Promise.all([
          fetch('/api/db/received'),
          fetch('/api/db/sent'),
          fetch('/api/db/incoming')
        ]);
        
        if (resReceived.ok) {
          const received = await resReceived.json();
          setData(received);
        }
        if (resSent.ok) {
          const sent = await resSent.json();
          setSentData(sent);
        }
        if (resIncoming.ok) {
          const incoming = await resIncoming.json();
          setIncomingData(incoming);
        }
      } catch (err) {
        console.error("Failed to fetch data from DB:", err);
      } finally {
        setDbLoading(false);
      }
    };

    fetchFromDb();
  }, [mode]);

  // === VIEWER LIVE DATA FETCHING ===
  React.useEffect(() => {
    if (!viewerSelectedUserId) return;
    
    let isSubscribed = true;
    const fetchViewerData = async () => {
      try {
        const res = await fetch(`/api/presence/data?userId=${viewerSelectedUserId}`);
        if (res.ok && isSubscribed) {
          const json = await res.json();
          setData(json.data || []);
          setSentData(json.sentData || []);
          setIncomingData(json.incomingData || []);
        }
      } catch (err) {
        console.error("Failed to fetch viewer data:", err);
      }
    };

    fetchViewerData();
    const interval = setInterval(fetchViewerData, 2000); // Polling every 2s to keep live view synced
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [viewerSelectedUserId]);

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
      if (filters.departments.length > 0 && !item.departments.some(d => filters.departments.includes(d))) {
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
      if (filters.departments.length > 0 && !item.departments.some(d => filters.departments.includes(d))) {
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
  const filteredSentData = useMemo(() => baseFilteredSentData, [baseFilteredSentData]);

  // === INCOMING DATA FILTERS ===
  const baseFilteredIncomingData = useMemo(() => {
    let filtered = [...incomingData];
    if (filters.dateRange.start && filters.dateRange.end) {
      const start = new Date(filters.dateRange.start).getTime();
      const end = new Date(filters.dateRange.end).getTime();
      filtered = filtered.filter(item => {
        if (!item.sentDate) return false;
        const itemDate = new Date(item.sentDate).getTime();
        return itemDate >= start && itemDate <= end;
      });
    }
    if (filters.departments.length > 0) {
      filtered = filtered.filter(item => 
        item.departments.some(d => filters.departments.includes(d))
      );
    }
    if (filters.letterType.length > 0) {
      filtered = filtered.filter(item => 
        filters.letterType.includes(item.letterType)
      );
    }
    return filtered;
  }, [incomingData, filters.dateRange, filters.departments, filters.letterType]);

  const filteredIncomingData = useMemo(() => baseFilteredIncomingData, [baseFilteredIncomingData]);

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
        incomingData, setIncomingData,
        filteredIncomingData, baseFilteredIncomingData,
        filters, setFilters, clearFilters,
        activeView, setActiveView,
        isPresentationMode, setIsPresentationMode,
        dbLoading, mode,
        viewerSelectedUserId, setViewerSelectedUserId,
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
