"use client";

import React, { useState } from "react";
import { Plus, X, Loader2, Award, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addHabit } from "@/app/actions/habits";
import Portal from "./Portal";

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function HabitForm({ isOpen, onClose, onSuccess }: HabitFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsPending(true);
    try {
      await addHabit(title);
      setTitle("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[440px] glass-panel rounded-[3rem] z-10 p-10 shadow-[0_25px_100px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                    <Award size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Yeni Alışkanlık</h2>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Disiplin Merkezi</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                   <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 font-black text-xl group-focus-within:text-primary transition-colors">
                      <Zap size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="Günlük Rutinin / Alışkanlığın"
                      required
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-[2rem] pl-16 pr-8 py-6 text-xl font-bold text-white placeholder-white/5 focus:outline-none focus:border-primary/50 transition-all tracking-tight"
                    />
                  </div>
                  <p className="text-[10px] text-white/20 font-medium px-4 text-center leading-relaxed">
                    Alışkanlıklar her gün takip edilirse seri (streak) başlar. Basit ve sürdürülebilir hedefler koymayı unutmayın.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isPending || !title.trim()}
                  className="w-full h-16 bg-primary hover:opacity-90 disabled:opacity-50 text-white font-black rounded-3xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.3em]"
                >
                  {isPending ? <Loader2 className="animate-spin" size={24} /> : "Başlat"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
