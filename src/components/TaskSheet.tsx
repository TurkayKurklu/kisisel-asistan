"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Type, AlignLeft, Sparkles, Loader2, Briefcase, Heart, ShoppingCart, Star, Zap, ChevronLeft, ChevronRight, ChevronDown, Send, Edit2, Camera } from "lucide-react";
import { addTask, updateTask } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";
import Portal from "./Portal";
import { toast } from "sonner";

interface TaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSuccess?: () => void;
  editData?: any;
}

const TOPICS = [
  { id: "work", name: "İş", icon: Briefcase },
  { id: "life", name: "Yaşam", icon: Heart },
  { id: "shop", name: "Market", icon: ShoppingCart },
  { id: "study", name: "Eğitim", icon: Star },
  { id: "urgent", name: "Acil", icon: Zap },
];

export default function TaskSheet({ isOpen, onClose, selectedDate, onSuccess, editData }: TaskSheetProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [time, setTime] = useState("12:00");
  const [topic, setTopic] = useState("work");
  const [image, setImage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || "");
      setContent(editData.content || "");
      setTime(editData.time || "12:00");
      setTopic(editData.topic || "work");
      setImage(editData.image || "");
    } else {
      setTitle("");
      setContent("");
      setTime("12:00");
      setTopic("work");
      setImage("");
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Lütfen görev içeriğini girin.");
      return;
    }

    setIsPending(true);
    try {
      if (editData) {
        await updateTask(editData.id, content, selectedDate, time || undefined, title || undefined, topic, image || undefined);
        toast.success("Görev başarıyla güncellendi.");
      } else {
        await addTask(content, selectedDate, time || undefined, title || undefined, topic, "low", undefined, image || undefined);
        toast.success("Görev başarıyla oluşturuldu.");
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(editData ? "Görev güncellenemedi." : "Görev oluşturulamadı.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl animate-fade-in text-[#e5e7eb]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[440px] bg-[#111827] border border-[#1f2937] rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-[#10a37f]">
                    {editData ? <Edit2 size={18} /> : <Edit2 size={18} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#e5e7eb]">{editData ? "Görevi Düzenle" : "Yeni Görev"}</h2>
                    <p className="text-[9px] text-[#9ca3af] uppercase font-bold tracking-[0.2em] mt-0.5">Planlama Merkezi</p>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60 flex items-center gap-2">
                       <Type size={12} /> Başlık (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Göreve bir isim ver..."
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3.5 text-md font-bold text-[#e5e7eb] placeholder-[#9ca3af]/20 focus:outline-none focus:border-[#10a37f]/50 transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60 flex items-center gap-2">
                       <AlignLeft size={12} /> Detaylar
                    </label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Neler yapmayı planlıyorsun?"
                      rows={3}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-4 text-sm text-[#e5e7eb] placeholder-[#9ca3af]/20 focus:outline-none focus:border-[#10a37f]/50 transition-all resize-none leading-relaxed font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60 flex items-center gap-2">
                       <Camera size={12} /> Görsel URL (Opsiyonel)
                    </label>
                    <div className="relative group">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://örnek.com/görsel.jpg"
                        className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3.5 text-xs font-medium text-[#e5e7eb] placeholder-[#9ca3af]/20 focus:outline-none focus:border-[#10a37f]/50 transition-all"
                      />
                      {image && (
                        <div className="mt-4 w-full h-32 rounded-2xl overflow-hidden border border-[#1f2937] bg-[#020617]">
                          <img src={image} alt="Önizleme" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3 relative group/topic">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">Kategori</label>
                    
                    <div className="relative">
                      <div 
                        ref={scrollRef}
                        className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 px-1 scroll-smooth"
                      >
                        {TOPICS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTopic(t.id)}
                            className={cn(
                              "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border font-bold text-[11px]",
                              topic === t.id 
                                ? "bg-[#10a37f] text-white border-[#10a37f] shadow-lg shadow-[#10a37f]/10" 
                                : "bg-[#1f2937] text-[#9ca3af] border-[#1f2937] hover:border-[#9ca3af]/20"
                            )}
                          >
                            <t.icon size={12} />
                            <span>{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60 flex items-center gap-2">
                       <Clock size={12} /> Planlanan Saat
                    </label>
                    <div className="flex items-center gap-3 bg-[#111827] border border-[#1f2937] p-1.5 rounded-2xl">
                      <div className="flex-1 flex gap-2">
                        <select 
                          value={time.split(":")[0] || "12"}
                          onChange={(e) => setTime(`${e.target.value.padStart(2, '0')}:${time.split(":")[1] || "00"}`)}
                          className="flex-1 bg-[#1f2937] border border-[#1f2937] rounded-xl py-3 text-center text-lg font-bold text-[#e5e7eb] focus:outline-none appearance-none cursor-pointer"
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                        <div className="flex items-center text-[#9ca3af]/40 font-bold">:</div>
                        <select 
                          value={time.split(":")[1] || "00"}
                          onChange={(e) => setTime(`${time.split(":")[0] || "12"}:${e.target.value.padStart(2, '0')}`)}
                          className="flex-1 bg-[#1f2937] border border-[#1f2937] rounded-xl py-3 text-center text-lg font-bold text-[#e5e7eb] focus:outline-none appearance-none cursor-pointer"
                        >
                          {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i * 5} value={(i * 5).toString().padStart(2, '0')}>{(i * 5).toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                      <div className="px-4 py-3 bg-[#111827] border border-[#1f2937] rounded-xl text-[#10a37f] font-bold text-[11px] uppercase tracking-widest">
                        {time}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2",
                    isPending ? "bg-[#1f2937] text-[#9ca3af] cursor-not-allowed" : "bg-[#10a37f] text-white hover:opacity-95 shadow-[#10a37f]/10 active:scale-95"
                  )}
                >
                  {isPending ? <Loader2 size={20} className="animate-spin" /> : (
                    <>
                      <Send size={16} />
                      {editData ? "Güncellemeyi Kaydet" : "Görevi Kaydet"}
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
