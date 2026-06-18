"use client";

import React from "react";
import { OmniFilter } from "./OmniFilter";
import { KPICards } from "./KPICards";
import { DashboardCharts } from "./Charts";
import { DataTable } from "./DataTable";
import { useData } from "../context/DataContext";
import { PresentationView } from "./PresentationView";
import { MonitorPlay, X } from "lucide-react";

export const Dashboard = () => {
  const { isPresentationMode, setIsPresentationMode } = useData();

  return (
    <div className="w-full max-w-[95%] 2xl:max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 relative">
      {/* Presentation Mode Toggle */}
      <button
        onClick={() => setIsPresentationMode(!isPresentationMode)}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50 p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-lg hover:scale-110 flex items-center gap-2 group"
        title={isPresentationMode ? "داخستنی پێشکەشکردن" : "پێشکەشکردن"}
      >
        {isPresentationMode ? (
          <>
            <span className="hidden group-hover:block text-sm font-medium">داخستن</span>
            <X size={24} />
          </>
        ) : (
          <>
            <span className="hidden group-hover:block text-sm font-medium">پێشکەشکردن</span>
            <MonitorPlay size={24} />
          </>
        )}
      </button>

      {!isPresentationMode ? (
        <>
          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-blue-600 to-red-600 dark:from-red-500 dark:via-blue-500 dark:to-red-500 text-gradient-animate pb-2 tracking-tight">
              بەدواداچوون
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg animate-fade-up delay-100">
              داشبۆردی شیکاری داتای نامەکان و بەدواداچوونی مامەڵەکان
            </p>
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-4">
            <div className="animate-fade-up delay-200 relative z-30">
              <OmniFilter />
            </div>
            <div className="animate-fade-up delay-300 relative z-20">
              <KPICards />
            </div>
            <div className="animate-fade-up delay-400 relative z-10">
              <DashboardCharts />
            </div>
            <div className="animate-fade-up delay-500 relative z-0">
              <DataTable />
            </div>
          </div>
        </>
      ) : (
        <div className="animate-fade-in mt-12 sm:mt-0">
          <PresentationView />
        </div>
      )}
    </div>
  );
};
