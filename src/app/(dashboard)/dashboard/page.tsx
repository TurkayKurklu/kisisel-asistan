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
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { getTasks } from "@/app/actions/tasks";
import { getFinanceSummary } from "@/app/actions/finance";
import { getEvents } from "@/app/actions/events";
import { cn, getGreeting } from "@/lib/utils";
import TaskSheet from "@/components/TaskSheet";
import DashboardHeader from "@/components/DashboardHeader";
import Link from "next/link";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [taskData, financeData, eventData] = await Promise.all([
        getTasks(),
        getFinanceSummary(),
        getEvents()
      ]);
      setTasks(taskData);
      setFinance(financeData);
      setEvents(eventData);
    } catch (error) {
      console.error("Dashboard veri çekme hatası:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const todayEvents = events.filter(e => {
    const today = new Date();
    const eventDate = new Date(e.date);
    return eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear();
  });

  return (
    <div className="space-y-10 animate-chat-fade">
      <DashboardHeader
        title={`${getGreeting()}, Hoş Geldin`}
        subtitle="Bugün harika şeyler başarmaya hazır mısın?"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              label="Kalan Görevler"
              value={pendingTasks.length.toString()}
              icon={CheckCircle2}
              trend="Fokusunu koru"
              href="/tasks"
            />
            <StatCard
              label="Aylık Harcama"
              value={`₺${finance?.totalExpense.toLocaleString() || "0"}`}
              icon={Activity}
              trend="Normal seyirde"
              href="/finance"
            />
            <StatCard
              label="Etkinlikler"
              value={todayEvents.length.toString()}
              icon={Calendar}
              trend="Bugün için"
              href="/calendar"
            />
          </section>

          {/* Daily Workflow Section - ChatGPT Style List */}
          <section className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#1f2937] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10a37f]/10 flex items-center justify-center text-[#10a37f]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#e5e7eb]">Günlük Akış</h3>
                  <p className="text-[11px] text-[#9ca3af] font-medium">Bütünsel iş akışınız ve etkinlikler</p>
                </div>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-bold text-[#10a37f] hover:underline flex items-center gap-1.5"
              >
                Tümünü Gör <ArrowRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-[#1f2937]">
              {[...pendingTasks.slice(0, 4), ...todayEvents.slice(0, 2)].length === 0 ? (
                <div className="p-12 text-center text-[#9ca3af]/40 italic text-sm">
                  Henüz bir aktivite planlanmadı.
                </div>
              ) : (
                [...pendingTasks.slice(0, 4), ...todayEvents.slice(0, 2)].map((item, i) => (
                  <Link 
                    key={i}
                    href={item.amount !== undefined ? "/finance" : (item.topic ? "/tasks" : "/calendar")}
                    className="flex items-center justify-between p-5 hover:bg-[#1f2937]/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center bg-[#1f2937] border border-[#1f2937]",
                        item.amount !== undefined ? "text-rose-400" : "text-[#10a37f]"
                      )}>
                        {item.time ? <Clock size={18} /> : (item.amount !== undefined ? <Activity size={18} /> : <CheckCircle2 size={18} />)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#e5e7eb] group-hover:text-white transition-colors">{item.title || item.content}</p>
                        <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-wider mt-0.5 opacity-60">
                          {item.time || "Tüm Gün"} • {item.amount !== undefined ? "İşlem" : (item.topic || "Etkinlik")}
                        </p>
                      </div>
                    </div>
                    <ArrowRightCircle size={18} className="text-[#9ca3af]/20 group-hover:text-[#10a37f] transition-all" />
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Finance Glance - ChatGPT Professional Look */}
          <Link href="/finance" className="block group">
            <section className="bg-[#111827] border border-[#1f2937] p-8 rounded-2xl flex flex-col justify-between h-full group-hover:border-[#10a37f]/30 transition-all">
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-[#1f2937] flex items-center justify-center text-[#10a37f] border border-[#1f2937]">
                    <Activity size={20} />
                  </div>
                  <div className="p-2.5 bg-[#1f2937] rounded-lg group-hover:bg-[#10a37f]/20 transition-all text-[#9ca3af] group-hover:text-[#10a37f]">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] mb-2">Mevcut Bakiye</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[#9ca3af]/30">₺</span>
                      <h2 className="text-4xl font-bold tracking-tight text-[#e5e7eb]">
                        {finance ? finance.balance.toLocaleString() : "0"}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[#1f2937]">
                    <div>
                      <p className="text-[9px] font-bold text-[#9ca3af] uppercase mb-1">Gelir</p>
                      <p className="text-sm font-bold text-emerald-500">₺{finance?.totalIncome ? (finance.totalIncome / 1000).toFixed(1) : "0"}k</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#9ca3af] uppercase mb-1">Gider</p>
                      <p className="text-sm font-bold text-rose-400">₺{finance?.totalExpense ? (finance.totalExpense / 1000).toFixed(1) : "0"}k</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full py-4 bg-[#10a37f] group-hover:bg-[#10a37f]/90 text-white font-bold rounded-xl text-xs uppercase tracking-widest mt-10 transition-all shadow-lg shadow-[#10a37f]/20 flex items-center justify-center gap-2">
                Maliye Detayları <ChevronRight size={14} />
              </div>
            </section>
          </Link>
        </div>
      </div>

      <TaskSheet
        isOpen={isTaskSheetOpen}
        onClose={() => setIsTaskSheetOpen(false)}
        selectedDate={new Date()}
        onSuccess={fetchData}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, href }: any) {
  const CardContent = (
    <div className="bg-[#111827] border border-[#1f2937] p-7 rounded-2xl hover:border-[#10a37f]/30 transition-all group h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="w-11 h-11 rounded-lg bg-[#1f2937] flex items-center justify-center text-[#9ca3af] group-hover:text-[#10a37f] transition-colors border border-[#1f2937]">
          <Icon size={20} />
        </div>
        <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase rounded-md border border-emerald-500/20">
          Özet
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em] mb-1">{label}</p>
        <h3 className="text-3xl font-bold tracking-tight text-[#e5e7eb]">{value}</h3>
        <p className="text-[10px] text-[#9ca3af] mt-4 font-bold uppercase opacity-40">{trend}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block cursor-pointer">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);
