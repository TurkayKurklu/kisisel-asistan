"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Grid,
  List as ListIcon,
  Trash2,
  Calendar as CalendarIcon,
  ImageIcon,
  Inbox,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { getNotes, deleteNote } from "@/app/actions/notes";
import { cn } from "@/lib/utils";
import NoteSheet from "@/components/NoteSheet";
import DashboardHeader from "@/components/DashboardHeader";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      toast.error("Notlar yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    toast("Notu silmek istediğinize emin misiniz?", {
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteNote(id);
            toast.success("Not başarıyla silindi.");
            fetchData();
          } catch (error) {
            toast.error("Silme işlemi başarısız oldu.");
          }
        },
      },
      cancel: { label: "İptal", onClick: () => { } }
    });
  };

  const handleEdit = (note: any) => {
    setSelectedNote(note);
    setIsNoteSheetOpen(true);
  };

  const filteredNotes = notes.filter(n =>
    (n.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (n.content?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-chat-fade">
      <DashboardHeader
        title="Notlarım"
        subtitle="Kısa notlar alın ve düşüncelerinizi organize edin."
        showSearch={false}
      />

      {/* Control Bar */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-4">
        <div className="flex bg-[#111827] p-1.5 rounded-xl border border-[#1f2937] w-full sm:w-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex-1 px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
              viewMode === "grid" ? "bg-[#1f2937] text-white" : "text-[#9ca3af] hover:text-white"
            )}
          >
            <Grid size={14} /> Kılavuz
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex-1 px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
              viewMode === "list" ? "bg-[#1f2937] text-white" : "text-[#9ca3af] hover:text-white"
            )}
          >
            <ListIcon size={14} /> Liste
          </button>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]/40" size={16} />
            <input
              type="text"
              placeholder="Notlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-[#1f2937] rounded-xl text-xs font-medium focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
            />
          </div>
          <button
            onClick={() => { setSelectedNote(null); setIsNoteSheetOpen(true); }}
            className="px-4 py-2.5 bg-[#10a37f] hover:bg-[#10a37f]/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#10a37f]/10"
          >
            <FileText size={14} /> Yeni Not
          </button>
        </div>
      </section>

      {/* Notes Area */}
      <section className="pb-32">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-[#111827] rounded-2xl animate-pulse border border-[#1f2937]" />)}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-[#111827] border border-[#1f2937] rounded-3xl">
            <div className="w-16 h-16 bg-[#1f2937] rounded-2xl flex items-center justify-center text-[#9ca3af]/30">
              <Inbox size={32} />
            </div>
            <p className="text-sm font-bold text-[#e5e7eb]">Henüz bir not almadınız</p>
          </div>
        ) : (
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "grid grid-cols-1 gap-3"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note, i) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  viewMode={viewMode}
                  onDelete={() => handleDelete(note.id)}
                  onEdit={() => handleEdit(note)}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <NoteSheet 
        isOpen={isNoteSheetOpen} 
        onClose={() => setIsNoteSheetOpen(false)} 
        onSuccess={fetchData}
        editData={selectedNote}
      />
    </div>
  );
}

function NoteItem({ note, viewMode, onDelete, onEdit, index }: any) {
  const isGrid = viewMode === "grid";

  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("data:") || img.startsWith("http")) return img;
    const publicUrl = process.env.NEXT_PUBLIC_R2_URL || "";
    return `${publicUrl}/${img}`;
  };

  const imageUrl = getImageUrl(note.image);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cn(
        "group relative flex flex-col bg-[#111827] border border-[#1f2937] transition-all hover:border-[#10a37f]/30 overflow-hidden shadow-sm",
        isGrid ? "rounded-2xl p-6 h-full min-h-[180px]" : "rounded-xl p-4 flex-row items-center gap-6"
      )}
    >
      <div className={cn("flex flex-col flex-1 min-w-0 relative z-10", !isGrid && "flex-row items-center gap-6 justify-between")}>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            {!isGrid && imageUrl ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#1f2937] shadow-sm">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : !isGrid && (
              <div className="w-12 h-12 rounded-lg bg-[#111827] flex items-center justify-center text-[#9ca3af]/20 shrink-0 border border-[#1f2937]">
                <FileText size={20} />
              </div>
            )}

            <div className="min-w-0">
              <h4 className="text-md font-bold text-[#e5e7eb] truncate group-hover:text-[#10a37f] transition-colors leading-tight">
                {note.title || "Adsız Not"}
              </h4>
              <p className="text-[10px] font-bold text-[#9ca3af]/40 uppercase mt-0.5 tracking-wider">
                {format(new Date(note.createdAt), "d MMMM yyyy", { locale: tr })}
              </p>
            </div>
          </div>

          {isGrid && (
            <div className="space-y-4">
              {imageUrl && (
                <div className="w-full h-32 rounded-xl overflow-hidden border border-[#1f2937] shadow-inner">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <p className="text-sm text-[#9ca3af] leading-relaxed line-clamp-3 whitespace-pre-wrap font-medium">
                {note.content}
              </p>
            </div>
          )}
        </div>

        <div className={cn("flex items-center justify-between", isGrid ? "pt-4 mt-auto border-t border-[#1f2937]" : "ml-auto")}>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 text-[#9ca3af] hover:text-[#10a37f] transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 text-rose-500/60 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            {!isGrid && <ArrowRight size={14} className="text-[#10a37f] ml-1" />}
          </div>
          {isGrid && note.image && <ImageIcon size={14} className="text-[#10a37f]/40" />}
        </div>
      </div>
    </motion.div>
  );
}
