"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Geçersiz kullanıcı adı veya şifre.");
      } else {
        toast.success("Başarıyla giriş yapıldı!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161c2d] flex items-center justify-center p-4 selection:bg-[#10a37f]/30">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10a37f]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#1f263a]/50 backdrop-blur-2xl border border-[#2b3348] rounded-[32px] p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-[#10a37f]/10 rounded-2xl flex items-center justify-center text-[#10a37f] border border-[#10a37f]/20 mb-6 shadow-xl shadow-[#10a37f]/5">
              <Shield size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Asistan'a Hoş Geldin</h1>
            <p className="text-sm text-[#94a3b8] font-medium opacity-80">Devam etmek için hesabına giriş yap.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] pl-1">Kullanıcı Adı</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]/40 group-focus-within:text-[#10a37f] transition-colors">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adını gir..."
                  className="w-full bg-[#161c2d]/50 border border-[#2b3348] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#94a3b8]/20"
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
                  placeholder="Şifreni gir..."
                  className="w-full bg-[#161c2d]/50 border border-[#2b3348] rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#94a3b8]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10a37f] hover:bg-[#10a37f]/90 disabled:opacity-50 text-white rounded-[20px] py-4.5 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#10a37f]/20 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  Giriş Yap <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#2b3348]/40 text-center">
            <p className="text-sm text-[#94a3b8] font-medium">
              Hesabın yok mu?{" "}
              <Link href="/register" className="text-[#10a37f] hover:text-[#10a37f]/80 font-bold transition-colors">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[10px] text-[#94a3b8]/30 font-bold uppercase tracking-[0.3em]">
             © 2026 Kişisel Asistan v2.0
           </p>
        </div>
      </motion.div>
    </div>
  );
}
