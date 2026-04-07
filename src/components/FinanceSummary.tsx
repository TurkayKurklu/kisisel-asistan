"use client";

import React from "react";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { motion } from "framer-motion";

interface FinanceSummaryProps {
  totalIncome: number;
  totalExpense: number;
}

export default function FinanceSummary({ totalIncome, totalExpense }: FinanceSummaryProps) {
  const balance = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-2 glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet size={80} />
        </div>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1">Mevcut Bakiye</p>
        <h2 className="text-4xl font-bold text-white tabular-nums">
          ₺{balance.toLocaleString("tr-TR")}
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-4 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-emerald-400">
          <ArrowUpCircle size={18} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Gelir</span>
        </div>
        <p className="text-xl font-bold text-white/90 tabular-nums">
          ₺{totalIncome.toLocaleString("tr-TR")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-4 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-rose-400">
          <ArrowDownCircle size={18} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Gider</span>
        </div>
        <p className="text-xl font-bold text-white/90 tabular-nums">
          ₺{totalExpense.toLocaleString("tr-TR")}
        </p>
      </motion.div>
    </div>
  );
}
