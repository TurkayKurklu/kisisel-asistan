"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Grid,
  List as ListIcon,
  Trash2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Inbox,
  Sparkles,
  ArrowRight,
  X,
  Edit2,
  Tag,
  Clock,
  Type,
  AlignLeft,
  ChevronRight,
  Circle,
  Camera
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { getTasks, deleteTask, toggleTask } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";
import TaskSheet from "@/components/TaskSheet";
import DashboardHeader from "@/components/DashboardHeader";
import { toast } from "sonner";
import Portal from "@/components/Portal";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // Default to list for better split view
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editTaskData, setEditTaskData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      toast.error("Görevler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    toast("Görevi silmek istediğinize emin misiniz?", {
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteTask(id);
            toast.success("Görev silindi.");
            if (selectedTask?.id === id) setSelectedTask(null);
            fetchData();
          } catch (error) {
            toast.error("Silme işlemi başarısız oldu.");
          }
        },
      },
      cancel: { label: "İptal", onClick: () => { } }
    });
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t));
    try {
      await toggleTask(id, !currentStatus);
    } catch (error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: currentStatus } : t));
      toast.error("Durum güncellenemedi.");
    }
  };

  const activeTasks = tasks.filter(t => !t.isCompleted && (
    t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.topic && t.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  ));

  const completedTasks = tasks.filter(t => t.isCompleted && (
    t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.topic && t.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  ));

  return (
    <div className="space-y-10 animate-chat-fade">
      <DashboardHeader
        title="Görevler"
        subtitle="Yapılacaklarınızı planlayın ve Kişisel Asistan yardımıyla çalışın."
        showSearch={false}
      />

      {/* Control Bar */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-4 px-2">
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
              placeholder="Görevlerde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-[#1f2937] rounded-xl text-xs font-medium focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
            />
          </div>
          <button
            onClick={() => { setEditTaskData(null); setIsAddTaskOpen(true); }}
            className="px-4 py-2.5 bg-[#10a37f] hover:bg-[#10a37f]/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#10a37f]/10"
          >
            <Sparkles size={14} /> Yeni Görev
          </button>
        </div>
      </section>

      {/* Split View Tasks Area */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-32 px-2">
        {/* Active Tasks Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-[#e5e7eb] uppercase tracking-widest pl-1">Aktif Görevler</h3>
            </div>
            <span className="text-[10px] font-bold text-[#9ca3af] bg-[#1f2937] px-2 py-0.5 rounded-md">{activeTasks.length}</span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#111827] rounded-2xl animate-pulse border border-[#1f2937]" />)}
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-[#111827]/30 border border-dashed border-[#1f2937] rounded-3xl">
              <div className="w-12 h-12 bg-[#1f2937] rounded-2xl flex items-center justify-center text-[#9ca3af]/10 border border-[#1f2937]">
                <Inbox size={24} />
              </div>
              <p className="text-[11px] font-bold text-[#9ca3af]/40 uppercase tracking-widest">Bekleyen görev yok</p>
            </div>
          ) : (
            <div className={cn(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3")}>
              <AnimatePresence mode="popLayout">
                {activeTasks.map((task, i) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    viewMode={viewMode}
                    onToggle={() => handleToggle(task.id, task.isCompleted)}
                    onClick={() => setSelectedTask(task)}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Completed Tasks Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 text-[#9ca3af]">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 pl-1">Tamamlananlar</h3>
            </div>
            <span className="text-[10px] font-bold bg-[#1f2937] px-2 py-0.5 rounded-md opacity-60">{completedTasks.length}</span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-20 bg-[#111827] rounded-2xl animate-pulse border border-[#1f2937]" />)}
            </div>
          ) : completedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-[#111827]/10 border border-dashed border-[#1f2937] rounded-3xl opacity-40">
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest">Henüz tamamlanan yok</p>
            </div>
          ) : (
            <div className={cn(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3")}>
              <AnimatePresence mode="popLayout">
                {completedTasks.map((task, i) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    viewMode={viewMode}
                    onToggle={() => handleToggle(task.id, task.isCompleted)}
                    onClick={() => setSelectedTask(task)}
                    index={i}
                    isCompletedView
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <TaskSheet
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        selectedDate={new Date()}
        onSuccess={fetchData}
        editData={editTaskData}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={(task: any) => {
          setSelectedTask(null);
          setEditTaskData(task);
          setIsAddTaskOpen(true);
        }}
        onDelete={(id: string) => handleDelete(id)}
      />
    </div>
  );
}

function TaskItem({ task, viewMode, onToggle, onClick, index, isCompletedView }: any) {
  const isGrid = viewMode === "grid";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col bg-[#111827] border border-[#1f2937] transition-all hover:border-[#10a37f]/30 cursor-pointer overflow-hidden",
        isGrid ? "rounded-2xl p-6 h-full min-h-[140px]" : "rounded-xl p-4 flex-row items-center gap-6",
        isCompletedView && "opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
      )}
    >
      <div className={cn("flex-1 space-y-4", !isGrid && "flex items-center justify-between w-full")}>
        <div className="flex items-start gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={cn(
              "w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all mt-1 z-10 shadow-sm",
              task.isCompleted
                ? "bg-[#10a37f] border-[#10a37f] text-white"
                : "bg-transparent border-[#1f2937] hover:border-[#10a37f] text-transparent"
            )}
          >
            <CheckCircle2 size={12} strokeWidth={3} />
          </button>

          <div className="space-y-1.5 min-w-0 flex-1">
            <h4 className={cn(
              "text-md font-bold text-[#e5e7eb] tracking-tight leading-tight truncate px-1",
              task.isCompleted && "text-[#9ca3af] line-through decoration-1"
            )}>
              {task.title || task.content}
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-[#10a37f] uppercase tracking-widest">
                {task.topic || "Genel"}
              </span>
              <div className="flex items-center gap-1.5 opacity-40">
                <CalendarIcon size={10} className="text-[#9ca3af]" />
                <p className="text-[10px] font-bold text-[#9ca3af] uppercase">
                  {format(new Date(task.date), "d MMM", { locale: tr })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("flex items-center justify-between", isGrid ? "pt-4 mt-auto border-t border-[#1f2937]" : "ml-auto pl-6")}>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <span className="text-[9px] font-bold text-[#10a37f] uppercase tracking-widest">Detayı Gör</span>
            <ChevronRight size={12} className="text-[#10a37f]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskDetailModal({ task, onClose, onEdit, onDelete }: any) {
  if (!task) return null;

  return (
    <Portal>
      <AnimatePresence>
        {task && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl animate-fade-in text-[#e5e7eb]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[520px] bg-[#111827] border border-[#1f2937] rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#10a37f] blur-[100px] opacity-10 rounded-full" />

              <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-center text-[#9ca3af]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-[#10a37f]">
                      <Sparkles size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest px-1">GÖREV DETAYI</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(task)} className="p-2.5 bg-[#1f2937] rounded-xl hover:text-[#10a37f] transition-colors">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="p-2.5 bg-[#1f2937] rounded-xl hover:text-rose-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                    <button onClick={onClose} className="p-2.5 bg-[#1f2937] rounded-xl hover:text-white transition-colors ml-1">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {task.image && (
                    <div className="w-full h-48 rounded-3xl overflow-hidden border border-[#1f2937] shadow-lg">
                      <img src={task.image} alt={task.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#10a37f]">
                      <Type size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Başlık</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#e5e7eb] leading-tight px-1 italic">
                      {task.title || "Adsız Görev"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-6 py-8 border-y border-[#1f2937]">
                    <DetailField icon={Tag} label="Kategori" value={task.topic || "Genel"} />
                    <DetailField icon={CalendarIcon} label="Tarih" value={format(new Date(task.date), "d MMM yyyy", { locale: tr })} />
                    <DetailField icon={Clock} label="Saat" value={task.time || "Belirtilmedi"} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#9ca3af]">
                      <AlignLeft size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Açıklama & Detay</span>
                    </div>
                    <div className="bg-[#020617] p-6 rounded-[24px] border border-[#1f2937] text-sm text-[#e5e7eb] leading-relaxed font-medium whitespace-pre-wrap shadow-inner">
                      {task.content || "Detaylı açıklama bulunmuyor."}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-4.5 bg-[#1f2937] text-white font-bold rounded-[24px] shadow-xl text-xs uppercase tracking-[0.2em] border border-[#1f2937] hover:border-[#10a37f]/50 transition-all hover:text-[#10a37f]"
                >
                  Geri Dön
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

function DetailField({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[#9ca3af]/40">
        <Icon size={12} />
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-[#e5e7eb] truncate">{value}</p>
    </div>
  );
}
