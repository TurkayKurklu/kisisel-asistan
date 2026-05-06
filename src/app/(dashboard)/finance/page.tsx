"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
  ArrowDownLeft,
  Calendar,
  Tag,
  FileText,
  X,
  Trash2,
  Edit2,
  TrendingUp,
  DollarSign,
  Euro,
  RefreshCw,
  LineChart as ChartIcon,
  Info,
  Fuel
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { getFinanceSummary, deleteTransaction } from "@/app/actions/finance";
import { getLatestRates, getExchangeHistory } from "@/app/actions/exchange";
import TransactionForm from "@/components/TransactionForm";
import DashboardHeader from "@/components/DashboardHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Portal from "@/components/Portal";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

type TabType = "maliye" | "ekonomi";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<TabType>("maliye");
  
  // Finance State
  const [summary, setSummary] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isFinanceLoading, setIsFinanceLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Economy State
  const [rates, setRates] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isEconomyLoading, setIsEconomyLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fuel Calculator State
  const [distance, setDistance] = useState<string>("");
  const [consumption, setConsumption] = useState<string>("");
  const [fuelPrice, setFuelPrice] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number | null>(null);

  const fetchFinanceData = useCallback(async () => {
    setIsFinanceLoading(true);
    try {
      const data = await getFinanceSummary();
      setSummary(data);
    } catch (error) {
      toast.error("Finans verileri yüklenirken bir hata oluştu.");
    } finally {
      setIsFinanceLoading(false);
    }
  }, []);

  const fetchExchangeData = useCallback(async () => {
    setIsEconomyLoading(true);
    try {
      const [rateRes, historyRes] = await Promise.all([
        getLatestRates(),
        getExchangeHistory()
      ]);

      if (rateRes.success) {
        setRates(rateRes);
        setLastUpdated(rateRes.date);
      }
      
      if (historyRes.success) {
        setHistory(historyRes.history);
      }
    } catch (error) {
      toast.error("Ekonomi verileri alınırken bir hata oluştu.");
    } finally {
      setIsEconomyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData();
    fetchExchangeData();
  }, [fetchFinanceData, fetchExchangeData]);

  // Fuel Calculation logic
  useEffect(() => {
    const dist = parseFloat(distance);
    const cons = parseFloat(consumption);
    const price = parseFloat(fuelPrice);

    if (!isNaN(dist) && !isNaN(cons) && !isNaN(price)) {
      setTotalCost((dist / 100) * cons * price);
    } else {
      setTotalCost(null);
    }
  }, [distance, consumption, fuelPrice]);

  const handleDelete = async (id: string) => {
    toast("İşlemi silmek istediğinize emin misiniz?", {
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteTransaction(id);
            toast.success("İşlem silindi.");
            if (selectedTransaction?.id === id) setSelectedTransaction(null);
            fetchFinanceData();
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
    <div className="space-y-6 animate-chat-fade pb-32">
      <DashboardHeader
        title={activeTab === "maliye" ? "Maliye" : "Ekonomi"}
        subtitle={activeTab === "maliye" ? "Mali durumunuzu takip edin." : "Anlık piyasa verileri ve yakıt hesaplama."}
        showSearch={false}
      />

      {/* Tab Switcher */}
      <div className="flex p-1 bg-[#111827] border border-[#1f2937] rounded-2xl w-fit mx-auto lg:mx-0">
        <button
          onClick={() => setActiveTab("maliye")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
            activeTab === "maliye" ? "bg-[#10a37f] text-white shadow-lg shadow-[#10a37f]/20" : "text-[#9ca3af] hover:text-white"
          )}
        >
          <Wallet size={14} /> Maliye
        </button>
        <button
          onClick={() => setActiveTab("ekonomi")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
            activeTab === "ekonomi" ? "bg-[#10a37f] text-white shadow-lg shadow-[#10a37f]/20" : "text-[#9ca3af] hover:text-white"
          )}
        >
          <TrendingUp size={14} /> Ekonomi
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "maliye" ? (
          <motion.div
            key="maliye"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column - Stats & Summary */}
            <div className="lg:col-span-4 space-y-6">
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
                {isFinanceLoading ? (
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
                    {filteredTransactions.map((t: any) => (
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
          </motion.div>
        ) : (
          <motion.div
            key="ekonomi"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Exchange Rates Section */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* USD Card */}
                <div className="bg-[#111827] border border-[#1f2937] p-8 rounded-[32px] relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <DollarSign size={180} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">ABD Doları</h3>
                        <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.2em]">USD / TRY</p>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#9ca3af]/30">₺</span>
                      <h2 className="text-6xl font-black tracking-tighter text-[#e5e7eb]">
                        {rates?.USD ? rates.USD.toFixed(3).replace('.', ',') : '---'}
                      </h2>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-[#1f2937]/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <TrendingUp size={14} />
                        <span className="text-xs font-bold font-mono">+1.05%</span>
                      </div>
                      <button 
                        onClick={fetchExchangeData}
                        className="p-2 bg-[#1f2937] rounded-xl text-[#9ca3af] hover:text-white transition-colors"
                      >
                        <RefreshCw size={14} className={isEconomyLoading ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* EUR Card */}
                <div className="bg-[#111827] border border-[#1f2937] p-8 rounded-[32px] relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Euro size={180} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Euro size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Euro</h3>
                        <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.2em]">EUR / TRY</p>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#9ca3af]/30">₺</span>
                      <h2 className="text-6xl font-black tracking-tighter text-[#e5e7eb]">
                        {rates?.EUR ? rates.EUR.toFixed(3).replace('.', ',') : '---'}
                      </h2>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#1f2937]/50 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[#9ca3af]">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                            lastUpdated === new Date().toISOString().split('T')[0] ? "bg-emerald-500" : "bg-amber-500")} 
                          />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {lastUpdated === new Date().toISOString().split('T')[0] ? 'Güncel Veri' : 'Dünkü Veri'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {lastUpdated ? format(new Date(lastUpdated), "d MMMM yyyy", { locale: tr }) : 'Yükleniyor...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-[#111827] border border-[#1f2937] rounded-[32px] p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <ChartIcon size={20} className="text-[#10a37f]" /> Piyasa Takibi
                    </h3>
                    <p className="text-sm text-[#9ca3af] mt-1">Son 7 günlük USD ve EUR değişimleri (₺ bazlı).</p>
                  </div>
                </div>

                <div className="h-[350px] w-full min-h-[350px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10a37f" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10a37f" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEur" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} opacity={0.5} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#4b5563" 
                        fontSize={11} 
                        fontWeight={600}
                        tickLine={false} 
                        axisLine={false}
                        dy={15}
                      />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={11} 
                        fontWeight={600}
                        tickLine={false} 
                        axisLine={false} 
                        domain={['dataMin - 0.5', 'dataMax + 0.5']}
                        dx={-10}
                        tickFormatter={(val) => `₺${val.toFixed(2)}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#020617', 
                          borderColor: '#1f2937', 
                          borderRadius: '20px',
                          fontSize: '12px',
                          color: '#fff',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                          padding: '12px 16px'
                        }}
                        itemStyle={{ padding: '4px 0', fontSize: '13px', fontWeight: 'bold' }}
                        cursor={{ stroke: '#1f2937', strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="USD" 
                        stroke="#10a37f" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorUsd)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10a37f' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="EUR" 
                        stroke="#3b82f6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorEur)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fuel Calculator Section */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#111827] border border-[#1f2937] rounded-[32px] overflow-hidden">
                <div className="p-8 border-b border-[#1f2937]">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#1f2937] flex items-center justify-center text-[#10a37f]">
                      <Fuel size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Yakıt Hesaplayıcı</h3>
                  </div>
                  <p className="text-xs text-[#9ca3af] font-medium leading-relaxed">
                    Yolculuk maliyetinizi hızlıca hesaplayın.
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest pl-1">Mesafe (km)</label>
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="Örn: 500"
                      className="w-full bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest pl-1">Tüketim (lt/100 km)</label>
                    <input
                      type="number"
                      value={consumption}
                      onChange={(e) => setConsumption(e.target.value)}
                      placeholder="Örn: 7.0"
                      className="w-full bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest pl-1">Birim Fiyat (TL/lt)</label>
                    <input
                      type="number"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(e.target.value)}
                      placeholder="Örn: 42.50"
                      className="w-full bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#10a37f]/50 transition-all placeholder:text-[#9ca3af]/20"
                    />
                  </div>

                  <div className="pt-6 border-t border-[#1f2937] mt-4">
                    <div className={cn(
                      "p-8 rounded-[32px] transition-all text-center",
                      totalCost !== null ? "bg-[#10a37f]/10 border border-[#10a37f]/20" : "bg-[#020617] border border-[#1f2937] opacity-40"
                    )}>
                      <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Toplam Tutar</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-xl font-bold text-[#9ca3af]/30">₺</span>
                        <h4 className="text-4xl font-black text-white tracking-tighter">
                          {totalCost !== null ? totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0,00"}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchFinanceData}
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

