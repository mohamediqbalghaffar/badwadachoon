"use client";

import React, { useState } from "react";
import { DataProvider, useData } from "../context/DataContext";
import { FileUploader } from "../components/FileUploader";
import { Dashboard } from "../components/Dashboard";
import { HTSLogoBackground } from "../components/HTSLogoBackground";
import { ParticlesCanvas } from "../components/ParticlesCanvas";
import { LandingPortals } from "../components/LandingPortals";
import { ArrowRight } from "lucide-react";

interface MainContentProps {
  onBack: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ onBack }) => {
  const { data, sentData } = useData();
  const hasData = data.length > 0 || sentData.length > 0;

  return (
    <>
      {/* Floating Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full shadow-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <ArrowRight size={18} />
        <span className="font-medium text-sm">گەڕانەوە</span>
      </button>

      <div className="relative z-10 w-full h-full min-h-screen flex flex-col items-center justify-center pt-20 pb-12">
        {!hasData ? <FileUploader /> : <Dashboard />}
      </div>
    </>
  );
};

export default function Home() {
  const [activeModule, setActiveModule] = useState<'landing' | 'admin'>('landing');

  return (
    <DataProvider>
      <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-500">
        {/* Interactive Motion Graphic Backgrounds */}
        <HTSLogoBackground />
        <ParticlesCanvas />
        
        {activeModule === 'landing' ? (
          <LandingPortals onSelectAdmin={() => setActiveModule('admin')} />
        ) : (
          <MainContent onBack={() => setActiveModule('landing')} />
        )}
      </main>
    </DataProvider>
  );
}
