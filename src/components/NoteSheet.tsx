"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Type, AlignLeft, Sparkles, Loader2, Send, Edit2, Camera, ImageIcon } from "lucide-react";
import { createNote, updateNote } from "@/app/actions/notes";
import { cn } from "@/lib/utils";
import Portal from "./Portal";
import { toast } from "sonner";

interface NoteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
}

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
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function NoteSheet({ isOpen, onClose, onSuccess, editData }: NoteSheetProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || "");
      setContent(editData.content || "");
      setImage(editData.image || null);
    } else {
      setTitle("");
      setContent("");
      setImage(null);
    }
  }, [editData, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const loadingToast = toast.loading("Görsel işleniyor...");
      try {
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
      toast.error("Lütfen not içeriğini girin.");
      return;
    }

    setIsPending(true);
    try {
      if (editData) {
        await updateNote(editData.id, title, content, image || undefined);
        toast.success("Not başarıyla güncellendi.");
      } else {
        await createNote(title, content, image || undefined);
        toast.success("Not başarıyla oluşturuldu.");
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("NOT KAYDETME HATASI:", error);
      toast.error("Not kaydedilirken bir hata oluştu.");
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
                    <h2 className="text-xl font-bold text-[#e5e7eb]">{editData ? "Notu Düzenle" : "Yeni Not"}</h2>
                    <p className="text-[9px] text-[#9ca3af] uppercase font-bold tracking-[0.2em] mt-0.5">Hızlı Notlar</p>
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
                      placeholder="Notuna bir isim ver..."
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3.5 text-md font-bold text-[#e5e7eb] placeholder-[#9ca3af]/20 focus:outline-none focus:border-[#10a37f]/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60 flex items-center gap-2">
                       <AlignLeft size={12} /> İçerik
                    </label>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Neler düşünüyorsun?"
                      rows={5}
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
                          <img src={image.startsWith("data:") || image.startsWith("http") ? image : `/api/media/${image}`} alt="Preview" className="w-full h-full object-cover" />
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
                      {editData ? "Notu Güncelle" : "Notu Kaydet"}
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
