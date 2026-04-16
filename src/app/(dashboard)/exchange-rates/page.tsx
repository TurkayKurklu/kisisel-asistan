"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Euro, 
  RefreshCw,
  LineChart as ChartIcon,
  ArrowRightLeft,
  Fuel,
  Info
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import DashboardHeader from "@/components/DashboardHeader";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getLatestRates, getExchangeHistory } from "@/app/actions/exchange";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fuel Calculator State
  const [distance, setDistance] = useState<string>("");
  const [consumption, setConsumption] = useState<string>("");
  const [fuelPrice, setFuelPrice] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number | null>(null);

  const fetchExchangeData = async () => {
    setIsLoading(true);
    try {
      const [rateRes, historyRes] = await Promise.all([
        getLatestRates(),
        getExchangeHistory()
      ]);

      if (rateRes.success) {
        setRates(rateRes);
        setLastUpdated(rateRes.date);
      }
      
      if (historyRes.success) {
        setHistory(historyRes.history);
      }
    } catch (error) {
      toast.error("Veriler alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeData();
  }, []);

  // Fuel Calculation logic
  useEffect(() => {
    const dist = parseFloat(distance);
    const cons = parseFloat(consumption);
    const price = parseFloat(fuelPrice);

    if (!isNaN(dist) && !isNaN(cons) && !isNaN(price)) {
      setTotalCost((dist / 100) * cons * price);
    } else {
      setTotalCost(null);
    }
  }, [distance, consumption, fuelPrice]);

  return (
    <div className="space-y-10 animate-chat-fade pb-32">
      <DashboardHeader 
        title="Döviz Kurları" 
        subtitle="Anlık piyasa verileri ve yakıt hesaplama aracı."
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
              className="bg-[#111827] border border-[#1f2937] p-8 rounded-[32px] relative overflow-hidden group"
            >
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <DollarSign size={180} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">ABD Doları</h3>
                    <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.2em]">USD / TRY</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#9ca3af]/30">₺</span>
                  <h2 className="text-6xl font-black tracking-tighter text-[#e5e7eb]">
                    {rates?.USD ? rates.USD.toFixed(3).replace('.', ',') : '---'}
                  </h2>
                </div>
                
                <div className="mt-8 pt-6 border-t border-[#1f2937]/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold font-mono">+1.05%</span>
                  </div>
                  <button 
                    onClick={fetchExchangeData}
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
              className="bg-[#111827] border border-[#1f2937] p-8 rounded-[32px] relative overflow-hidden group"
            >
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Euro size={180} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Euro size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Euro</h3>
                    <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.2em]">EUR / TRY</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#9ca3af]/30">₺</span>
                  <h2 className="text-6xl font-black tracking-tighter text-[#e5e7eb]">
                    {rates?.EUR ? rates.EUR.toFixed(3).replace('.', ',') : '---'}
                  </h2>
                </div>

                 <div className="mt-8 pt-6 border-t border-[#1f2937]/50 flex flex-col gap-3">
                   <div className="flex items-center justify-between text-[#9ca3af]">
                     <div className="flex items-center gap-2">
                       <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                        lastUpdated === new Date().toISOString().split('T')[0] ? "bg-emerald-500" : "bg-amber-500")} 
                       />
                       <span className="text-[10px] font-bold uppercase tracking-widest">
                         {lastUpdated === new Date().toISOString().split('T')[0] ? 'Güncel Veri' : 'Dünkü Veri'}
                       </span>
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-widest">
                       {lastUpdated ? format(new Date(lastUpdated), "d MMMM yyyy", { locale: tr }) : 'Yükleniyor...'}
                     </span>
                   </div>
                   {lastUpdated !== new Date().toISOString().split('T')[0] && (
                     <div className="flex items-center gap-2 text-amber-500/60 bg-amber-500/5 px-3 py-2 rounded-lg border border-amber-500/10">
                       <Info size={12} />
                       <p className="text-[9px] font-bold leading-none">Piyasalar henüz güncellenmedi, dünkü kapanış verileri gösteriliyor.</p>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chart Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111827] border border-[#1f2937] rounded-[32px] p-8 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <ChartIcon size={20} className="text-[#10a37f]" /> Piyasa Takibi
                </h3>
                <p className="text-sm text-[#9ca3af] mt-1">Son 7 günlük USD ve EUR değişimleri (₺ bazlı).</p>
              </div>
              <div className="flex items-center gap-6 bg-[#020617] px-5 py-3 rounded-2xl border border-[#1f2937]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10a37f] shadow-[0_0_10px_rgba(16,163,127,0.4)]" />
                  <span className="text-[10px] font-bold text-[#e5e7eb] uppercase tracking-widest">USD</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                  <span className="text-[10px] font-bold text-[#e5e7eb] uppercase tracking-widest">EUR</span>
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full min-h-[350px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10a37f" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10a37f" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#4b5563" 
                    fontSize={11} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false}
                    dy={15}
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={11} 
                    fontWeight={600}
                    tickLine={false} 
                    axisLine={false} 
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    dx={-10}
                    tickFormatter={(val) => `₺${val.toFixed(2)}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#020617', 
                      borderColor: '#1f2937', 
                      borderRadius: '20px',
                      fontSize: '12px',
                      color: '#fff',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ padding: '4px 0', fontSize: '13px', fontWeight: 'bold' }}
                    cursor={{ stroke: '#1f2937', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="USD" 
                    stroke="#10a37f" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorUsd)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10a37f' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="EUR" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorEur)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Fuel Calculator Section (RESTORED) */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#111827] border border-[#1f2937] rounded-[32px] overflow-hidden"
          >
            <div className="p-8 border-b border-[#1f2937]">
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

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest pl-1">Mesafe (km)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Örn: 500"
                  className="w-full bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest pl-1">Tüketim (lt/100 km)</label>
                <input
                  type="number"
                  value={consumption}
                  onChange={(e) => setConsumption(e.target.value)}
                  placeholder="Örn: 7.0"
                  className="w-full bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest pl-1">Birim Fiyat (TL/lt)</label>
                <input
                  type="number"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  placeholder="Örn: 42.50"
                  className="w-full bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
                />
              </div>

              <div className="pt-6 border-t border-[#1f2937] mt-4">
                <div className={cn(
                  "p-8 rounded-[32px] transition-all text-center",
                  totalCost !== null ? "bg-[#10a37f]/10 border border-[#10a37f]/20" : "bg-[#020617] border border-[#1f2937] opacity-40"
                )}>
                  <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Toplam Tutar</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-xl font-bold text-[#9ca3af]/30">₺</span>
                    <h4 className="text-4xl font-black text-white tracking-tighter">
                      {totalCost !== null ? totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0,00"}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0">
               <div className="p-5 bg-[#020617] rounded-[24px] border border-[#1f2937] flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center text-[#9ca3af] shrink-0">
                    <Info size={14} />
                  </div>
                  <p className="text-[10px] text-[#9ca3af] leading-relaxed">
                    Hesaplamalar girilen verilere dayalı tahminidir. Sürüş stili ve trafik maliyeti etkileyebilir.
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
