"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet, 
  StickyNote, 
  CheckSquare,
  TrendingUp,
  PiggyBank
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
  { id: "savings", label: "Kumbara", icon: PiggyBank, href: "/savings" },
  { id: "exchange-rates", label: "Kurlar", icon: TrendingUp, href: "/exchange-rates" },
];

interface BottomNavProps {
  onMenuClick?: () => void;
}

export default function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50">
      <div className="flex items-center justify-around p-2 bg-[#020617]/90 backdrop-blur-xl border border-[#1f2937] rounded-2xl shadow-2xl">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname === `/(dashboard)${item.href}`;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300",
                isActive ? "text-[#10a37f]" : "text-[#9ca3af] hover:text-white"
              )}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                className={cn("transition-transform duration-300", isActive && "scale-110")} 
              />
              <span className={cn("text-[9px] font-bold tracking-tight px-1", !isActive && "hidden")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
