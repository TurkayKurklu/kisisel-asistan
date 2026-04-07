"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Zap, 
  CheckCircle2, 
  Search, 
  TrendingUp, 
  Award,
  Calendar as CalendarIcon,
  Check,
  MoreVertical,
  Trash2,
  Trophy
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { getHabits, completeHabit, deleteHabit } from "@/app/actions/habits";
import { cn } from "@/lib/utils";
import HabitForm from "@/components/HabitForm";
import DashboardHeader from "@/components/DashboardHeader";

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const data = await getHabits();
    setHabits(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleComplete = async (id: string) => {
    await completeHabit(id);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu alışkanlığı silmek istediğinize emin misiniz?")) {
      await deleteHabit(id);
      fetchData();
    }
  };

  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);

  return (
    <div className="space-y-10">
      <DashboardHeader 
        title="Alışkanlık Takibi" 
        subtitle="Günlük disiplininizi artırın ve serilerinizi koruyun."
        showSearch={false}
      />

      {/* Stats Summary Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard 
          icon={Zap} 
          label="Toplam Seri" 
          value={totalStreaks} 
          subValue="Tüm alışkanlıklar"
          color="amber"
        />
        <StatsCard 
          icon={Award} 
          label="Aktif Hedef" 
          value={habits.length} 
          subValue="Takip ediliyor"
          color="emerald"
        />
        <StatsCard 
          icon={Trophy} 
          label="Başarı Oranı" 
          value={`${Math.round((habits.filter(h => h.streak > 0).length / (habits.length || 1)) * 100)}%`} 
          subValue="Haftalık verim"
          color="primary"
        />
      </section>

      {/* Habits List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
               <CalendarIcon size={20} />
             </div>
             <h3 className="text-xl font-black text-white tracking-tight">Günlük Kontrol</h3>
          </div>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest px-4 py-2 border border-white/5 rounded-full">
            Bugün: {format(new Date(), "d MMMM", { locale: tr })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-[2.5rem] animate-pulse" />)
          ) : habits.length === 0 ? (
            <div className="md:col-span-2 p-20 glass-panel border-dashed border-white/10 rounded-[3rem] text-center flex flex-col items-center gap-6">
               <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                 <Zap size={40} />
               </div>
               <p className="text-white/30 font-medium">Henüz bir alışkanlık hedefi koymamışsın.</p>
            </div>
          ) : (
            habits.map((habit, i) => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onComplete={() => handleComplete(habit.id)} 
                onDelete={() => handleDelete(habit.id)}
                index={i}
              />
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      <HabitForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}

function HabitCard({ habit, onComplete, onDelete, index }: any) {
  const isCompletedToday = habit.lastCompletedDate && isSameDay(new Date(habit.lastCompletedDate), new Date());
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group h-40 glass-panel rounded-[2.5rem] border-white/5 flex items-center justify-between p-8 hover:bg-white/[0.06] transition-all relative overflow-hidden",
        isCompletedToday && "bg-emerald-500/[0.02] border-emerald-500/10"
      )}
    >
      <div className="flex items-center gap-6 relative z-10">
        <div className={cn(
          "w-16 h-16 rounded-[2rem] flex items-center justify-center border-2 transition-all relative overflow-hidden",
          isCompletedToday 
            ? "bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20" 
            : "bg-white/5 border-white/5 text-white/20 hover:border-emerald-500/30 hover:text-white/60"
        )}>
          {isCompletedToday ? (
            <Check size={32} strokeWidth={4} className="relative z-10" />
          ) : (
            <button onClick={onComplete} className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={32} strokeWidth={2} />
            </button>
          )}
        </div>
        
        <div className="space-y-1">
          <h4 className={cn("text-xl font-black text-white tracking-tight leading-none", isCompletedToday && "opacity-60")}>
            {habit.title}
          </h4>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <Zap size={12} className={cn("text-white/20", habit.streak > 0 && "text-amber-400")} />
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{habit.streak} Günlük Seri</span>
             </div>
             {isCompletedToday && (
               <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tight">Tamamlandı</span>
             )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-end gap-4 h-full py-2">
         <button 
           onClick={onDelete}
           className="p-1 text-white/5 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
         >
           <Trash2 size={16} />
         </button>
         <div className="mt-auto h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/10 group-hover:bg-primary/20 group-hover:text-primary transition-all">
           <TrendingUp size={24} />
         </div>
      </div>

      {/* Background Decor */}
      <div className={cn(
        "absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[80px] pointer-events-none transition-colors",
        isCompletedToday ? "bg-emerald-500/10" : "bg-primary/5"
      )} />
    </motion.div>
  );
}

function StatsCard({ icon: Icon, label, value, subValue, color }: any) {
  const colors: any = {
    primary: "text-primary bg-primary/10",
    emerald: "text-emerald-400 bg-emerald-400/10",
    amber: "text-amber-400 bg-amber-400/10"
  };
  return (
    <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 space-y-4 hover:bg-white/[0.06] transition-all">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", colors[color])}>
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-tight">{subValue}</p>
      </div>
    </div>
  );
}
