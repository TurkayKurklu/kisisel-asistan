"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User as UserIcon, ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);

    try {
      const result = await register(formData);
      if (result.success) {
        toast.success("Hesap oluşturuldu! Giriş yapabilirsiniz.");
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161c2d] flex items-center justify-center p-4 selection:bg-[#10a37f]/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10a37f]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#1f263a]/50 backdrop-blur-2xl border border-[#2b3348] rounded-[32px] p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-[#10a37f]/10 rounded-2xl flex items-center justify-center text-[#10a37f] border border-[#10a37f]/20 mb-6 shadow-xl shadow-[#10a37f]/5">
              <Mail size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Aramıza Katıl</h1>
            <p className="text-sm text-[#94a3b8] font-medium opacity-80">Yeni bir asistan hesabı oluştur.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] pl-1">Ad Soyad</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]/40 group-focus-within:text-[#10a37f] transition-colors">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="İsmini gir..."
                  className="w-full bg-[#161c2d]/50 border border-[#2b3348] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#94a3b8]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] pl-1">Kullanıcı Adı</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]/40 group-focus-within:text-[#10a37f] transition-colors">
                  <Shield size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adı belirle..."
                  className="w-full bg-[#161c2d]/50 border border-[#2b3348] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#94a3b8]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] pl-1">Şifre</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]/40 group-focus-within:text-[#10a37f] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Güçlü bir şifre seç..."
                  className="w-full bg-[#161c2d]/50 border border-[#2b3348] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#94a3b8]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-white/90 disabled:opacity-50 text-[#161c2d] rounded-[20px] py-4.5 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  Hesap Oluştur <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#2b3348]/40 text-center">
            <p className="text-sm text-[#94a3b8] font-medium">
              Zaten hesabın var mı?{" "}
              <Link href="/login" className="text-[#10a37f] hover:text-[#10a37f]/80 font-bold transition-colors">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
