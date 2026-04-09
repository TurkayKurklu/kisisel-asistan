"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Euro, 
  Calculator, 
  ArrowRight,
  Info,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import DashboardHeader from "@/components/DashboardHeader";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Exchange Rate API helpers
const BASE_URL = "https://api.frankfurter.app";

export default function FinanceFuelPage() {
  const [rates, setRates] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fuel Calculator State
  const [distance, setDistance] = useState<string>("");
  const [consumption, setConsumption] = useState<string>("");
  const [fuelPrice, setFuelPrice] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number | null>(null);

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      // Get current rates (using USD as base since Frankfurter doesn't support TRY as base)
      const latestRes = await fetch(`${BASE_URL}/latest?from=USD&to=TRY,EUR`);
      const latestData = await latestRes.json();

      const usdToTry = latestData.rates.TRY;
      const eurToTry = latestData.rates.TRY / latestData.rates.EUR;

      setRates({
        USD: usdToTry,
        EUR: eurToTry,
        date: latestData.date
      });
      setLastUpdated(new Date());

      // Get 7-day history
      const endDate = format(new Date(), "yyyy-MM-dd");
      const startDate = format(subDays(new Date(), 8), "yyyy-MM-dd");
      const historyRes = await fetch(`${BASE_URL}/${startDate}..${endDate}?from=USD&to=TRY,EUR`);
      const historyData = await historyRes.json();

      const formattedHistory = Object.entries(historyData.rates).map(([date, values]: [string, any]) => ({
        date: format(new Date(date), "d MMM", { locale: tr }),
        USD: values.TRY,
        EUR: values.TRY / values.EUR
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error("Rate fetch error:", error);
      toast.error("Döviz kurları alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const calculateFuel = () => {
    const dist = parseFloat(distance);
    const cons = parseFloat(consumption);
    const price = parseFloat(fuelPrice);

    if (isNaN(dist) || isNaN(cons) || isNaN(price)) {
      setTotalCost(null);
      return;
    }

    const result = (dist / 100) * cons * price;
    setTotalCost(result);
  };

  // Auto calculate fuel when inputs change
  useEffect(() => {
    calculateFuel();
  }, [distance, consumption, fuelPrice]);

  return (
    <div className="space-y-10 animate-chat-fade pb-32">
      <DashboardHeader 
        title="Finans ve Yakıt" 
        subtitle="Güncel kurlar ve yakıt hesaplama araçları."
        showSearch={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Exchange Rates Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* USD Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111827] border border-[#1f2937] p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign size={160} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Amerikan Doları</h3>
                    <p className="text-xs text-[#9ca3af] font-medium font-mono uppercase tracking-widest">USD / TRY</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#9ca3af]/40">₺</span>
                  <h2 className="text-5xl font-black tracking-tighter text-[#e5e7eb]">
                    {rates?.USD.toFixed(4) || "---"}
                  </h2>
                </div>
                
                <div className="mt-8 pt-6 border-t border-[#1f2937]/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold font-mono">+0.12%</span>
                  </div>
                  <button 
                    onClick={fetchExchangeRates}
                    className="p-2 bg-[#1f2937] rounded-xl text-[#9ca3af] hover:text-white transition-colors"
                  >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* EUR Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111827] border border-[#1f2937] p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Euro size={160} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Euro size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Euro</h3>
                    <p className="text-xs text-[#9ca3af] font-medium font-mono uppercase tracking-widest">EUR / TRY</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#9ca3af]/40">₺</span>
                  <h2 className="text-5xl font-black tracking-tighter text-[#e5e7eb]">
                    {rates?.EUR.toFixed(4) || "---"}
                  </h2>
                </div>

                <div className="mt-8 pt-6 border-t border-[#1f2937]/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400">
                    <TrendingDown size={16} />
                    <span className="text-xs font-bold font-mono">-0.05%</span>
                  </div>
                  <span className="text-[10px] text-[#9ca3af]/40 font-bold uppercase tracking-widest">
                    {rates?.date || "Güncel"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111827] border border-[#1f2937] rounded-3xl p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div>
                <h3 className="text-xl font-bold text-white">Döviz Grafiği</h3>
                <p className="text-sm text-[#9ca3af] font-medium">Son 7 günlük değişim analizi.</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#020617] border border-[#1f2937] rounded-xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">USD</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#020617] border border-[#1f2937] rounded-xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">EUR</span>
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10a37f" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10a37f" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={['auto', 'auto']}
                    dx={-10}
                    tickFormatter={(val) => `₺${val.toFixed(1)}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#020617', 
                      borderColor: '#1f2937', 
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="USD" 
                    stroke="#10a37f" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUsd)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="EUR" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEur)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Fuel Calculator Section */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#111827] border border-[#1f2937] rounded-3xl overflow-hidden flex flex-col h-full"
          >
            <div className="p-8 border-b border-[#1f2937] bg-[#111827]/50">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#1f2937] flex items-center justify-center text-[#10a37f]">
                  <Fuel size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Yakıt Hesaplayıcı</h3>
              </div>
              <p className="text-xs text-[#9ca3af] font-medium leading-relaxed">
                Yolculuk maliyetinizi hızlıca hesaplayın.
              </p>
            </div>

            <div className="p-8 space-y-8">
              {/* Distance Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest pl-1">Gidilecek Yol (km)</label>
                <div className="relative group">
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Örn: 450"
                    className="w-full bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
                  />
                </div>
              </div>

              {/* Consumption Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest pl-1">Ortalama Tüketim (lt/100 km)</label>
                <div className="relative group">
                  <input
                    type="number"
                    value={consumption}
                    onChange={(e) => setConsumption(e.target.value)}
                    placeholder="Örn: 6.5"
                    className="w-full bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
                  />
                </div>
              </div>

              {/* Price Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest pl-1">Yakıt Fiyatı (TL/litre)</label>
                <div className="relative group">
                  <input
                    type="number"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    placeholder="Örn: 44.50"
                    className="w-full bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
                  />
                </div>
              </div>

              {/* Result Area */}
              <div className="pt-8 border-t border-[#1f2937] mt-4">
                <div className={cn(
                  "p-8 rounded-[32px] transition-all duration-500",
                  totalCost !== null ? "bg-[#10a37f]/10 border border-[#10a37f]/20 scale-100" : "bg-[#020617] border border-[#1f2937] opacity-40 scale-[0.98]"
                )}>
                  <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] mb-4 text-center">Toplam Tahmini Maliyet</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-2xl font-bold text-[#9ca3af]/40">₺</span>
                    <h4 className={cn(
                      "text-5xl font-black tracking-tighter transition-colors",
                      totalCost !== null ? "text-white" : "text-[#9ca3af]"
                    )}>
                      {totalCost !== null ? totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0,00"}
                    </h4>
                  </div>
                  
                  {totalCost !== null && (
                    <div className="mt-6 flex flex-col items-center gap-3">
                      <div className="px-4 py-1.5 bg-[#10a37f]/20 rounded-full border border-[#10a37f]/30">
                        <p className="text-[9px] font-bold text-[#10a37f] uppercase tracking-widest">Hesaplandı</p>
                      </div>
                      <p className="text-[10px] text-[#9ca3af] font-medium text-center px-4">
                        {(parseFloat(distance) / 100 * parseFloat(consumption)).toFixed(1)} litre yakıt harcanacak.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto p-8 pt-0">
               <div className="p-5 bg-[#020617] rounded-3xl border border-[#1f2937] flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1f2937] flex items-center justify-center text-[#9ca3af] shrink-0">
                    <Info size={14} />
                  </div>
                  <p className="text-[10px] text-[#9ca3af] leading-relaxed font-medium">
                    Hesaplamalar girilen verilere dayalı tahminidir. Yol ve sürüş koşullarına göre değişiklik gösterebilir.
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
