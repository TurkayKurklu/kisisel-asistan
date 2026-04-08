"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ChevronRight,
  ArrowDownLeft,
  Calendar,
  Tag,
  FileText,
  X,
  Trash2,
  Edit2
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { getFinanceSummary, deleteTransaction } from "@/app/actions/finance";
import TransactionForm from "@/components/TransactionForm";
import DashboardHeader from "@/components/DashboardHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Portal from "@/components/Portal";

export default function FinancePage() {
  const [summary, setSummary] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFinanceSummary();
      setSummary(data);
    } catch (error) {
      toast.error("Finans verileri yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    toast("İşlemi silmek istediğinize emin misiniz?", {
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteTransaction(id);
            toast.success("İşlem silindi.");
            if (selectedTransaction?.id === id) setSelectedTransaction(null);
            fetchData();
          } catch (error) {
            toast.error("Silme işlemi başarısız oldu.");
          }
        },
      },
      cancel: { label: "İptal", onClick: () => { } }
    });
  };

  const filteredTransactions = summary?.transactions.filter((t: any) =>
    (t.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-10 animate-chat-fade pb-32">
      <DashboardHeader
        title="Maliye"
        subtitle="Mali durumunuzu takip edin."
        showSearch={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Stats & Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Balance Card */}
          <div className="bg-[#111827] border border-[#1f2937] p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet size={120} />
            </div>
            <div className="relative z-10 space-y-8">
              <div>
                <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] mb-2">Net Bakiye</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#9ca3af]/30">₺</span>
                  <h2 className="text-5xl font-bold tracking-tight text-[#e5e7eb]">
                    {summary?.balance.toLocaleString() || "0"}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-[#1f2937]/50">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-[#9ca3af] uppercase tracking-wider">Gelir</p>
                  <p className="text-lg font-bold text-emerald-500">₺{summary ? (summary.totalIncome / 1000).toFixed(1) : "0"}k</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-[#9ca3af] uppercase tracking-wider">Gider</p>
                  <p className="text-lg font-bold text-rose-400">₺{summary ? (summary.totalExpense / 1000).toFixed(1) : "0"}k</p>
                </div>
              </div>

              <button
                onClick={() => { setEditData(null); setIsFormOpen(true); }}
                className="w-full py-4 bg-[#10a37f] hover:bg-[#10a37f]/90 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#10a37f]/20 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Yeni İşlem
              </button>
            </div>
          </div>

          {/* Stats Mini Cards - Grid used for stability */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <StatsMiniCard
              label="Haftalık Değişim"
              value={`+₺${(summary?.totalIncome * 0.12).toFixed(0)}`}
              trend="up"
              icon={TrendingUp}
            />
            <StatsMiniCard
              label="Bütçe Skoru"
              value="%84"
              trend="stable"
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Right Column - Transaction History */}
        <div className="lg:col-span-8 bg-[#111827] border border-[#1f2937] rounded-3xl overflow-hidden shadow-sm flex flex-col h-full min-h-[600px]">
          <div className="p-8 border-b border-[#1f2937] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#e5e7eb]">İşlem Geçmişi</h3>
              <div className="flex gap-2">
                <button className="p-2.5 bg-[#1f2937] border border-[#1f2937] rounded-xl text-[#9ca3af] hover:text-white transition-all">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]/40" size={18} />
              <input
                type="text"
                placeholder="İşlemlerde ara (başlık, açıklama, kategori)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#020617] border border-[#1f2937] rounded-2xl text-sm font-medium focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="space-y-4 p-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-[#1f2937] rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#1f2937] rounded-2xl flex items-center justify-center text-[#9ca3af]/20">
                  <Wallet size={32} />
                </div>
                <p className="text-sm font-bold text-[#9ca3af]/40 italic">Herhangi bir kayıt bulunamadı.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1f2937]">
                {filteredTransactions.map((t: any, i: number) => (
                  <TransactionItem
                    key={t.id}
                    transaction={t}
                    onClick={() => setSelectedTransaction(t)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchData}
        editData={editData}
      />

      {/* Transaction Detail Modal */}
      <DetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onEdit={(data: any) => {
          setSelectedTransaction(null);
          setEditData(data);
          setIsFormOpen(true);
        }}
        onDelete={(id: string) => handleDelete(id)}
      />
    </div>
  );
}

function TransactionItem({ transaction, onClick }: any) {
  const isIncome = transaction.type === "INCOME";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="flex items-center justify-between p-6 hover:bg-[#1f2937]/50 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-5 min-w-0">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-[#1f2937] shadow-sm",
          isIncome ? "text-emerald-500 bg-emerald-500/5" : "text-rose-500 bg-rose-500/5 shadow-rose-500/5"
        )}>
          {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
        </div>
        <div className="min-w-0">
          <h4 className="text-md font-bold text-[#e5e7eb] group-hover:text-white transition-colors truncate">
            {transaction.title || transaction.description}
          </h4>
          <div className="flex items-center gap-3 mt-1.5 opacity-60">
            <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">{transaction.category}</span>
            <div className="w-1 h-1 rounded-full bg-[#1f2937]" />
            <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">
              {format(new Date(transaction.date), "d MMM yyyy", { locale: tr })}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className={cn(
          "text-lg font-bold tracking-tight",
          isIncome ? "text-emerald-500" : "text-[#e5e7eb]"
        )}>
          {isIncome ? "+" : "-"}{transaction.amount.toLocaleString()} ₺
        </p>
        <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-all">
          <span className="text-[9px] font-bold text-[#10a37f] uppercase tracking-widest">Detayı Gör</span>
          <ChevronRight size={12} className="text-[#10a37f]" />
        </div>
      </div>
    </motion.div>
  );
}

function DetailModal({ transaction, onClose, onEdit, onDelete }: any) {
  if (!transaction) return null;
  const isIncome = transaction.type === "INCOME";

  return (
    <Portal>
      <AnimatePresence>
        {transaction && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[480px] bg-[#111827] border border-[#1f2937] rounded-[32px] p-10 shadow-2xl relative overflow-hidden"
            >
              {/* Visual Background Decoration */}
              <div className={cn(
                "absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full",
                isIncome ? "bg-emerald-500" : "bg-rose-500"
              )} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className={cn(
                    "w-16 h-16 rounded-[24px] flex items-center justify-center text-white border",
                    isIncome ? "bg-emerald-500 border-emerald-400" : "bg-rose-500 border-rose-400"
                  )}>
                    {isIncome ? <ArrowDownLeft size={32} /> : <ArrowUpRight size={32} />}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => onEdit(transaction)} className="p-3 bg-[#1f2937] rounded-2xl text-[#9ca3af] hover:text-[#10a37f] transition-all">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => onDelete(transaction.id)} className="p-3 bg-[#1f2937] rounded-2xl text-[#9ca3af] hover:text-rose-500 transition-all">
                      <Trash2 size={20} />
                    </button>
                    <button onClick={onClose} className="p-3 bg-[#1f2937] rounded-2xl text-[#9ca3af] hover:text-white transition-all ml-2">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-[0.2em] opacity-40">İşlem Detayı</p>
                    <h2 className="text-3xl font-bold text-[#e5e7eb] tracking-tight">{transaction.title || "Adsız İşlem"}</h2>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-[#9ca3af]/40 mt-2">₺</span>
                    <h3 className={cn(
                      "text-6xl font-black tracking-tighter",
                      isIncome ? "text-emerald-500" : "text-[#e5e7eb]"
                    )}>
                      {transaction.amount.toLocaleString()}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-10 border-b border-[#1f2937]">
                    <DetailInfo icon={Tag} label="Kategori" value={transaction.category} />
                    <DetailInfo icon={Calendar} label="Tarih" value={format(new Date(transaction.date), "d MMMM yyyy", { locale: tr })} />
                  </div>

                  {transaction.description && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#9ca3af]">
                        <FileText size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Açıklama</span>
                      </div>
                      <p className="text-sm text-[#e5e7eb] leading-relaxed font-medium bg-[#020617] p-5 rounded-3xl border border-[#1f2937]">
                        {transaction.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

function DetailInfo({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-[#9ca3af]">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[9px] font-bold text-[#9ca3af]/40 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-[#e5e7eb]">{value}</p>
      </div>
    </div>
  );
}

function StatsMiniCard({ label, value, trend, icon: Icon }: any) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-3xl flex items-center justify-between group hover:border-[#10a37f]/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-[#10a37f] border border-[#1f2937]">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-xl font-bold text-[#e5e7eb] tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
