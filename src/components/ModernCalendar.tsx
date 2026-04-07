"use client";

import React, { useRef, useEffect } from "react";
import { format, addDays, startOfToday, isSameDay, startOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ModernCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  tasks?: any[];
}

export default function ModernCalendar({ selectedDate, onDateSelect, tasks = [] }: ModernCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = startOfToday();
  
  // Generate 21 days (3 weeks)
  const startDate = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 21 }, (_, i) => addDays(startDate, i));

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, []);

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Scrollable Days Area */}
      <div className="relative group/calendar">
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-4 no-scrollbar scroll-smooth snap-x px-4"
        >
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isSameDay(day, today);
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.date), day));

            return (
              <motion.button
                key={day.toISOString()}
                data-selected={isSelected}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "flex-shrink-0 w-[72px] h-[100px] rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all snap-center relative",
                  isSelected 
                    ? "bg-white text-black shadow-[0_20px_50px_rgba(255,255,255,0.3)] z-10 scale-110" 
                    : "glass-panel bg-white/[0.02] border-white/5 opacity-40 hover:opacity-100"
                )}
              >
                <span className={cn(
                  "text-[10px] uppercase font-black tracking-widest",
                  isSelected ? "text-black/40" : "text-white/20"
                )}>
                  {format(day, "EEE", { locale: tr })}
                </span>
                <span className="text-3xl font-black tracking-tighter">
                  {format(day, "d")}
                </span>
                
                {/* Premium Indicator for Tasks */}
                {dayTasks.length > 0 && (
                  <div className={cn(
                    "absolute -bottom-1 w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-black" : "bg-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  )} />
                )}

                {isTodayDate && !isSelected && (
                  <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </motion.button>
            );
          })}
        </div>
        
        {/* Scroll indicator fades */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a0b] to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0a0b] to-transparent pointer-events-none z-20" />
      </div>

      {/* Premium Bottom Navigation Controls */}
      <div className="flex items-center justify-center gap-8 self-center px-8 py-4 rounded-[2.5rem] glass-panel bg-white/[0.03] border border-white/10 shadow-2xl relative overflow-hidden group/controls">
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll("left")}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all bg-white/5 border border-white/10 hover:border-primary/50"
        >
          <ChevronLeft size={24} />
        </motion.button>

        <div className="flex flex-col items-center min-w-[140px] relative z-10">
          <span className="text-[16px] font-black text-white tracking-[0.1em] uppercase">
            {format(selectedDate, "EEEE", { locale: tr })}
          </span>
          <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] opacity-100 flex items-center gap-2 mt-1">
             <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
             {format(selectedDate, "d MMMM", { locale: tr })}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll("right")}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all bg-white/5 border border-white/10 hover:border-primary/50"
        >
          <ChevronRight size={24} />
        </motion.button>
        
        {/* Subtle internal glow for controls */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </div>
  );
}
