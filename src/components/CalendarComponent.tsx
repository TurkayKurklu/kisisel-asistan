"use client";

import React, { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarComponentProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

export default function CalendarComponent({ onDateSelect, selectedDate }: CalendarComponentProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div className="glass-panel p-5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-sm font-bold text-white/90 uppercase tracking-[0.2em]">
          {format(currentMonth, "MMMM yyyy", { locale: tr })}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth} 
            className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-all border border-transparent hover:border-white/10"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={nextMonth} 
            className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-all border border-transparent hover:border-white/10"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[9px] uppercase font-black text-white/20 tracking-tighter py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const today = isToday(day);

          return (
            <button
              key={i}
              onClick={() => onDateSelect(day)}
              className={cn(
                "h-9 rounded-xl flex flex-col items-center justify-center text-xs transition-all relative group/day",
                isSelected 
                  ? "bg-primary text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] z-10 scale-105" 
                  : isCurrentMonth ? "text-white/70 hover:bg-white/5" : "text-white/10",
                today && !isSelected && "text-primary font-black border border-primary/20 bg-primary/5"
              )}
            >
              <span>{format(day, "d")}</span>
              {today && (
                <span className={cn(
                  "absolute bottom-1 w-1 h-1 rounded-full",
                  isSelected ? "bg-white" : "bg-primary"
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
