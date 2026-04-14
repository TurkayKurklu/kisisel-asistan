"use client";

import React from "react";
import { 
  X, 
  LayoutDashboard, 
  Calendar, 
  Wallet, 
  StickyNote, 
  CheckSquare,
  Sparkles,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Portal from "./Portal";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";

// Fix for icon library name in previous turn
import { LayoutDashboard as Dash, Calendar as Cal, Wallet as Wal, StickyNote as Note, CheckSquare as Check, Sparkles as Spark, ChevronRight as Right, X as Close, TrendingUp as Trend } from "lucide-react";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Dash, href: "/dashboard" },
  { id: "calendar", label: "Takvim", icon: Cal, href: "/calendar" },
  { id: "finance", label: "Maliye", icon: Wal, href: "/finance" },
  { id: "notes", label: "Notlar", icon: Note, href: "/notes" },
  { id: "tasks", label: "Görevler", icon: Check, href: "/tasks" },
  { id: "exchange-rates", label: "Döviz Kurları", icon: Trend, href: "/exchange-rates" },
];

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 w-[85%] h-full bg-[#020617] border-r border-[#1f2937] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <img src="/asistan-ana.png" alt="Logo" className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-[#e5e7eb]">Kişisel Asistan</span>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-[#1f2937] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
                >
                  <Close size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                <p className="px-4 text-[10px] font-bold text-[#9ca3af]/40 uppercase tracking-[0.2em] mb-4">Ana Menü</p>
                {MENU_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname === `/(dashboard)${item.href}`;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between px-5 py-4 rounded-xl text-sm font-bold transition-all",
                        isActive 
                          ? "bg-[#1f2937] text-white border border-[#1f2937] shadow-sm" 
                          : "text-[#9ca3af] hover:bg-[#111827] hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon size={18} className={cn("transition-colors", isActive ? "text-[#10a37f]" : "text-[#9ca3af]/40")} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <Right size={14} className="text-[#10a37f]" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-[#1f2937] space-y-4">
                <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-[#111827] border border-[#1f2937]">
                   <div className="w-10 h-10 rounded-xl bg-[#1f2937] flex items-center justify-center text-[#10a37f] border border-[#10a37f]/20">
                      <UserIcon size={20} />
                   </div>
                   <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#e5e7eb] truncate">
                        {session?.user?.name || session?.user?.email || "Kullanıcı"}
                      </p>
                      <p className="text-[10px] font-medium text-[#9ca3af] truncate opacity-50">
                        {session?.user?.id?.slice(0, 12)}...
                      </p>
                   </div>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold text-rose-500 bg-rose-500/5 border border-rose-500/10 active:scale-[0.98] transition-all"
                >
                  <LogOut size={18} />
                  <span>Çıkış Yap</span>
                </button>

                <div className="p-4 text-center">
                   <p className="text-[9px] font-bold text-[#9ca3af]/40 uppercase tracking-[0.3em]">Aura Assistant v4.2</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
