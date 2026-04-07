"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet, 
  StickyNote, 
  CheckSquare,
  Sparkles,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "calendar", label: "Takvim", icon: Calendar, href: "/calendar" },
  { id: "finance", label: "Maliye", icon: Wallet, href: "/finance" },
  { id: "notes", label: "Notlar", icon: StickyNote, href: "/notes" },
  { id: "tasks", label: "Görevler", icon: CheckSquare, href: "/tasks" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-[#020617] border-r border-[#1f2937] fixed left-0 top-0 z-50 transition-all duration-300">
      <div className="p-6 pb-10 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#10a37f] rounded-lg flex items-center justify-center text-white">
          <Sparkles size={18} />
        </div>
        <span className="text-lg font-bold tracking-tight text-[#e5e7eb]">Aura Assistant</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname === `/(dashboard)${item.href}`;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-[#1f2937] text-white shadow-sm" 
                  : "text-[#9ca3af] hover:bg-[#111827] hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={cn("transition-colors", isActive ? "text-[#10a37f]" : "group-hover:text-white")} />
                <span>{item.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#10a37f]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-[#1f2937]">
        <div className="p-4 bg-[#111827] rounded-xl border border-[#1f2937] group hover:border-[#10a37f]/30 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10a37f] to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#e5e7eb] truncate">Aura AI v4</p>
              <p className="text-[10px] text-[#9ca3af] truncate">Professional Mode</p>
            </div>
            <ChevronRight size={14} className="text-[#9ca3af]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
