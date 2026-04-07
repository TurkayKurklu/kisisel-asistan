"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Loader2, Minus, Wallet, Tag, FileText, Send, ChevronDown, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addTransaction, updateTransaction } from "@/app/actions/finance";
import Portal from "./Portal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
}

export default function TransactionForm({ isOpen, onClose, onSuccess, editData }: TransactionFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Genel");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  useEffect(() => {
    if (editData) {
      setAmount(editData.amount.toString());
      setTitle(editData.title || "");
      setDescription(editData.description);
      setCategory(editData.category);
      setType(editData.type);
    } else {
      setAmount("");
      setTitle("");
      setDescription("");
      setCategory("Genel");
      setType("EXPENSE");
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || !title.trim()) {
      toast.error("Lütfen geçerli bir tutar ve başlık girin.");
      return;
    }

    setIsPending(true);
    try {
      if (editData) {
        await updateTransaction(editData.id, numAmount, description, category, type, title);
        toast.success("İşlem başarıyla güncellendi.");
      } else {
        await addTransaction(numAmount, description, category, type, title);
        toast.success("İşlem başarıyla kaydedildi.");
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Bir hata oluştu.");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl animate-fade-in text-[#e5e7eb]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[420px] bg-[#111827] border border-[#1f2937] rounded-3xl z-10 p-8 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-[#10a37f]">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#e5e7eb]">
                      {editData ? "İşlemi Düzenle" : "Yeni İşlem"}
                    </h2>
                    <p className="text-[9px] text-[#9ca3af] uppercase font-bold tracking-[0.2em] mt-0.5">Mali Takip</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2.5 text-[#9ca3af] hover:text-[#e5e7eb] bg-[#1f2937] rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="flex gap-2 p-1 bg-[#1f2937] rounded-xl border border-[#1f2937]">
                  <button
                    type="button"
                    onClick={() => setType("EXPENSE")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      type === "EXPENSE" ? "bg-[#111827] text-rose-500 shadow-sm" : "text-[#9ca3af] hover:text-white"
                    )}
                  >
                    <Minus size={14} /> Gider
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("INCOME")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      type === "INCOME" ? "bg-[#111827] text-emerald-500 shadow-sm" : "text-[#9ca3af] hover:text-white"
                    )}
                  >
                    <Plus size={14} /> Gelir
                  </button>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">Tutar</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9ca3af]/20 font-bold text-3xl group-focus-within:text-[#10a37f] transition-colors">₺</div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      autoFocus
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-2xl pl-14 pr-6 py-6 text-4xl font-bold text-[#e5e7eb] placeholder-[#9ca3af]/10 focus:outline-none focus:border-[#10a37f]/50 transition-all text-center tracking-tighter"
                    />
                  </div>
                </div>

                {/* Title & Category */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">İşlem Başlığı</label>
                    <div className="flex items-center gap-3 bg-[#111827] border border-[#1f2937] rounded-xl px-4 focus-within:border-[#10a37f]/50 transition-all">
                      <Type size={18} className="text-[#9ca3af]/30" />
                      <input
                        type="text"
                        placeholder="Örn: Market Alışverişi"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex-1 bg-transparent py-3.5 text-sm font-bold text-[#e5e7eb] placeholder-[#9ca3af]/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">Kategori</label>
                    <div className="flex items-center gap-3 bg-[#111827] border border-[#1f2937] rounded-xl px-4 focus-within:border-[#10a37f]/50 transition-all relative">
                      <Tag size={18} className="text-[#9ca3af]/30" />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-1 bg-transparent py-3.5 text-sm font-bold text-[#e5e7eb] focus:outline-none appearance-none pr-8"
                      >
                        <option value="Genel" className="bg-[#111827]">Genel Kategori</option>
                        <option value="Mutfak" className="bg-[#111827]">Mutfak & Market</option>
                        <option value="Ulaşım" className="bg-[#111827]">Ulaşım</option>
                        <option value="Eğlence" className="bg-[#111827]">Eğlence</option>
                        <option value="Kira" className="bg-[#111827]">Kira & Faturalar</option>
                        <option value="Maaş" className="bg-[#111827]">Maaş</option>
                        <option value="Kişisel" className="bg-[#111827]">Kişisel</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af]/30 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">Detaylı Açıklama (Opsiyonel)</label>
                    <div className="flex items-start gap-3 bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3 focus-within:border-[#10a37f]/50 transition-all">
                      <FileText size={18} className="text-[#9ca3af]/30 mt-1" />
                      <textarea
                        placeholder="İşlemle ilgili notlar..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="flex-1 bg-transparent text-sm font-medium text-[#e5e7eb] placeholder-[#9ca3af]/20 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending || !amount || !title.trim()}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2",
                    isPending ? "bg-[#1f2937] text-[#9ca3af] cursor-not-allowed" : "bg-[#10a37f] text-white hover:opacity-90 shadow-[#10a37f]/10"
                  )}
                >
                  {isPending ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <Send size={16} />
                      {editData ? "Güncellemeyi Kaydet" : "İşlemi Tamamla"}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
