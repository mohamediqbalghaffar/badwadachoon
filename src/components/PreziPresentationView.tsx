"use client";

import React from "react";
import { useData } from "../context/DataContext";
import { motion } from "framer-motion";
import { Presentation, Layers } from "lucide-react";

export const PreziPresentationView = () => {
  const { data, sentData, incomingData } = useData();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden bg-slate-950 text-white rounded-3xl p-8 shadow-2xl">
      {/* Background blobs for motion graphic feel */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} 
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-teal-600/20 rounded-full blur-[100px]"
      />

      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl"
      >
        <div className="p-6 bg-white/10 backdrop-blur-xl rounded-full mb-8 border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
          <Layers size={64} className="text-teal-400" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-400 to-indigo-400 leading-tight pb-4">
          Prezi Motion Graphic
        </h1>
        
        <p className="text-xl text-slate-300 mb-12 leading-relaxed">
          This is a placeholder for the new Prezi-style motion graphic presentation mode. It will feature deep zoom transitions, fluid animations, and a canvas-based spatial navigation system.
        </p>

        <div className="grid grid-cols-3 gap-6 w-full">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">{incomingData.length}</div>
            <div className="text-sm text-slate-400">Incoming</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">{data.length}</div>
            <div className="text-sm text-slate-400">Received</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">{sentData.length}</div>
            <div className="text-sm text-slate-400">Sent</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
