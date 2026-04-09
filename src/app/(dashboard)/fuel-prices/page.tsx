"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Fuel, 
  MapPin, 
  RefreshCw, 
  AlertCircle,
  Navigation,
  Info,
  Calculator,
  TrendingUp,
  LineChart as ChartIcon,
  ChevronRight
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
import DashboardHeader from "@/components/DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function FuelPricesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculator State
  const [distance, setDistance] = useState<string>("");
  const [consumption, setConsumption] = useState<string>("");
  const [calculationResult, setCalculationResult] = useState<number | null>(null);

  const fetchFuelPrice = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/fuel/izmir");
      const result = await response.json();
      
      setData(result);
      if (result.isFallback) {
        toast.info("Test verisi kullanılıyor.");
      }
    } catch (err: any) {
      setError("Fiyat bilgisi çekilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelPrice();
  }, []);

  // Calculation Logic
  useEffect(() => {
    const dist = parseFloat(distance);
    const cons = parseFloat(consumption);
    const price = data?.price || 30.5;

    if (!isNaN(dist) && !isNaN(cons)) {
      setCalculationResult((dist / 100) * cons * price);
    } else {
      setCalculationResult(null);
    }
  }, [distance, consumption, data]);

  // Simulated 7-day trend data
  const trendData = useMemo(() => {
    const basePrice = data?.price || 30.5;
    return [
      { day: "03.04", price: basePrice - 0.45 },
      { day: "04.04", price: basePrice - 0.20 },
      { day: "05.04", price: basePrice - 0.15 },
      { day: "06.04", price: basePrice + 0.10 },
      { day: "07.04", price: basePrice + 0.05 },
      { day: "08.04", price: basePrice - 0.10 },
      { day: "Bugün", price: basePrice },
    ];
  }, [data]);

  return (
    <div className="space-y-10 animate-chat-fade pb-32">
      <DashboardHeader 
        title="Yakıt / Dizel Fiyatı" 
        subtitle="İzmir ili güncel piyasa analizi ve maliyet hesaplayıcı."
        showSearch={false}
      />

      <div className="max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#1f2937] border-t-[#10a37f] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Fuel size={28} className="text-[#10a37f]/40" />
                </div>
              </div>
              <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-[0.3em] animate-pulse">Piyasalar Sorgulanıyor...</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column - Main Info & Chart */}
              <div className="lg:col-span-8 space-y-8">
                {/* Main Price Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#111827] border border-[#1f2937] p-10 rounded-[40px] relative overflow-hidden group shadow-2xl"
                >
                  <div className="absolute -right-12 -top-12 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Fuel size={280} />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="space-y-8">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-[20px] flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                          <Navigation size={32} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white tracking-tight">İzmir / Merkez</h2>
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin size={14} className="text-[#10a37f]" />
                            <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-[0.2em]">Pompa Fiyatı</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pl-2">
                        <p className="text-[10px] font-bold text-[#9ca3af]/30 uppercase tracking-[0.4em]">Ürün Grubu</p>
                        <p className="text-2xl font-bold text-white tracking-tight leading-none uppercase">{data.productName}</p>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xs font-bold text-[#10a37f] uppercase tracking-[0.4em] mb-4">Litre Başına (TL)</p>
                      <div className="flex items-baseline md:justify-end gap-3">
                        <span className="text-4xl font-bold text-[#9ca3af]/20">₺</span>
                        <h4 className="text-9xl font-black text-white tracking-tighter leading-none">
                          {data.price.toFixed(2).replace('.', ',')}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="mt-14 pt-10 border-t border-[#1f2937]/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-[#9ca3af]">
                      <RefreshCw size={14} className={cn("opacity-40", loading && "animate-spin")} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                        {data.isFallback ? "Veri Hatası - Standart Değer" : `Güncelleme: ${new Date(data.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                    </div>
                    <button 
                      onClick={fetchFuelPrice}
                      className="w-full sm:w-auto px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white text-[10px] font-bold rounded-2xl transition-all border border-[#1f2937] uppercase tracking-widest"
                    >
                      Şimdi Güncelle
                    </button>
                  </div>
                </motion.div>

                {/* Trend Chart */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#111827] border border-[#1f2937] rounded-[40px] p-10 min-h-[400px] flex flex-col"
                >
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <ChartIcon size={20} className="text-[#10a37f]" /> Değişim Trendi
                      </h3>
                      <p className="text-sm text-[#9ca3af] mt-1 font-medium opacity-60">Son 7 günlük fiyat hareketi analizi.</p>
                    </div>
                  </div>

                  <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10a37f" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10a37f" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} opacity={0.5} />
                        <XAxis 
                          dataKey="day" 
                          stroke="#4b5563" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          dy={15}
                        />
                        <YAxis 
                          stroke="#4b5563" 
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
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: '#fff',
                            fontWeight: 'bold',
                            borderWidth: '1px'
                          }}
                          itemStyle={{ color: '#10a37f' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#10a37f" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorPrice)" 
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Calculator */}
              <div className="lg:col-span-4 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#111827] border border-[#1f2937] rounded-[40px] overflow-hidden shadow-2xl"
                >
                  <div className="p-10 border-b border-[#1f2937] bg-[#111827]/30">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1f2937] flex items-center justify-center text-[#10a37f] border border-[#1f2937]">
                        <Calculator size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Hesaplayıcı</h3>
                    </div>
                    <p className="text-xs text-[#9ca3af] font-medium leading-relaxed opacity-60">
                      Yolculuk maliyetinizi güncel fiyatlarla hesaplayın.
                    </p>
                  </div>

                  <div className="p-10 space-y-10">
                    {/* Distance Input */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.3em]">Mesafe</label>
                        <span className="text-[10px] font-bold text-[#10a37f] uppercase">Km</span>
                      </div>
                      <input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        placeholder="Örn: 450"
                        className="w-full bg-[#020617] border border-[#1f2937] rounded-3xl px-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/10"
                      />
                    </div>

                    {/* Consumption Input */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.3em]">Ortalama Tüketim</label>
                        <span className="text-[10px] font-bold text-[#10a37f] uppercase">Lt / 100 Km</span>
                      </div>
                      <input
                        type="number"
                        value={consumption}
                        onChange={(e) => setConsumption(e.target.value)}
                        placeholder="Örn: 6.5"
                        className="w-full bg-[#020617] border border-[#1f2937] rounded-3xl px-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/10"
                      />
                    </div>

                    {/* Total Area */}
                    <div className="pt-10 border-t border-[#1f2937] mt-4">
                      <div className={cn(
                        "p-10 rounded-[36px] transition-all duration-700 relative overflow-hidden",
                        calculationResult !== null 
                          ? "bg-emerald-500/10 border border-emerald-500/20 scale-100 shadow-xl shadow-emerald-500/5" 
                          : "bg-[#020617] border border-[#1f2937] opacity-20 scale-[0.98]"
                      )}>
                        <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.4em] mb-6 text-center">Tahmini Maliyet</p>
                        <div className="flex items-baseline justify-center gap-3">
                          <span className="text-3xl font-bold text-[#9ca3af]/30">₺</span>
                          <h4 className={cn(
                            "text-6xl font-black tracking-tighter transition-colors",
                            calculationResult !== null ? "text-white" : "text-[#9ca3af]"
                          )}>
                            {calculationResult !== null ? calculationResult.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0,00"}
                          </h4>
                        </div>
                        
                        {calculationResult !== null && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 pt-8 border-t border-emerald-500/20 text-center"
                          >
                             <div className="flex items-center justify-center gap-2 mb-2">
                               <TrendingUp size={12} className="text-emerald-500" />
                               <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Başarıyla Hesaplandı</span>
                             </div>
                             <p className="text-[10px] text-[#9ca3af] font-medium leading-relaxed px-4">
                               Bu yolculuk için ortalama {(parseFloat(distance) / 100 * parseFloat(consumption)).toFixed(1)} litre yakıt sarf edilecek.
                             </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Help Info */}
                  <div className="p-10 pt-0">
                    <div className="p-6 bg-[#020617]/50 rounded-[32px] border border-[#1f2937] flex items-start gap-4">
                      <AlertCircle size={16} className="text-[#9ca3af] shrink-0 mt-0.5" />
                      <p className="text-[9px] text-[#9ca3af] leading-relaxed font-medium uppercase tracking-widest">
                        Değerler mevcut {(data?.productName || "motorin").toLowerCase()} fiyatı üzerinden hesaplanmaktadır.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
