"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet, 
  StickyNote, 
  CheckSquare,
  TrendingUp,
  PiggyBank,
  LogOut,
  X,
  Check
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const MENU_ITEMS = [
  { id: "dashboard", label: "Panel", icon: LayoutDashboard, href: "/dashboard" },
  { id: "calendar", label: "Takvim", icon: Calendar, href: "/calendar" },
  { id: "finance", label: "Maliye", icon: Wallet, href: "/finance" },
  { id: "notes", label: "Notlar", icon: StickyNote, href: "/notes" },
  { id: "tasks", label: "Görevler", icon: CheckSquare, href: "/tasks" },
  { id: "savings", label: "Kumbara", icon: PiggyBank, href: "/savings" },
];

interface BottomNavProps {
  onMenuClick?: () => void;
}

export default function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="flex items-center justify-around p-1.5 bg-[#020617]/90 backdrop-blur-xl border border-[#1f2937] rounded-2xl shadow-2xl">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname === `/(dashboard)${item.href}`;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-300 min-w-[50px]",
                  isActive ? "text-[#10a37f] bg-[#10a37f]/5" : "text-[#9ca3af] hover:text-white"
                )}
              >
                <item.icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn("transition-transform duration-300", isActive && "scale-110")} 
                />
                <span className={cn("text-[8px] font-bold tracking-tight px-1", !isActive && "hidden")}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-300 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/5 min-w-[50px]"
          >
            <LogOut size={18} strokeWidth={2} />
            <span className="hidden text-[8px] font-bold">Çıkış</span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xs bg-[#020617] border border-[#1f2937] rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500/50 via-rose-500 to-rose-500/50" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
                  <LogOut size={32} />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Çıkış Yapılsın mı?</h3>
                  <p className="text-xs text-[#9ca3af]">Oturumunuz kapatılacaktır. Devam etmek istiyor musunuz?</p>
                </div>

                <div className="flex w-full gap-3 pt-2">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-white text-sm font-bold hover:bg-[#1f2937] transition-colors"
                  >
                    <X size={16} />
                    Vazgeç
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-colors"
                  >
                    <Check size={16} />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

