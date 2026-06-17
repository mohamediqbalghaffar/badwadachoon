"use client";

import React from "react";
import { DataProvider, useData } from "../context/DataContext";
import { FileUploader } from "../components/FileUploader";
import { Dashboard } from "../components/Dashboard";
import { HTSLogoBackground } from "../components/HTSLogoBackground";
import { ParticlesCanvas } from "../components/ParticlesCanvas";

const MainContent = () => {
  const { data } = useData();

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-500">
      {/* Interactive Motion Graphic Backgrounds */}
      <HTSLogoBackground />
      <ParticlesCanvas />
      
      <div className="relative z-10 w-full h-full min-h-screen flex items-center justify-center pt-8 pb-12">
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
