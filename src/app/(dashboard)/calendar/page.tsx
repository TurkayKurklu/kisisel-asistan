"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format, addDays, isSameDay, startOfWeek, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { tr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  Trash2,
  CheckCircle2,
  Inbox,
  X,
  Edit2,
  Type,
  AlignLeft,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getTasks, deleteTask } from "@/app/actions/tasks";
import TaskSheet from "@/components/TaskSheet";
import DashboardHeader from "@/components/DashboardHeader";
import { toast } from "sonner";
import Portal from "@/components/Portal";

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editTaskData, setEditTaskData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const taskData = await getTasks();
      setTasks(taskData);
    } catch (error) {
      toast.error("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredTasks = tasks.filter(t => isSameDay(new Date(t.date), selectedDate));

  const handleDeleteTask = async (id: string) => {
    toast("Görevi silmek istediğinize emin misiniz?", {
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteTask(id);
            toast.success("Görev silindi.");
            setSelectedTask(null);
            fetchData();
          } catch (error) {
            toast.error("Silme işlemi başarısız oldu.");
          }
        },
      },
      cancel: { label: "İptal", onClick: () => { } }
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-10 animate-chat-fade opacity-0">
        <DashboardHeader title="Takvim" subtitle="Yükleniyor..." showSearch={false} />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-chat-fade px-2 md:px-6">
      <DashboardHeader
        title="Takvim"
        subtitle="Görevlerinizi ve planlarınızı organize edin."
        showSearch={false}
      />

      <div className="flex flex-col xl:flex-row gap-8 pb-32">
        {/* Monthly Calendar Grid - Significantly Expanded */}
        <section className="flex-[4] flex flex-col gap-6 min-w-0">
          <div className="bg-[#111827] border border-[#1f2937] p-2 sm:p-6 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/5">
            <MonthlyCalendar
              selectedDate={selectedDate}
              onDateSelect={(date: Date) => {
                setSelectedDate(date);
                setEditTaskData(null);
                setIsAddTaskOpen(true);
              }}
              entries={tasks}
            />
          </div>
        </section>

        {/* Day Details & Actions - Compact Sidebar */}
        <section className="flex-[1] space-y-6 min-w-0 lg:min-w-[320px]">
          <div className="bg-[#020617] border border-[#1f2937] rounded-[2.5rem] p-8 space-y-8 min-h-[500px] flex flex-col sticky top-6 shadow-xl ring-1 ring-white/5">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-[#10a37f] uppercase tracking-[0.2em] opacity-60">Seçili Gün</p>
              <h3 className="text-2xl font-bold tracking-tight text-[#e5e7eb]">
                {format(selectedDate, "d MMMM yyyy", { locale: tr })}
              </h3>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setEditTaskData(null); setIsAddTaskOpen(true); }}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-[#10a37f] text-white rounded-[1.25rem] text-xs font-bold shadow-xl shadow-[#10a37f]/20 hover:bg-[#10a37f]/90 transition-all active:scale-95 border border-[#10a37f]/50"
              >
                <Plus size={18} /> Yeni Görev Ekle
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest opacity-40">
                    GÖREVLER
                  </h4>
                  <span className="text-[10px] font-bold text-[#10a37f]">{filteredTasks.length} Kayıt</span>
                </div>
                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[#1f2937] rounded-[2.5rem] gap-4 bg-[#111827]/30">
                    <div className="w-12 h-12 rounded-full bg-[#111827] flex items-center justify-center text-[#9ca3af]/10 border border-[#1f2937]">
                      <Inbox size={20} />
                    </div>
                    <p className="text-[10px] text-[#9ca3af]/40 italic font-bold">Harika! Bugün için görev bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task, i) => (
                      <CalendarItem
                        key={task.id}
                        title={task.title || task.content}
                        time={task.time}
                        category={task.topic}
                        completed={task.isCompleted}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <TaskSheet
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        selectedDate={selectedDate}
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
        onDelete={(id: string) => handleDeleteTask(id)}
      />
    </div>
  );
}

function TaskDetailModal({ task, onClose, onEdit, onDelete }: any) {
  if (!task) return null;

  return (
    <Portal>
      <AnimatePresence>
        {task && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl animate-fade-in">
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
                      <CalendarIcon size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">GÖREV DETAYI</span>
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
                    <div className="w-full h-48 rounded-3xl overflow-hidden border border-[#1f2937]">
                      <img src={task.image} alt={task.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#10a37f]">
                      <Type size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Başlık</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#e5e7eb] leading-tight px-1">
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
                    <div className="bg-[#020617] p-6 rounded-[24px] border border-[#1f2937] text-sm text-[#e5e7eb] font-medium whitespace-pre-wrap leading-relaxed shadow-inner">
                      {task.content || "Detaylı açıklama bulunmuyor."}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-4.5 bg-[#10a37f] text-white font-bold rounded-[20px] shadow-xl shadow-[#10a37f]/10 text-xs uppercase tracking-[0.2em]"
                >
                  Anladım
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

function MonthlyCalendar({ selectedDate, onDateSelect, entries }: { selectedDate: Date, onDateSelect: any, entries: any[] }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 41)
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-4xl font-black tracking-tighter text-[#e5e7eb]">
            {format(currentMonth, "MMMM", { locale: tr })}
          </h3>
          <p className="text-xs font-bold text-[#10a37f] tracking-[0.3em] uppercase opacity-80">
            {format(currentMonth, "yyyy")}
          </p>
        </div>
        <div className="flex gap-3 bg-[#020617] border border-[#1f2937] p-2 rounded-[1.25rem] shadow-inner">
          <button onClick={prevMonth} className="w-11 h-11 rounded-xl flex items-center justify-center text-[#9ca3af] hover:bg-[#111827] hover:text-[#10a37f] transition-all border border-transparent hover:border-[#10a37f]/20 active:scale-90">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextMonth} className="w-11 h-11 rounded-xl flex items-center justify-center text-[#9ca3af] hover:bg-[#111827] hover:text-[#10a37f] transition-all border border-transparent hover:border-[#10a37f]/20 active:scale-90">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#1f2937] border border-[#1f2937] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/5">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
          <div key={d} className="bg-[#111827] text-center text-[10px] font-black text-[#9ca3af]/30 uppercase tracking-[0.25em] py-6 border-b border-[#1f2937]">
            {d}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const dayEntries = entries.filter((e: any) => isSameDay(new Date(e.date), day));
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={i}
              onClick={() => onDateSelect(day)}
              className={cn(
                "min-h-[160px] p-4 flex flex-col items-start transition-all bg-[#020617] hover:bg-[#111827] relative group border-[#1f2937]/20 border-r border-b",
                !isCurrentMonth && "opacity-20 pointer-events-none grayscale"
              )}
            >
              <div className={cn(
                "w-9 h-9 flex items-center justify-center rounded-xl text-md font-black transition-all mb-4",
                isSelected 
                  ? "bg-[#10a37f] text-white shadow-xl shadow-[#10a37f]/30 scale-110" 
                  : isToday 
                    ? "text-[#10a37f] bg-[#10a37f]/10 ring-1 ring-[#10a37f]/20" 
                    : "text-[#e5e7eb] group-hover:text-[#10a37f]"
              )}>
                {format(day, "d")}
              </div>

              <div className="flex flex-col gap-2 w-full overflow-hidden">
                {dayEntries.slice(0, 4).map((e: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "text-[11px] px-3 py-2.5 rounded-xl truncate w-full font-black border flex items-center gap-2.5 shadow-sm transition-transform hover:scale-[1.02]",
                      e.isCompleted 
                        ? "bg-[#1f2937]/50 text-[#9ca3af] border-transparent opacity-60" 
                        : "bg-[#10a37f]/20 text-[#10a37f] border-[#10a37f]/30"
                    )}
                  >
                    {e.image && <Camera size={12} className="shrink-0 text-[#10a37f]" />}
                    <span className="truncate tracking-tight flex-1 text-left">{e.title || e.content}</span>
                  </div>
                ))}
                {dayEntries.length > 4 && (
                  <p className="text-[10px] font-black text-[#10a37f] mt-1 ml-1 opacity-80 uppercase tracking-widest">
                    +{dayEntries.length - 4} FAZLA
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarItem({ title, time, category, completed, onClick }: { title: string, time?: string, category?: string, completed?: boolean, onClick?: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between p-6 bg-[#111827] border border-[#1f2937] rounded-[1.5rem] hover:border-[#10a37f]/40 hover:bg-[#111827]/80 transition-all cursor-pointer shadow-sm active:scale-[0.98] ring-1 ring-white/5",
        completed && "opacity-40"
      )}
    >
      <div className="flex items-center gap-5 min-w-0 flex-1">
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-[#1f2937] bg-[#020617] group-hover:border-[#10a37f]/30 transition-colors",
          "text-[#10a37f]"
        )}>
          <CheckCircle2 size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className={cn("text-sm font-black text-[#e5e7eb] truncate leading-tight group-hover:text-white transition-colors", completed && "line-through decoration-2")}>
            {title}
          </h4>
          <div className="flex items-center gap-4 mt-2 opacity-50">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-[#9ca3af]" />
              <span className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest">{time || "TÜM GÜN"}</span>
            </div>
            {category && (
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#10a37f]" />
                <span className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest">{category}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
