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
  Sparkles,
  Inbox,
  Loader2,
  ChevronDown,
  X,
  Edit2,
  Type,
  AlignLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getEvents, addEvent, deleteEvent } from "@/app/actions/events";
import { getTasks, deleteTask, toggleTask } from "@/app/actions/tasks";
import TaskSheet from "@/components/TaskSheet";
import DashboardHeader from "@/components/DashboardHeader";
import { toast } from "sonner";
import Portal from "@/components/Portal";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editTaskData, setEditTaskData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).openTaskSheet = () => {
        setEditTaskData(null);
        setIsAddTaskOpen(true);
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).openTaskSheet;
      }
    };
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [eventData, taskData] = await Promise.all([
        getEvents(),
        getTasks()
      ]);
      setEvents(eventData);
      setTasks(taskData);
    } catch (error) {
      toast.error("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEvents = events.filter(e => isSameDay(new Date(e.date), selectedDate));
  const filteredTasks = tasks.filter(t => isSameDay(new Date(t.date), selectedDate));

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const time = formData.get("time") as string;
    const category = formData.get("category") as string;
    
    if (!title.trim()) {
      toast.error("Lütfen bir etkinlik başlığı girin.");
      return;
    }
    
    setIsPending(true);
    try {
      await addEvent(title, selectedDate, time, category);
      setIsAddEventOpen(false);
      toast.success("Etkinlik başarıyla eklendi.");
      fetchData();
    } catch (error) {
      toast.error("Etkinlik eklenemedi.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    toast("Etkinliği silmek istediğinize emin misiniz?", {
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteEvent(id);
            toast.success("Etkinlik silindi.");
            fetchData();
          } catch (error) {
            toast.error("Silme işlemi başarısız oldu.");
          }
        },
      },
      cancel: { label: "İptal", onClick: () => {} }
    });
  };

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
      cancel: { label: "İptal", onClick: () => {} }
    });
  };

  return (
    <div className="space-y-10 animate-chat-fade">
      <DashboardHeader 
        title="Takvim" 
        subtitle="Planlarınızı ChatGPT sessizliğinde organize edin."
        showSearch={false}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 pb-32">
        {/* Monthly Calendar Grid */}
        <section className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-[#111827] border border-[#1f2937] p-8 rounded-2xl shadow-sm">
             <MonthlyCalendar 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate} 
                entries={[...tasks, ...events]} 
              />
          </div>
        </section>

        {/* Day Details & Actions */}
        <section className="xl:col-span-4 space-y-6">
          <div className="bg-[#020617] border border-[#1f2937] rounded-3xl p-8 space-y-8 min-h-[500px] flex flex-col">
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] opacity-40">Seçili Gün</p>
              <h3 className="text-2xl font-bold tracking-tight text-[#e5e7eb]">
                {format(selectedDate, "d MMMM yyyy", { locale: tr })}
              </h3>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddEventOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#10a37f] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#10a37f]/10"
              >
                <Sparkles size={14} /> Etkinlik
              </button>
              <button 
                onClick={() => { setEditTaskData(null); setIsAddTaskOpen(true); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1f2937] border border-[#1f2937] text-white rounded-xl text-xs font-bold hover:bg-[#111827] transition-all"
              >
                <Plus size={14} /> Görev
              </button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
              {/* Daily Events */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-[#10a37f] uppercase tracking-widest px-1">
                   ETKİNLİKLER ({filteredEvents.length})
                </h4>
                {filteredEvents.length === 0 ? (
                  <p className="text-[10px] text-[#9ca3af]/40 italic py-4 text-center border-t border-[#1f2937]">Kayıtlı uygulama yok.</p>
                ) : (
                  filteredEvents.map((event, i) => (
                    <CalendarItem 
                      key={event.id} 
                      title={event.title} 
                      time={event.time} 
                      category={event.category} 
                      onDelete={() => handleDeleteEvent(event.id)}
                      index={i}
                      type="event"
                    />
                  ))
                )}
              </div>

              {/* Daily Tasks */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-[#10a37f] uppercase tracking-widest px-1">
                  GÖREVLER ({filteredTasks.length})
                </h4>
                {filteredTasks.length === 0 ? (
                  <p className="text-[10px] text-[#9ca3af]/40 italic py-4 text-center border-t border-[#1f2937]">Kayıtlı görev yok.</p>
                ) : (
                  filteredTasks.map((task, i) => (
                    <CalendarItem 
                      key={task.id} 
                      title={task.title || task.content} 
                      time={task.time} 
                      category={task.topic} 
                      completed={task.isCompleted}
                      onClick={() => setSelectedTask(task)}
                      index={i}
                      type="task"
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <Portal>
        <AnimatePresence>
          {isAddEventOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl animate-fade-in">
               <motion.div
                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 10 }}
                 className="w-full max-w-[420px] bg-[#111827] border border-[#1f2937] rounded-3xl z-10 p-8 shadow-2xl relative"
               >
                 <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-[#10a37f]">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#e5e7eb]">Yeni Etkinlik</h2>
                      <p className="text-[9px] text-[#9ca3af] uppercase font-bold tracking-[0.2em] mt-0.5">Takvim Planlaması</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddEventOpen(false)} className="p-2.5 text-[#9ca3af] hover:text-[#e5e7eb] bg-[#1f2937] rounded-xl">
                    <X size={18} />
                  </button>
                 </div>

                 <form onSubmit={handleAddEvent} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">Etkinlik Adı</label>
                       <input
                         name="title"
                         placeholder="Neler yapacaksın?"
                         autoFocus
                         className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-4 text-md font-bold text-[#e5e7eb] placeholder-[#9ca3af]/20 focus:outline-none focus:border-[#10a37f]/50 transition-all font-bold"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">Zaman</label>
                        <input
                          name="time"
                          type="time"
                          defaultValue="12:00"
                          className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3.5 text-sm font-bold text-[#e5e7eb] focus:outline-none appearance-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest ml-1 opacity-60">Kategori</label>
                        <div className="relative">
                          <select
                            name="category"
                            className="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3.5 text-sm font-bold text-[#e5e7eb] focus:outline-none appearance-none pr-8"
                          >
                            <option value="İş">İş</option>
                            <option value="Kişisel">Kişisel</option>
                            <option value="Sağlık">Sağlık</option>
                            <option value="Sosyal">Sosyal</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]/30 pointer-events-none" size={16} />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-[#10a37f] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#10a37f]/10 hover:opacity-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest mt-2"
                    >
                      {isPending ? <Loader2 className="animate-spin" size={16} /> : "Kaydet"}
                    </button>
                 </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

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
        onEdit={(task) => {
          setSelectedTask(null);
          setEditTaskData(task);
          setIsAddTaskOpen(true);
        }}
        onDelete={(id) => handleDeleteTask(id)}
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
                            <Sparkles size={20} />
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
                         <div className="bg-[#020617] p-6 rounded-[24px] border border-[#1f2937] text-sm text-[#e5e7eb] leading-relaxed font-medium whitespace-pre-wrap">
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

function MonthlyCalendar({ selectedDate, onDateSelect, entries }: any) {
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-[#e5e7eb]">
          {format(currentMonth, "MMMM yyyy", { locale: tr })}
        </h3>
        <div className="flex gap-1.5 bg-[#1f2937] p-1 rounded-lg">
           <button onClick={prevMonth} className="w-8 h-8 rounded-md flex items-center justify-center text-[#9ca3af] hover:bg-[#111827] hover:text-white transition-all">
             <ChevronLeft size={18} />
           </button>
           <button onClick={nextMonth} className="w-8 h-8 rounded-md flex items-center justify-center text-[#9ca3af] hover:bg-[#111827] hover:text-white transition-all">
             <ChevronRight size={18} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#1f2937] border border-[#1f2937] rounded-2xl overflow-hidden">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
          <div key={d} className="bg-[#111827] text-center text-[9px] font-bold text-[#9ca3af]/30 uppercase tracking-[0.2em] py-4">
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
              onClick={() => {
                onDateSelect(day);
                if (window && (window as any).openTaskSheet) {
                  (window as any).openTaskSheet();
                }
              }}
              className={cn(
                "h-20 sm:h-28 p-2 flex flex-col items-center justify-center transition-all bg-[#111827] hover:bg-[#1f2937]/50 relative",
                !isCurrentMonth && "opacity-10 pointer-events-none"
              )}
            >
              <div className={cn(
                "w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl text-md sm:text-lg font-bold transition-all",
                isSelected ? "bg-[#10a37f] text-white shadow-lg shadow-[#10a37f]/20" : isToday ? "text-[#10a37f] bg-[#10a37f]/10" : "text-[#e5e7eb]"
              )}>
                {format(day, "d")}
              </div>
              
              <div className="flex flex-wrap gap-1 justify-center mt-2 min-h-[4px]">
                {dayEntries.slice(0, 3).map((e: any, idx: number) => (
                   <div key={idx} className={cn(
                      "w-1 h-1 rounded-full",
                      isSelected ? "bg-white" : (e.amount !== undefined ? "bg-rose-500" : "bg-[#10a37f]")
                   )} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarItem({ title, time, category, completed, onDelete, onClick, index, type }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between p-4 bg-[#111827] border border-[#1f2937] rounded-xl hover:border-[#10a37f]/20 transition-all cursor-pointer",
        completed && "opacity-40"
      )}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-[#1f2937]",
          type === 'event' ? "text-emerald-500" : "text-[#10a37f]"
        )}>
          {type === 'event' ? <CalendarIcon size={16} /> : <CheckCircle2 size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className={cn("text-sm font-bold text-[#e5e7eb] truncate leading-tight", completed && "line-through decoration-1")}>
            {title}
          </h4>
          <div className="flex items-center gap-3 mt-1.5 opacity-60">
             <div className="flex items-center gap-1">
                <Clock size={10} className="text-[#9ca3af]" />
                <span className="text-[9px] font-bold text-[#9ca3af] uppercase">{time || "Tüm Gün"}</span>
             </div>
             {category && (
               <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-[#1f2937]" />
                  <span className="text-[9px] font-bold text-[#9ca3af] uppercase">{category}</span>
               </div>
             )}
          </div>
        </div>
      </div>
      
      {onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 text-[#9ca3af]/40 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      )}
    </motion.div>
  );
}
