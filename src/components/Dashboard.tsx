"use client";

import React from "react";
import { OmniFilter } from "./OmniFilter";
import { KPICards } from "./KPICards";
import { DashboardCharts } from "./Charts";
import { DataTable } from "./DataTable";

export const Dashboard = () => {
  return (
    <div className="w-full max-w-[95%] 2xl:max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          بەدواداچوون
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          داشبۆردی شیکاری داتای نامەکان و بەدواداچوونی مامەڵەکان
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-2">
        <OmniFilter />
        <KPICards />
        <DashboardCharts />
        <DataTable />
      </div>
    </div>
  );
};
