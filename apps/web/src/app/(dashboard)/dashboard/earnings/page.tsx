"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, TrendingUp, Search, Trash2, Calendar, Car as CarIcon, DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { SlideOver } from "@/components/shared/SlideOver";
import { EmptyState } from "@/components/shared/EmptyState";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@antigravity/utils";
import { EarningSource } from "@antigravity/types";
import { startOfMonth, endOfMonth, format } from "date-fns";

type Tab = "total" | "by-car";

function EarningForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: carsData } = useQuery({ queryKey: ["cars"], queryFn: () => api.get("/api/v1/cars?limit=100").then(r => r.data) });
  const { data: customersData } = useQuery({ queryKey: ["customers"], queryFn: () => api.get("/api/v1/customers?limit=100").then(r => r.data) });
  const [form, setForm] = useState({ carId: "", source: "BOOKING" as EarningSource, amountPaise: "", date: new Date().toISOString().split("T")[0], customerId: "", description: "", tripKm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carId || !form.amountPaise) return toast.error("Car and amount are required");
    setLoading(true);
    try {
      await api.post("/api/v1/earnings", { ...form, amountPaise: Math.round(parseFloat(form.amountPaise) * 100), date: new Date(form.date).toISOString(), tripKm: form.tripKm ? parseFloat(form.tripKm) : undefined, customerId: form.customerId || undefined });
      toast.success("Earning recorded");
      onSuccess();
    } catch (e: any) { toast.error(e.response?.data?.error ?? "Failed to add earning"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <div>
        <label className="label">Vehicle *</label>
        <select className="input" value={form.carId} onChange={e => setForm(f => ({ ...f, carId: e.target.value }))}>
          <option value="">Select vehicle</option>
          {carsData?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.registrationNumber} — {c.make} {c.model}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Source *</label>
          <select className="input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value as EarningSource }))}>
            {Object.values(EarningSource).map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Amount (₹) *</label>
          <input type="number" step="0.01" placeholder="0.00" className="input" value={form.amountPaise} onChange={e => setForm(f => ({ ...f, amountPaise: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date *</label>
          <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label className="label">Trip KM</label>
          <input type="number" step="0.1" placeholder="e.g. 150" className="input" value={form.tripKm} onChange={e => setForm(f => ({ ...f, tripKm: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="label">Customer</label>
        <select className="input" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}>
          <option value="">Walk-in / No customer</option>
          {customersData?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
        </select>
      </div>
      <div>
        <label className="label">Description</label>
        <input type="text" placeholder="Trip details..." className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Record Earning"}
      </button>
    </form>
  );
}

export default function EarningsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("total");
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  // --- Queries ---
  const { data: earningsList, isLoading: isTableLoading } = useQuery({
    queryKey: ["earnings", search, startDate, endDate],
    queryFn: () => api.get(`/api/v1/earnings?limit=100&search=${search}&startDate=${startDate}&endDate=${endDate}`).then(r => r.data),
    enabled: activeTab === "total",
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["earnings-summary", startDate, endDate],
    queryFn: () => api.get(`/api/v1/earnings/summary?startDate=${startDate}&endDate=${endDate}`).then(r => r.data.data),
    enabled: activeTab === "total",
  });

  const { data: fleetPnlData, isLoading: isPnlLoading } = useQuery({
    queryKey: ["reports-fleet-pnl", startDate, endDate],
    queryFn: () => api.get(`/api/v1/reports/fleet-pnl?startDate=${startDate}&endDate=${endDate}`).then(r => r.data.data),
    enabled: activeTab === "by-car",
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/earnings/${id}`),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["earnings"] }); 
      qc.invalidateQueries({ queryKey: ["earnings-summary"] }); 
      qc.invalidateQueries({ queryKey: ["reports-fleet-pnl"] });
      toast.success("Earning deleted"); 
    },
  });

  const earnings = earningsList?.data ?? [];
  const carEarnings = fleetPnlData?.cars ?? [];

  return (
    <div className="flex-1 overflow-y-auto bg-bg-main pb-20">
      <Header title="Earnings" subtitle="Revenue across your fleet" />
      
      <div className="p-6 space-y-6">
        {/* Top Controls: Tabs & Date Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/5 pb-6">
          <div className="bg-bg-elevated/50 p-1 rounded-xl flex gap-1 w-fit">
            <button 
              onClick={() => setActiveTab("total")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "total" ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              Total Earning
            </button>
            <button 
              onClick={() => setActiveTab("by-car")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "by-car" ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              Earning by Car
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-bg-elevated rounded-xl border border-white/5">
              <Calendar className="w-4 h-4 text-brand-400" />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none text-xs text-white focus:ring-0 w-28 p-0" />
              <span className="text-slate-600">—</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none text-xs text-white focus:ring-0 w-28 p-0" />
            </div>
            <button onClick={() => setAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Record Earning
            </button>
          </div>
        </div>

        {activeTab === "total" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Summary strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isSummaryLoading && [...Array(4)].map((_, i) => <div key={i} className="h-24 card animate-pulse bg-white/5" />)}
              {!isSummaryLoading && summaryData?.bySource?.map((s: any) => (
                <div key={s.source} className="card p-5 group hover:border-brand-500/30 transition-all">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{s.source.replace(/_/g, " ")}</p>
                  <p className="text-xl font-bold font-display text-white mt-2">{formatCurrency(Number(s._sum?.amountPaise ?? 0))}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <p className="text-xs text-slate-500 leading-none">{s._count} entries</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search registrations or customers..." className="input pl-10" />
              </div>
            </div>

            <div className="card overflow-hidden border-brand-500/5">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Periodic Earnings</h3>
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Date</th><th>Vehicle</th><th>Source</th><th>Customer</th><th>Trip KM</th><th className="text-right">Amount</th><th></th></tr>
                  </thead>
                  <tbody>
                    {isTableLoading && [...Array(6)].map((_, i) => <tr key={i}><td colSpan={7}><div className="h-4 bg-white/5 rounded animate-pulse m-2" /></td></tr>)}
                    {!isTableLoading && earnings.map((e: any) => (
                      <tr key={e.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="font-mono text-[10px] text-slate-500">{formatDate(e.date)}</td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-white">{e.car?.registrationNumber}</span>
                            <span className="text-[10px] text-slate-500">{e.car?.make} {e.car?.model}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/5 inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-400 capitalize`}>
                            {e.source.toLowerCase().replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500 truncate max-w-[150px]">{e.customer?.name ?? "Walk-in"}</td>
                        <td className="font-mono text-xs text-slate-400">{e.tripKm ? `${parseFloat(e.tripKm).toFixed(0)} km` : "—"}</td>
                        <td className="text-right font-mono font-bold text-success-400">{formatCurrency(Number(e.amountPaise))}</td>
                        <td>
                          <button onClick={() => deleteMutation.mutate(e.id)} className="btn-ghost btn-icon btn-sm opacity-0 group-hover:opacity-100 transition-all text-danger hover:bg-danger/10 p-1.5 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!isTableLoading && earnings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-20">
                          <EmptyState 
                            icon={TrendingUp}
                            title="No earnings found"
                            description="We couldn't find any revenue entries for the selected date range and search criteria."
                            actionText="Record your first earning"
                            onAction={() => setAddOpen(true)}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Earning By Car Tab */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {isPnlLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(6)].map((_, i) => <div key={i} className="h-44 card animate-pulse bg-white/5" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {carEarnings.map((car: any) => (
                  <div key={car.carId} className="card group hover:border-brand-500/30 transition-all overflow-hidden">
                    <div className="p-5 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-success-500/10 flex items-center justify-center text-success-400 ring-1 ring-success-500/20 group-hover:bg-success-500 group-hover:text-white transition-all duration-300">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-slate-400 group-hover:border-brand-500/20 transition-all">
                          {car.registrationNumber}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-slate-400 text-xs font-medium">{car.make} {car.model}</h4>
                        <div className="mt-2 flex flex-col">
                          <span className="text-2xl font-display font-bold text-white tracking-tight">
                            {formatCurrency(car.revenuePaise, { compact: false })}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Total periodic revenue</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-success-500 transition-all duration-1000" 
                            style={{ width: `${Math.min((car.revenuePaise / (fleetPnlData.totalRevenuePaise || 1)) * 100, 100)}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 ml-3 whitespace-nowrap">
                          {((car.revenuePaise / (fleetPnlData.totalRevenuePaise || 1)) * 100).toFixed(0)}% share
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {carEarnings.length === 0 && (
                  <div className="col-span-full py-20">
                    <EmptyState 
                      icon={CarIcon}
                      title="No vehicle data"
                      description="Add vehicles to your fleet to start tracking their individual revenue share and performance."
                      actionText="Add your first car"
                      actionHref="/dashboard/cars"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <SlideOver open={addOpen} onClose={() => setAddOpen(false)} title="Record Earning">
        <EarningForm onSuccess={() => { 
          setAddOpen(false); 
          qc.invalidateQueries({ queryKey: ["earnings"] }); 
          qc.invalidateQueries({ queryKey: ["earnings-summary"] }); 
          qc.invalidateQueries({ queryKey: ["reports-fleet-pnl"] });
        }} />
      </SlideOver>
    </div>
  );
}
