"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Clock, Type, AlignLeft, Sparkles, Loader2, Briefcase, Heart, ShoppingCart, Star, Zap, Send, Edit2, Camera, ImageIcon, Calendar } from "lucide-react";
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

// Helper to compress images on the client side
const compressImage = (file: File, maxWidth: number = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Quality: 0.7 for good compression vs quality balance
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function TaskSheet({ isOpen, onClose, selectedDate, onSuccess, editData }: TaskSheetProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [time, setTime] = useState("12:00");
  const [date, setDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  const [topic, setTopic] = useState("work");
  const [image, setImage] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [isPending, setIsPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || "");
      setContent(editData.content || "");
      setTime(editData.time || "12:00");
      setDate(format(new Date(editData.date), "yyyy-MM-dd"));
      setTopic(editData.topic || "work");
      setImage(editData.image || null);
      setIsRecurring(editData.isRecurring || false);
      setRecurrenceType(editData.recurrenceType || "none");
      setRecurringDays(editData.recurringDays ? editData.recurringDays.split(",").map(Number) : []);
    } else {
      setTitle("");
      setContent("");
      setTime("12:00");
      setDate(format(selectedDate, "yyyy-MM-dd"));
      setTopic("work");
      setImage(null);
      setIsRecurring(false);
      setRecurrenceType("none");
      setRecurringDays([]);
    }
  }, [editData, isOpen, selectedDate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const loadingToast = toast.loading("Görsel işleniyor...");
      try {
        // Automatically compress before sending to avoid Vercel 4.5MB payload limit
        const compressedBase64 = await compressImage(file);
        setImage(compressedBase64);
        toast.dismiss(loadingToast);
      } catch (error) {
        console.error("Görsel sıkıştırma hatası:", error);
        toast.error("Görsel işlenirken bir hata oluştu.");
        toast.dismiss(loadingToast);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Lütfen görev içeriğini girin.");
      return;
    }

    setIsPending(true);
    const finalDate = new Date(date);
    const finalDays = recurringDays.length > 0 ? recurringDays.sort().join(",") : undefined;

    try {
      if (editData) {
        await updateTask(
          editData.id, 
          content, 
          finalDate, 
          time || undefined, 
          title || undefined, 
          topic, 
          image || undefined,
          isRecurring,
          recurrenceType,
          finalDays
        );
        toast.success("Görev başarıyla güncellendi.");
      } else {
        await addTask(
          content, 
          finalDate, 
          time || undefined, 
          title || undefined, 
          topic, 
          "low", 
          undefined, 
          image || undefined,
          isRecurring,
          recurrenceType,
          finalDays
        );
        toast.success("Görev başarıyla oluşturuldu.");
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("GÖREV KAYDETME HATASI:", error);
      toast.error("Görev kaydedilirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
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
                    {editData ? <Edit2 size={18} /> : <Sparkles size={18} />}
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
                       <Camera size={12} /> Görsel
                    </label>
                    <div className="space-y-4">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload}
                      />
                      
                      {image ? (
                        <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-[#1f2937] group bg-[#020617]">
                          <img src={image} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setImage(null)}
                            className="absolute top-3 right-3 p-1.5 bg-[#020617]/80 backdrop-blur-md rounded-lg text-white opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all border border-[#1f2937]"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-5 border-2 border-dashed border-[#1f2937] rounded-2xl flex items-center justify-center gap-3 text-[#9ca3af] hover:text-[#10a37f] hover:border-[#10a37f]/30 hover:bg-[#10a37f]/5 transition-all outline-none"
                        >
                          <ImageIcon size={18} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Görsel Yükle</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60 flex items-center gap-2">
                       <Calendar size={12} /> Planlanan Tarih
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3.5 text-sm font-bold text-[#e5e7eb] focus:outline-none focus:border-[#10a37f]/50 transition-all cursor-pointer [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60 flex items-center gap-2">
                       <Clock size={12} /> Planlanan Saat
                    </label>
                    <div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] rounded-xl px-2">
                      <select 
                        value={time.split(":")[0]}
                        onChange={(e) => setTime(`${e.target.value}:${time.split(":")[1]}`)}
                        className="bg-transparent py-3.5 text-sm font-bold text-[#e5e7eb] focus:outline-none appearance-none cursor-pointer px-2"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')} className="bg-[#111827]">
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className="text-[#9ca3af]/40">:</span>
                      <select 
                        value={time.split(":")[1]}
                        onChange={(e) => setTime(`${time.split(":")[0]}:${e.target.value}`)}
                        className="bg-transparent py-3.5 text-sm font-bold text-[#e5e7eb] focus:outline-none appearance-none cursor-pointer px-2"
                      >
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')} className="bg-[#111827]">
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <Clock size={14} className="ml-auto mr-2 text-[#9ca3af]/20" />
                    </div>
                  </div>
                </div>

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

                  {/* Recurrence Section */}
                  <div className="space-y-4 pt-2 border-t border-[#1f2937]/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#10a37f]/10 flex items-center justify-center text-[#10a37f]">
                          <Clock size={14} />
                        </div>
                        <span className="text-xs font-bold text-[#e5e7eb]">Tekrarlayan Görev</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                          isRecurring ? "bg-[#10a37f]" : "bg-[#1f2937]"
                        )}
                      >
                        <motion.div
                          animate={{ x: isRecurring ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isRecurring && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { id: "weekdays", label: "Hafta içi her gün" },
                              { id: "weekly", label: "Her hafta bugün" },
                              { id: "custom", label: "Özel Günler" }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setRecurrenceType(opt.id)}
                                className={cn(
                                  "w-full px-4 py-3 rounded-xl text-[11px] font-bold transition-all border text-left flex items-center justify-between",
                                  recurrenceType === opt.id 
                                    ? "bg-[#10a37f]/10 border-[#10a37f]/30 text-[#10a37f]" 
                                    : "bg-[#1f2937] border-transparent text-[#9ca3af] hover:border-[#1f2937]/50"
                                )}
                              >
                                {opt.label}
                                {recurrenceType === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-[#10a37f]" />}
                              </button>
                            ))}
                          </div>

                          {recurrenceType === "custom" && (
                            <div className="flex justify-between items-center gap-1.5 py-2">
                              {[
                                { id: 1, label: "Pzt", short: "P" },
                                { id: 2, label: "Sal", short: "S" },
                                { id: 3, label: "Çar", short: "Ç" },
                                { id: 4, label: "Per", short: "P" },
                                { id: 5, label: "Cum", short: "C" },
                                { id: 6, label: "Cmt", short: "C" },
                                { id: 0, label: "Paz", short: "P" },
                              ].map((day) => {
                                const isSelected = recurringDays.includes(day.id);
                                return (
                                  <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) setRecurringDays(recurringDays.filter(d => d !== day.id));
                                      else setRecurringDays([...recurringDays, day.id]);
                                    }}
                                    className={cn(
                                      "w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black transition-all border",
                                      isSelected
                                        ? "bg-[#10a37f] text-white border-[#10a37f]"
                                        : "bg-[#111827] text-[#9ca3af] border-[#1f2937] hover:border-[#9ca3af]/30"
                                    )}
                                    title={day.label}
                                  >
                                    {day.short}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
