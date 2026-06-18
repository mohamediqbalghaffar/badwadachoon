"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useData } from "../context/DataContext";
import { Layers, Clock, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";

export const PresentationView = () => {
  const { baseFilteredData } = useData();
  const [activeSlide, setActiveSlide] = useState(0);

  const totalLetters = baseFilteredData.length;
  const pendingLetters = baseFilteredData.filter((item) => !item.responseDate).length;
  
  const completedLetters = baseFilteredData.filter((item) => item.processingTime !== null);
  const avgProcessingTime =
    completedLetters.length > 0
      ? completedLetters.reduce((acc, curr) => acc + (curr.processingTime ?? 0), 0) / completedLetters.length
      : 0;

  const slides = [
    {
      id: "total",
      title: "کۆی گشتی نامەکان",
      value: totalLetters,
      icon: <Layers size={120} className="text-blue-500 drop-shadow-2xl" />,
      gradient: "from-blue-600 to-cyan-400",
      bgBlur: "bg-blue-500/20",
      description: "سەرجەم ئەو نامانەی لە سیستەمەکەدا تۆمارکراون"
    },
    {
      id: "pending",
      title: "نامە هەڵپەسێردراوەکان (بێ وەڵام)",
      value: pendingLetters,
      icon: <AlertTriangle size={120} className="text-amber-500 drop-shadow-2xl" />,
      gradient: "from-amber-500 to-orange-400",
      bgBlur: "bg-amber-500/20",
      description: "ئەو نامانەی کە هێشتا وەڵامیان نەدراوەتەوە و لە چاوەڕوانیدان"
    },
    {
      id: "avg-time",
      title: "تێکڕای کاتی وەڵامدانەوە",
      value: `${avgProcessingTime.toFixed(1)} ڕۆژ`,
      icon: <Clock size={120} className="text-emerald-500 drop-shadow-2xl" />,
      gradient: "from-emerald-500 to-teal-400",
      bgBlur: "bg-emerald-500/20",
      description: "تێکڕای ئەو کاتەی پێویستە بۆ وەڵامدانەوەی مامەڵەکان"
    }
  ];

  const handleNext = useCallback(() => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        // Right arrow means going forward in LTR, but in RTL (Kurdish) we might want to map it to Next or Prev.
        // Let's make Left go to next (since reading is Right to Left), and Right go to prev.
        handlePrev();
      } else if (e.key === "ArrowLeft") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden rounded-3xl bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-8">
      
      {/* Navigation Buttons */}
      <button 
        onClick={handlePrev}
        className="absolute right-4 z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-800 dark:text-white transition-all hover:scale-110 backdrop-blur-md"
      >
        <ChevronRight size={48} />
      </button>
      
      <button 
        onClick={handleNext}
        className="absolute left-4 z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-800 dark:text-white transition-all hover:scale-110 backdrop-blur-md"
      >
        <ChevronLeft size={48} />
      </button>

      {/* Slides Container */}
      <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
        {slides.map((slide, index) => {
          const isActive = index === activeSlide;
          return (
            <div
              key={slide.id}
              className={`absolute transition-all duration-700 ease-in-out flex flex-col items-center text-center ${
                isActive 
                  ? "opacity-100 scale-100 translate-x-0 z-10" 
                  : "opacity-0 scale-90 -translate-x-20 -z-10 pointer-events-none"
              }`}
            >
              {/* Massive Blur Background */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] ${slide.bgBlur} -z-10`} />
              
              <div className="mb-12 animate-bounce-slow">
                {slide.icon}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-medium text-slate-600 dark:text-slate-300 mb-6">
                {slide.title}
              </h2>
              
              <div className={`text-8xl md:text-[160px] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${slide.gradient} drop-shadow-sm mb-8 leading-none`}>
                {slide.value}
              </div>
              
              <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl">
                {slide.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 flex gap-4 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`transition-all duration-300 rounded-full h-3 ${
              index === activeSlide 
                ? "w-12 bg-blue-500 dark:bg-blue-400" 
                : "w-3 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
