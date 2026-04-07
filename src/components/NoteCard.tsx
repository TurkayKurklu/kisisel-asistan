"use client";

import React from "react";
import { Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion } from "framer-motion";
import { deleteNote } from "@/app/actions/notes";

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export default function NoteCard({ id, title, content, createdAt }: NoteCardProps) {
  const handleDelete = async () => {
    if (confirm("Bu notu silmek istediğine emin misin?")) {
      await deleteNote(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel p-5 mb-4 group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-white/90 leading-tight pr-8">
          {title || "Başlıksız Not"}
        </h3>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-full bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <p className="text-white/60 text-sm whitespace-pre-wrap line-clamp-6 mb-4">
        {content}
      </p>

      <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-medium">
        <Calendar size={12} />
        {format(new Date(createdAt), "d MMMM yyyy", { locale: tr })}
      </div>
    </motion.div>
  );
}
