"use client";

import React from "react";
import { OmniFilter } from "./OmniFilter";
import { KPICards } from "./KPICards";
import { DashboardCharts } from "./Charts";
import { DataTable } from "./DataTable";

export const Dashboard = () => {
  return (
    <div className="w-full max-w-[95%] 2xl:max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
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
        <div className="animate-fade-up delay-200">
          <OmniFilter />
        </div>
        <div className="animate-fade-up delay-300">
          <KPICards />
        </div>
        <div className="animate-fade-up delay-400">
          <DashboardCharts />
        </div>
        <div className="animate-fade-up delay-500">
          <DataTable />
        </div>
      </div>
    </div>
  );
};
