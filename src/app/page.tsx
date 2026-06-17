"use client";

import React from "react";
import { DataProvider, useData } from "../context/DataContext";
import { FileUploader } from "../components/FileUploader";
import { Dashboard } from "../components/Dashboard";

const MainContent = () => {
  const { data } = useData();

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Abstract Background Orbs for Glassmorphism feel */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none dark:bg-blue-900/20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none dark:bg-purple-900/20" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none dark:bg-emerald-900/20" />
      
      <div className="relative z-10 w-full h-full min-h-screen flex items-center justify-center">
        {data.length === 0 ? <FileUploader /> : <Dashboard />}
      </div>
    </main>
  );
};

export default function Home() {
  return (
    <DataProvider>
      <MainContent />
    </DataProvider>
  );
}
