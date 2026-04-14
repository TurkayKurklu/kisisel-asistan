"use client";

import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  StickyNote,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  PiggyBank
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "calendar", label: "Takvim", icon: Calendar, href: "/calendar" },
  { id: "finance", label: "Maliye", icon: Wallet, href: "/finance" },
  { id: "notes", label: "Notlar", icon: StickyNote, href: "/notes" },
  { id: "tasks", label: "Görevler", icon: CheckSquare, href: "/tasks" },
  { id: "savings", label: "Kumbara", icon: PiggyBank, href: "/savings" },
  { id: "exchange-rates", label: "Döviz Kurları", icon: TrendingUp, href: "/exchange-rates" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { data: session } = useSession();

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col h-screen bg-[#020617] border-r border-[#1f2937] fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("p-6 flex items-center gap-3", isCollapsed && "justify-center px-0")}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
          <img src="/asistan-ana.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold tracking-tight text-[#e5e7eb] whitespace-nowrap overflow-hidden">
            Kişisel Asistan
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname === `/(dashboard)${item.href}`;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-[#1f2937] text-white shadow-sm"
                  : "text-[#9ca3af] hover:bg-[#111827] hover:text-white",
                isCollapsed && "justify-center px-0"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={cn("transition-colors shrink-0", isActive ? "text-[#10a37f]" : "group-hover:text-white")} />
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
              </div>
              
              {!isCollapsed && isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#10a37f]" />}
              
              {isCollapsed && isActive && (
                <div className="absolute left-0 w-1 h-6 bg-[#10a37f] rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#1f2937] px-3 py-4 space-y-2">
        <div className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-xl bg-[#111827]/50 border border-[#1f2937]/50 mb-2",
          isCollapsed && "justify-center px-0"
        )}>
           <div className="w-8 h-8 rounded-lg bg-[#1f2937] flex items-center justify-center text-[#10a37f] shrink-0 border border-[#10a37f]/20">
              <UserIcon size={16} />
           </div>
           {!isCollapsed && (
             <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[#e5e7eb] truncate">
                  {session?.user?.name || session?.user?.email || "Kullanıcı"}
                </p>
                <p className="text-[9px] font-medium text-[#9ca3af] truncate opacity-60 capitalize">
                  {session?.user?.id?.slice(0, 8)}...
                </p>
             </div>
           )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-500 transition-all group",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span>Çıkış Yap</span>}
        </button>

        <div className="flex justify-center pt-2">
          <button 
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-xl bg-[#111827] border border-[#1f2937] flex items-center justify-center text-[#9ca3af] hover:text-white hover:border-[#10a37f]/30 transition-all"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
