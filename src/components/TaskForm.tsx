"use client";

import React, { useState } from "react";
import { Plus, Loader2, Clock } from "lucide-react";
import { addTask } from "@/app/actions/tasks";

interface TaskFormProps {
  selectedDate: Date;
  onSuccess?: () => void;
}

export default function TaskForm({ selectedDate, onSuccess }: TaskFormProps) {
  const [content, setContent] = useState("");
  const [time, setTime] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPending(true);
    try {
      await addTask(content, selectedDate, time || undefined);
      setContent("");
      setTime("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="glass-panel p-2 flex gap-2 border-white/5 bg-white/[0.02]">
          <input
            type="text"
            placeholder="Neler yapacaksın?"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm px-3 placeholder:text-white/10"
          />
          
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 border border-white/5">
            <Clock size={14} className="text-white/20" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[10px] font-bold text-white uppercase w-16 [color-scheme:dark]"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-30 transition-all shadow-lg shadow-primary/20 active:scale-95 group"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
