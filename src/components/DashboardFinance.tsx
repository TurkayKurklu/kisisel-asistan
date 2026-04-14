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
      {/* Main Balance Card - Ultra Wide */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          boxShadow: balance < 0 
            ? "0 0 40px rgba(244, 63, 94, 0.4)" // Red alert glow
            : balance > 5000 
              ? "0 0 40px rgba(16, 163, 127, 0.2)" // Premium green health glow
              : "0 20px 60px rgba(0, 0, 0, 0.4)"
        }}
        className={cn(
          "bento-card bg-white/[0.04] border-white/10 flex flex-col gap-8 relative overflow-hidden group min-h-[300px] justify-between transition-all duration-700",
          balance < 0 && "border-rose-500/50 bg-rose-500/[0.02] animate-pulse-subtle"
        )}
      >
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col">
            <span className="text-label-fintech mb-3">Cüzdan Durumu</span>
            <div className="flex items-baseline gap-3">
              <span className={cn(
                "text-3xl font-black transition-colors duration-700",
                balance < 0 ? "text-rose-500" : "text-white/30"
              )}>₺</span>
              <p className={cn(
                "text-7xl font-black tracking-tighter leading-none transition-colors duration-700 flex items-center gap-4",
                balance < 0 ? "text-rose-500" : "text-white"
              )}>
                {balance.toLocaleString("tr-TR")}
                {balance > 0 && <span className="text-2xl animate-bounce-slow text-emerald-500">✨</span>}
                {balance < 0 && <span className="text-2xl animate-pulse text-rose-500">⚠</span>}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onAddTransaction}
            className={cn(
              "w-16 h-16 rounded-[1.5rem] glass-panel flex items-center justify-center transition-all duration-500 shadow-xl",
              balance < 0 
                ? "bg-rose-500/20 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white" 
                : "bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white"
            )}
          >
            <Wallet size={32} />
          </button>
        </div>

        <div className="relative z-10 w-full mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddTransaction}
            className={cn(
              "group/btn w-full h-24 border-2 rounded-[2rem] flex items-center justify-center gap-6 transition-all duration-500 relative overflow-hidden",
              balance < 0
                ? "bg-rose-600/10 border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white"
                : "bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white"
            )}
          >
            <ArrowUpRight size={40} className="group-hover/btn:rotate-45 transition-transform duration-500" />
            <span className="text-2xl font-black uppercase tracking-[0.3em]">Yeni İşlem</span>
            
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity",
              balance < 0 ? "bg-rose-400/5" : "bg-emerald-400/5"
            )} />
          </motion.button>
        </div>

        {/* Subtle radial glow */}
        <div className={cn(
          "absolute -top-1/2 -right-1/4 w-[150%] h-[150%] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000",
          balance < 0 ? "bg-rose-500/10" : "bg-primary/5 group-hover:bg-primary/10"
        )} />
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
