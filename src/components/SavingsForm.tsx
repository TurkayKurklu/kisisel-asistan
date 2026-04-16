"use client";

import React, { useState, useEffect } from "react";
import { 
  PiggyBank, 
  X, 
  Loader2, 
  Plus, 
  Minus, 
  Tag, 
  Send,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addTransaction, updateTransaction } from "@/app/actions/finance";
import Portal from "./Portal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SavingsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
}

export default function SavingsForm({ isOpen, onClose, onSuccess, editData }: SavingsFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [category, setCategory] = useState("Birikim");

  useEffect(() => {
    if (editData) {
      setAmount(editData.amount.toString());
      setTitle(editData.title || "");
      setType(editData.type);
      setCategory(editData.category || "Birikim");
    } else {
      setAmount("");
      setTitle("");
      setType("INCOME");
      setCategory("Birikim");
    }
  }, [editData, isOpen]);

  const handleAmountAdjust = (val: number) => {
    const currentVal = parseFloat(amount) || 0;
    setAmount(Math.max(0, currentVal + val).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Kumbara Form Verileri:", { amount, title, type, category });
    
    const numAmount = parseFloat(amount);
    if (!numAmount || !title.trim()) {
      console.warn("Eksik bilgi: Tutar veya başlık girilmemiş.");
      toast.error("Lütfen tutar ve açıklama girin.");
      return;
    }

    setIsPending(true);
    const loadingToast = toast.loading("İşlem gerçekleştiriliyor...");
    
    try {
      console.log("Sunucu eylemi başlatılıyor...");
      if (editData) {
        await updateTransaction(editData.id, numAmount, "", category, type, title, true);
        toast.success("Kumbara güncellendi!", { id: loadingToast });
      } else {
        await addTransaction(numAmount, "", category, type, title, true);
        toast.success("Paralar kumbaraya atıldı! 🪙", { id: loadingToast });
      }
      console.log("Bileşen kapatılıyor...");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("KUMBARA HATA AYRINTISI:", error);
      toast.error("İşlem başarısız oldu. Lütfen tekrar deneyin.", { id: loadingToast });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl">
            <div className={cn(
              "absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 transition-colors duration-700",
              type === "INCOME" ? "bg-primary" : "bg-rose-500"
            )} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-[440px] bg-[#111827] border border-primary/20 rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg transition-all duration-500",
                    type === "INCOME" 
                      ? "bg-primary border-primary/20 text-white shadow-primary/20" 
                      : "bg-[#1f2937] border-rose-500/30 text-rose-500 shadow-rose-500/5"
                  )}>
                    <PiggyBank size={28} className={cn(type === "INCOME" && "animate-bounce")} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Kumbara</h2>
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mt-0.5">HAYALLERİN İÇİN</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-3 bg-[#1f2937] text-[#9ca3af] hover:text-white rounded-2xl transition-all border border-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#020617] rounded-3xl border border-[#1f2937]">
                  <button
                    type="button"
                    onClick={() => setType("INCOME")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3.5 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all",
                      type === "INCOME" 
                        ? "bg-primary text-white shadow-xl shadow-primary/20" 
                        : "text-[#9ca3af] hover:text-white"
                    )}
                  >
                    <Plus size={16} /> PARA EKLE
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("EXPENSE")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3.5 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all",
                      type === "EXPENSE" 
                        ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20" 
                        : "text-[#9ca3af] hover:text-white"
                    )}
                  >
                    <Minus size={16} /> PARA ÇEK
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-primary/30">₺</div>
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#020617] border-2 border-[#1f2937] group-focus-within:border-primary/50 rounded-[32px] pl-14 pr-6 py-8 text-5xl font-black text-white focus:outline-none transition-all text-center tracking-tighter"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 500, 1000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleAmountAdjust(val)}
                        className="py-3 bg-[#1f2937] hover:bg-primary/10 border border-[#1f2937] hover:border-primary/30 rounded-2xl text-[10px] font-bold text-[#9ca3af] hover:text-primary transition-all"
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#9ca3af] uppercase tracking-[0.2em] ml-2 opacity-50">İşlem Notu</label>
                    <div className="bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 focus-within:border-primary/30 transition-all flex items-center gap-4">
                      <Sparkles size={18} className="text-primary/40" />
                      <input
                        type="text"
                        placeholder="Örn: Tatil birikimi, Ek ders..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-bold text-white placeholder-[#9ca3af]/20 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "w-full py-6 rounded-[28px] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3",
                    isPending 
                      ? "bg-[#1f2937] text-[#9ca3af] cursor-not-allowed" 
                      : type === "INCOME" 
                        ? "bg-primary hover:bg-primary/90 text-white shadow-primary/30" 
                        : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                  )}
                >
                  {isPending ? <Loader2 className="animate-spin" size={24} /> : (
                    <>
                      <Send size={18} />
                      {editData ? "GÜNCELLE" : type === "INCOME" ? "KUMBARAYA AT" : "KUMBARADAN ÇEK"}
                    </>
                  )}
                </button>
              </form>

              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 blur-[60px] rounded-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
