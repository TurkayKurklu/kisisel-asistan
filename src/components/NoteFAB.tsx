"use client";

import React, { useState, useRef } from "react";
import { Plus, X, Loader2, Image as ImageIcon, FileText, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createNote } from "@/app/actions/notes";
import Portal from "./Portal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NoteFABProps {
  onSuccess?: () => void;
}

export default function NoteFAB({ onSuccess }: NoteFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Resim boyutu 2MB'dan küçük olmalıdır.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Not içeriği boş olamaz.");
      return;
    }

    setIsPending(true);
    try {
      await createNote(title || "Adsız Not", content, image || undefined);
      setTitle("");
      setContent("");
      setImage(null);
      setIsOpen(false);
      toast.success("Not başarıyla kaydedildi.");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Not kaydedilirken bir hata oluştu.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-10 w-16 h-16 bg-[#10a37f] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#10a37f]/20 z-40 border border-[#10a37f]/50 transition-all hover:bg-[#10a37f]/90"
      >
        <Plus size={32} />
      </motion.button>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl animate-fade-in text-[#e5e7eb]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-[480px] bg-[#111827] border border-[#1f2937] rounded-3xl p-8 shadow-2xl relative"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-[#10a37f]">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#e5e7eb]">Hızlı Not</h2>
                      <p className="text-[9px] text-[#9ca3af] uppercase font-bold tracking-[0.2em] mt-0.5">Yaratıcı Fikirler</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 text-[#9ca3af] hover:text-[#e5e7eb] bg-[#1f2937] rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">Başlık</label>
                    <input
                      type="text"
                      placeholder="Notunuza bir başlık verin..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3.5 text-md font-bold text-[#e5e7eb] placeholder-[#9ca3af]/20 focus:outline-none focus:border-[#10a37f]/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">İçerik</label>
                    <textarea
                      placeholder="Neler düşünüyorsun?.."
                      required
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-4 text-sm text-[#e5e7eb] placeholder-[#9ca3af]/20 focus:outline-none focus:border-[#10a37f]/50 transition-all resize-none leading-relaxed font-medium"
                    />
                  </div>

                  {/* Image Upload Area */}
                  <div className="space-y-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload}
                    />
                    
                    {image ? (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-[#1f2937] group">
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
                        className="w-full py-5 border-2 border-dashed border-[#1f2937] rounded-2xl flex items-center justify-center gap-3 text-[#9ca3af] hover:text-[#10a37f] hover:border-[#10a37f]/30 hover:bg-[#10a37f]/5 transition-all"
                      >
                        <ImageIcon size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Görsel Ekle</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending || !content.trim()}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2",
                      isPending ? "bg-[#1f2937] text-[#9ca3af] cursor-not-allowed" : "bg-[#10a37f] text-white hover:opacity-90 shadow-[#10a37f]/10 active:scale-95"
                    )}
                  >
                    {isPending ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        <Send size={16} />
                        Notu Kaydet
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
