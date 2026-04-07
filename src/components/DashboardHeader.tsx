"use client";

import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Bell, User, Search } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function DashboardHeader({ title, subtitle, showSearch = true }: DashboardHeaderProps) {
  const currentTime = new Date();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#1f2937] mb-10">
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-[#10a37f] uppercase tracking-[0.1em]">
            Aura AI Professional
          </span>
          <div className="w-1 h-1 rounded-full bg-[#1f2937]" />
          <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.1em]">
            {format(currentTime, "d MMMM yyyy", { locale: tr })}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-[#e5e7eb] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[#9ca3af] text-sm font-medium tracking-tight">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="hidden lg:flex items-center gap-3 bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-2 text-[#9ca3af] focus-within:border-[#10a37f]/40 transition-all group">
            <Search size={16} className="group-focus-within:text-[#10a37f] transition-colors" />
            <input 
              type="text" 
              placeholder="Hızlı arama..." 
              className="bg-transparent border-none text-xs font-medium text-[#e5e7eb] placeholder-[#9ca3af]/30 focus:outline-none w-40"
            />
          </div>
        )}
        
        <div className="flex items-center gap-3 bg-[#111827] p-1.5 rounded-xl border border-[#1f2937]">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors relative group">
            <Bell size={18} />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#10a37f] rounded-full" />
          </button>
          
          <div className="w-px h-5 bg-[#1f2937] mx-1" />
          
          <button className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-[#1f2937] rounded-lg transition-all group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10a37f] to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              <User size={16} />
            </div>
            <span className="text-xs font-bold text-[#e5e7eb] hidden sm:inline-block">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
