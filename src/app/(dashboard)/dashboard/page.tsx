"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Activity,
  Sparkles,
  Clock,
  ArrowRight,
  Zap,
  ArrowRightCircle,
  Calendar,
  Wallet,
  PiggyBank,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { format, isToday } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { getDashboardData } from "@/app/actions/dashboard";
import { cn, getGreeting } from "@/lib/utils";
import TaskSheet from "@/components/TaskSheet";
import DashboardHeader from "@/components/DashboardHeader";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (error) {
      console.error("Dashboard veri çekme hatası:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const today = new Date();

  const todayItems = data ? [
    ...data.tasks.filter((t: any) => isToday(new Date(t.date))),
    ...data.events.filter((e: any) => isToday(new Date(e.date)))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Veriler Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 animate-chat-fade pb-20">
      <DashboardHeader
        title={`${getGreeting()}, Hoş Geldin`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Left Column - Balance & Savings */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-6 sm:gap-8 auto-rows-fr">
          {/* Main Balance Card */}
          <Link href="/finance" className="block group h-full">
            <div className="bg-[#111827] border border-[#1f2937] p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] relative overflow-hidden transition-all hover:border-primary/40 group shadow-2xl shadow-primary/5 h-full flex flex-col justify-between">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[80px] group-hover:bg-primary/20 transition-all rounded-full" />
              <div className="relative z-10 space-y-6 sm:space-y-10">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Wallet size={24} className="sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <div className="p-2 sm:p-3 bg-[#020617] rounded-xl text-primary md:opacity-0 md:group-hover:opacity-100 transition-all">
                    <ArrowUpRight size={18} className="sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-2 sm:mb-3">Mevcut Bakiye</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-primary/30">₺</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#e5e7eb]">
                      {data?.finance?.balance.toLocaleString() || "0"}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Savings Card */}
          <Link href="/savings" className="block group h-full">
            <div className="bg-[#111827] border border-[#1f2937] p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] relative overflow-hidden transition-all hover:border-primary/40 group shadow-lg h-full flex flex-col justify-between">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 blur-[80px] group-hover:bg-primary/10 transition-all rounded-full" />
              <div className="relative z-10 space-y-6 sm:space-y-10">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <PiggyBank size={24} className="sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-2 border border-primary/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">KUMBARA</div>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] mb-2 sm:mb-3">Birikmiş Tutar</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-primary/30">₺</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#e5e7eb]">
                      {data?.savingsBalance.toLocaleString() || "0"}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Right Column - Closest Task & Today's Plan */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Closest Task Widget */}
          <div className="bg-primary p-0.5 sm:p-1 bg-gradient-to-br from-primary via-primary to-[#0077b6] rounded-[36px] sm:rounded-[48px] shadow-2xl shadow-primary/20 group h-full min-h-[350px]">
            <div className="bg-[#111827] p-6 sm:p-10 rounded-[34px] sm:rounded-[44px] h-full flex flex-col justify-between relative overflow-hidden">
               {/* Decorative background text */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] sm:text-[140px] lg:text-[180px] font-black text-white/[0.02] pointer-events-none select-none uppercase tracking-tighter whitespace-nowrap hidden sm:block">
                {data?.nextTask?.topic || "PLAN"}
              </div>

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
                  <div className="px-3 sm:px-5 py-1.5 sm:py-2.5 bg-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">En Yakın Görev</div>
                  <div className="w-1 h-1 rounded-full bg-primary/30 hidden sm:block" />
                  <div className="text-[9px] sm:text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} className="text-primary shrink-0" />
                    {data?.nextTask ? format(new Date(data.nextTask.date), "d MMM, HH:mm", { locale: tr }) : "Plan yok"}
                  </div>
                </div>

                {data?.nextTask ? (
                  <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#f1f5f9] tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {data.nextTask.title || "Adsız Görev"}
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg text-[#94a3b8] leading-relaxed font-medium line-clamp-3 max-w-2xl opacity-80">
                      {data.nextTask.content}
                    </p>
                  </div>
                ) : (
                  <div className="py-10 text-[#94a3b8]/40 italic font-bold text-lg sm:text-xl">Şu an için yakında bir planın yok.</div>
                )}
              </div>

              {data?.nextTask && (
                <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-8 relative z-10">
                   <Link href="/tasks" className="flex items-center gap-3 py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30">
                     Detaylar <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                   </Link>
                   <div className="flex items-center gap-2 sm:gap-3">
                     <span className="text-[9px] sm:text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Öncelik:</span>
                     <span className={cn(
                       "text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-3 py-1 rounded-lg border",
                       data.nextTask.priority === "high" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                       data.nextTask.priority === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                       "bg-primary/10 text-primary border-primary/20"
                     )}>
                       {data.nextTask.priority || "Düşük"}
                     </span>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Full Width Today's Schedule */}
        <div className="lg:col-span-12">
          <section className="bg-[#111827] border border-[#1f2937] rounded-[32px] sm:rounded-[40px] overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 sm:p-8 border-b border-[#1f2937] flex flex-col sm:flex-row sm:items-center justify-between bg-[#020617]/50 gap-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                  <Calendar size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#e5e7eb] tracking-tight">Bugünün Planları</h3>
                  <p className="text-[9px] sm:text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-0.5 text-primary/60">GÜNLÜK AKIŞ</p>
                </div>
              </div>
              <div className="bg-[#020617] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-[#1f2937] text-[9px] sm:text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-center sm:text-left self-start sm:self-auto">
                {format(today, "d MMMM yyyy", { locale: tr })}
              </div>
            </div>

            <div className="flex-1 divide-y divide-[#1f2937] max-h-[400px] overflow-y-auto no-scrollbar">
              {todayItems.length === 0 ? (
                <div className="p-12 sm:p-20 text-center flex flex-col items-center gap-4 sm:gap-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#1f2937] rounded-2xl sm:rounded-3xl flex items-center justify-center text-[#94a3b8]/10">
                    <Sparkles size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-[#94a3b8]/30 uppercase tracking-widest px-6 sm:px-10">Bugün için planlanan bir etkinlik bulunmuyor.</p>
                </div>
              ) : (
                todayItems.map((item: any, i: number) => (
                  <Link
                    key={i}
                    href={item.topic ? "/tasks" : "/calendar"}
                    className="flex items-center justify-between p-5 sm:p-7 hover:bg-primary/[0.02] transition-all group"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      <div className="text-center min-w-[40px] sm:min-w-[50px]">
                        <p className="text-xs sm:text-sm font-black text-[#e5e7eb] group-hover:text-primary transition-colors">{item.time || "--:--"}</p>
                        <p className="text-[8px] sm:text-[9px] font-bold text-primary opacity-30 uppercase">SAAT</p>
                      </div>
                      <div className="w-px h-8 sm:h-10 bg-[#1f2937] group-hover:bg-primary/20 transition-colors" />
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-bold text-[#f1f5f9] group-hover:translate-x-1 transition-transform truncate">{item.title || item.content}</p>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 transition-all opacity-40 group-hover:opacity-100">
                          <span className="text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-widest">{item.topic || "ETKİNLİK"}</span>
                          {item.priority && (
                             <div className={cn(
                               "w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full",
                               item.priority === "high" ? "bg-rose-500" : "bg-primary"
                             )} />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#020617] rounded-xl sm:rounded-2xl border border-[#1f2937] flex items-center justify-center text-[#94a3b8]/20 group-hover:text-primary group-hover:border-primary/20 transition-all shrink-0 ml-4">
                       <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            {todayItems.length > 0 && (
              <div className="p-4 sm:p-6 bg-[#020617]/30 border-t border-[#1f2937] text-center">
                <Link href="/tasks" className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:tracking-[0.4em] transition-all">
                   Tüm Planları Gör
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
