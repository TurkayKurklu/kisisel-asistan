"use client";

import React from "react";
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Smartphone, 
  HelpCircle, 
  LogOut, 
  ShieldCheck,
  ChevronRight,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardHeader from "@/components/DashboardHeader";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <DashboardHeader 
        title="Ayarlar" 
        subtitle="Profilinizi ve uygulama tercihlerinizi yönetin."
        showSearch={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Profile Card */}
        <div className="space-y-8">
          <section className="glass-panel p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-primary/10 to-purple-600/10 flex flex-col items-center text-center group">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 border-2 border-white/10 flex items-center justify-center text-white/10 group-hover:border-primary/50 transition-all overflow-hidden">
                <User size={64} strokeWidth={1} />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 border-4 border-[#0A0A0B]">
                <Palette size={16} />
              </button>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mb-1">Aura Kullanıcısı</h3>
            <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-6">Premium Üye</p>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[65%] h-full bg-primary" />
            </div>
            <p className="text-[10px] text-white/20 font-bold mt-2 uppercase tracking-widest">Kapasite: 6.5 / 10 GB</p>
          </section>

          <section className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
            <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] px-4">Görünüm</h4>
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4 text-white/80">
                <Palette size={20} />
                <span className="font-bold">Karanlık Mod</span>
              </div>
              <ThemeToggle />
            </div>
          </section>
        </div>

        {/* Right Column: Settings Sections */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <SettingsGroup title="Hesap Güvenliği">
              <SettingsItem icon={Lock} label="Şifre Değiştir" sub="En son 3 ay önce değiştirildi" />
              <SettingsItem icon={ShieldCheck} label="İki Faktörlü Doğrulama" sub="Aktif değil" danger={false} />
            </SettingsGroup>
            
            <SettingsGroup title="Bildirimler">
              <SettingsItem icon={Bell} label="Push Bildirimleri" sub="Görevler ve günlük özetler için" />
              <SettingsItem icon={Globe} label="E-Posta Bildirimleri" sub="Haftalık raporlar ve güncellemeler" />
            </SettingsGroup>

            <SettingsGroup title="Uygulama">
              <SettingsItem icon={Smartphone} label="Mobil Görünüm" sub="Varsayılan SaaS Dashboard" />
              <SettingsItem icon={HelpCircle} label="Yardım ve Destek" sub="Sıkça sorulan sorular" />
            </SettingsGroup>

            <div className="pt-6">
              <button className="w-full h-16 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-black rounded-3xl transition-all border border-rose-500/20 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.3em]">
                <LogOut size={20} />
                <span>Oturumu Kapat</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingsGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] px-6">{title}</h4>
      <div className="glass-panel rounded-[3rem] border-white/5 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingsItem({ icon: Icon, label, sub, danger }: any) {
  return (
    <button className="w-full flex items-center justify-between p-7 hover:bg-white/[0.04] transition-all border-b border-white/5 last:border-0 group">
      <div className="flex items-center gap-6">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
          danger ? "bg-rose-500/10 text-rose-500" : "bg-white/5 text-white/30 group-hover:bg-primary/20 group-hover:text-primary"
        )}>
          <Icon size={24} />
        </div>
        <div className="text-left">
          <p className="text-lg font-black text-white tracking-tight leading-none mb-1">{label}</p>
          <p className="text-xs text-white/20 font-medium">{sub}</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
    </button>
  );
}
