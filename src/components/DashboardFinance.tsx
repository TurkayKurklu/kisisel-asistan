"use client";

import React from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardFinanceProps {
  balance: number;
  income: number;
  expense: number;
  onAddTransaction?: () => void;
}

export default function DashboardFinance({ balance, income, expense, onAddTransaction }: DashboardFinanceProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Main Balance Card - Ultra Wide */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card bg-white/[0.04] border-white/10 flex flex-col gap-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group min-h-[300px] justify-between"
      >
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col">
            <span className="text-label-fintech mb-3">Cüzdan</span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-white/30">₺</span>
              <p className="text-7xl font-black text-white tracking-tighter leading-none">
                {balance.toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onAddTransaction}
            className="w-16 h-16 rounded-[1.5rem] glass-panel flex items-center justify-center text-primary bg-primary/10 border-primary/20 hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-primary/20"
          >
            <Wallet size={32} />
          </button>
        </div>

        <div className="relative z-10 w-full mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddTransaction}
            className="group/btn w-full h-24 bg-emerald-600/10 border-2 border-emerald-500/20 rounded-[2rem] text-emerald-400 flex items-center justify-center gap-6 hover:bg-emerald-600 hover:text-white transition-all duration-500 relative overflow-hidden"
          >
            <ArrowUpRight size={40} className="group-hover/btn:rotate-45 transition-transform duration-500" />
            <span className="text-2xl font-black uppercase tracking-[0.3em]">Yeni İşlem</span>
            
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </motion.button>
        </div>

        {/* Subtle radial glow */}
        <div className="absolute -top-1/2 -right-1/4 w-[150%] h-[150%] bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card p-8 border-white/5 bg-emerald-500/[0.02] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-6">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
               <TrendingUp size={24} />
             </div>
             <span className="text-label-fintech">Gelir</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white tracking-tighter">
              ₺{income.toLocaleString("tr-TR")}
            </p>
            <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Aylık Değişim</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card p-8 border-white/5 bg-rose-500/[0.02] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-6">
             <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
               <TrendingDown size={24} />
             </div>
             <span className="text-label-fintech">Gider</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white tracking-tighter">
              ₺{expense.toLocaleString("tr-TR")}
            </p>
            <p className="text-[10px] font-black text-rose-500/50 uppercase tracking-widest">Aylık Değişim</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
