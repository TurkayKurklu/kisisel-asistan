"use client";

import React from "react";
import { Sparkles, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface QuickAddBarProps {
  onClick: () => void;
}

export default function QuickAddBar({ onClick }: QuickAddBarProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full glass-panel p-6 flex items-center justify-between group overflow-hidden relative border-white/5 bg-white/[0.03]"
    >
      <div className="flex items-center gap-4 relative z-10 transition-transform group-hover:translate-x-1">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-primary group-hover:text-white transition-all duration-500">
          <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-white font-black text-base tracking-tight">Yeni Bir Plan Ekle</span>
          <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Gününü Belirle</span>
        </div>
      </div>
      
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-white group-hover:text-black transition-all duration-500 relative z-10">
        <Plus size={24} />
      </div>

      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </motion.button>
  );
}
