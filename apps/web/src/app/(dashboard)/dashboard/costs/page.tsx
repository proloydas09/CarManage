"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, DollarSign, Search, Trash2, ChevronDown, Calendar, Car as CarIcon, ArrowRight, PieChart as ChartIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { SlideOver } from "@/components/shared/SlideOver";
import { EmptyState } from "@/components/shared/EmptyState";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@antigravity/utils";
import { CostCategory } from "@antigravity/types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { startOfMonth, endOfMonth, format } from "date-fns";

const CATEGORY_COLORS: Record<string, string> = {
  FUEL: "#6366f1", MAINTENANCE: "#f59e0b", INSURANCE: "#10b981",
  EMI: "#3b82f6", DRIVER_SALARY: "#8b5cf6", TOLL: "#ec4899",
  PERMIT: "#14b8a6", TAX: "#f97316", CLEANING: "#84cc16",
  TYRE: "#06b6d4", SPARE_PARTS: "#a855f7", OTHER: "#64748b",
};

type Tab = "total" | "by-car";

function CostForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: carsData } = useQuery({ queryKey: ["cars"], queryFn: () => api.get("/api/v1/cars?limit=100").then(r => r.data) });
  const [form, setForm] = useState({ carId: "", category: "FUEL" as CostCategory, amountPaise: "", date: new Date().toISOString().split("T")[0], description: "", vendorName: "", isRecurring: false, recurringDay: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carId || !form.amountPaise) return toast.error("Car and amount are required");
    setLoading(true);
    try {
      await api.post("/api/v1/costs", { ...form, amountPaise: Math.round(parseFloat(form.amountPaise) * 100), date: new Date(form.date).toISOString(), recurringDay: form.recurringDay ? parseInt(form.recurringDay) : undefined });
      toast.success("Cost added");
      onSuccess();
    } catch (e: any) { toast.error(e.response?.data?.error ?? "Failed to add cost"); }
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
          <label className="label">Category *</label>
          <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as CostCategory }))}>
            {Object.values(CostCategory).map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Amount (₹) *</label>
          <input type="number" step="0.01" placeholder="0.00" className="input" value={form.amountPaise} onChange={e => setForm(f => ({ ...f, amountPaise: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="label">Date *</label>
        <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
      </div>
      <div>
        <label className="label">Description</label>
        <input type="text" placeholder="Service details..." className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div>
        <label className="label">Vendor / Supplier</label>
        <input type="text" placeholder="e.g. Sharma Garage" className="input" value={form.vendorName} onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))} />
      </div>
      <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-xl">
        <input type="checkbox" id="recurring" className="w-4 h-4 accent-brand-500" checked={form.isRecurring} onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))} />
        <label htmlFor="recurring" className="text-sm text-slate-300 cursor-pointer">Recurring monthly cost</label>
        {form.isRecurring && (
          <input type="number" min={1} max={31} placeholder="Day" className="input w-20 ml-auto" value={form.recurringDay} onChange={e => setForm(f => ({ ...f, recurringDay: e.target.value }))} />
        )}
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Add Cost"}
      </button>
    </form>
  );
}

export default function CostsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("total");
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  // --- Queries ---
  const { data: costsList, isLoading: isTableLoading } = useQuery({
    queryKey: ["costs", search, startDate, endDate],
    queryFn: () => api.get(`/api/v1/costs?limit=100&search=${search}&startDate=${startDate}&endDate=${endDate}`).then(r => r.data),
    enabled: activeTab === "total",
  });

  const { data: summaryData } = useQuery({
    queryKey: ["costs-summary", startDate, endDate],
    queryFn: () => api.get(`/api/v1/costs/summary?startDate=${startDate}&endDate=${endDate}`).then(r => r.data.data),
    enabled: activeTab === "total",
  });

  const { data: fleetPnlData, isLoading: isPnlLoading } = useQuery({
    queryKey: ["reports-fleet-pnl", startDate, endDate],
    queryFn: () => api.get(`/api/v1/reports/fleet-pnl?startDate=${startDate}&endDate=${endDate}`).then(r => r.data.data),
    enabled: activeTab === "by-car",
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/costs/${id}`),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["costs"] }); 
      qc.invalidateQueries({ queryKey: ["costs-summary"] }); 
      qc.invalidateQueries({ queryKey: ["reports-fleet-pnl"] });
      toast.success("Cost deleted"); 
    },
  });

  const costs = costsList?.data ?? [];
  const summary = (summaryData ?? []).map((s: any) => ({ name: s.category, value: Number(s._sum.amountPaise ?? 0), color: CATEGORY_COLORS[s.category] ?? "#64748b" }));
  const carCosts = fleetPnlData?.cars ?? [];

  return (
    <div className="flex-1 overflow-y-auto bg-bg-main pb-20">
      <Header title="Costs" subtitle="Track all vehicle expenses" />
      
      <div className="p-6 space-y-6">
        {/* Top Controls: Tabs & Date Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/5 pb-6">
          <div className="bg-bg-elevated/50 p-1 rounded-xl flex gap-1 w-fit">
            <button 
              onClick={() => setActiveTab("total")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "total" ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              Total Cost
            </button>
            <button 
              onClick={() => setActiveTab("by-car")}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "by-car" ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              Cost by Car
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
              <Plus className="w-4 h-4" /> Add Cost
            </button>
          </div>
        </div>

        {activeTab === "total" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendor or description..." className="input pl-10" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Donut Chart */}
              <div className="card p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white font-display text-sm mb-6 flex items-center gap-2">
                    <ChartIcon className="w-4 h-4 text-brand-400" /> Cost Breakdown
                  </h3>
                  {summary.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie aria-label="Cost share" data={summary} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                            {summary.map((s: any, i: number) => <Cell key={i} fill={s.color} className="stroke-none" />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: "#1a1d26", border: "1px solid #2a2f45", borderRadius: "12px", fontSize: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-4">
                        {summary.slice(0, 5).map((s: any) => (
                          <div key={s.name} className="flex items-center justify-between text-xs px-1">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full ring-2 ring-white/5" style={{ background: s.color }} />
                              <span className="text-slate-400 capitalize">{s.name.toLowerCase().replace("_", " ")}</span>
                            </div>
                            <span className="text-white font-mono">{formatCurrency(s.value, { compact: true })}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-30">
                      <ChartIcon className="w-12 h-12 mb-2" />
                      <p className="text-xs">No data for chart</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Costs Table */}
              <div className={`card overflow-hidden lg:col-span-2 border-brand-500/5`}>
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
                  <FileText className="w-4 h-4 text-slate-500" />
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th><th>Vehicle</th><th>Category</th><th>Vendor</th><th className="text-right">Amount</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {isTableLoading && [...Array(5)].map((_, i) => (
                        <tr key={i}><td colSpan={6}><div className="h-4 bg-white/5 rounded animate-pulse m-2" /></td></tr>
                      ))}
                      {!isTableLoading && costs.map((cost: any) => (
                        <tr key={cost.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="font-mono text-[10px] text-slate-500">{formatDate(cost.date)}</td>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-mono text-xs text-white">{cost.car?.registrationNumber}</span>
                              <span className="text-[10px] text-slate-500">{cost.car?.make} {cost.car?.model}</span>
                            </div>
                          </td>
                          <td>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/5 inline-flex items-center gap-1.5" style={{ color: CATEGORY_COLORS[cost.category], background: `${CATEGORY_COLORS[cost.category]}10` }}>
                              <div className="w-1 h-1 rounded-full" style={{ background: CATEGORY_COLORS[cost.category] }} />
                              {cost.category.replace("_", " ")}
                            </span>
                          </td>
                          <td className="text-xs text-slate-500 truncate max-w-[120px]">{cost.vendorName ?? "—"}</td>
                          <td className="text-right font-mono font-medium text-white">{formatCurrency(Number(cost.amountPaise))}</td>
                          <td>
                            <button onClick={() => deleteMutation.mutate(cost.id)} className="btn-ghost btn-icon btn-sm opacity-0 group-hover:opacity-100 transition-all text-danger hover:bg-danger/10 p-1.5 rounded-lg">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!isTableLoading && costs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-20">
                            <EmptyState 
                              icon={FileText}
                              title="No costs found"
                              description="We couldn't find any transactions for the selected date range and search criteria."
                              actionText="Add your first cost"
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
          </div>
        ) : (
          /* Cost By Car Tab */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {isPnlLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(6)].map((_, i) => <div key={i} className="h-44 card animate-pulse bg-white/5" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {carCosts.map((car: any) => (
                  <div key={car.carId} className="card group hover:border-brand-500/30 transition-all overflow-hidden">
                    <div className="p-5 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 ring-1 ring-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                          <CarIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-slate-400 group-hover:border-brand-500/20 transition-all">
                          {car.registrationNumber}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-slate-400 text-xs font-medium">{car.make} {car.model}</h4>
                        <div className="mt-2 flex flex-col">
                          <span className="text-2xl font-display font-bold text-white tracking-tight">
                            {formatCurrency(car.costPaise, { compact: false })}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Total periodic cost</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-500 transition-all duration-1000" 
                            style={{ width: `${Math.min((car.costPaise / (fleetPnlData.totalCostPaise || 1)) * 100, 100)}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 ml-3 whitespace-nowrap">
                          {((car.costPaise / (fleetPnlData.totalCostPaise || 1)) * 100).toFixed(0)}% share
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {carCosts.length === 0 && (
                  <div className="col-span-full py-20">
                    <EmptyState 
                      icon={CarIcon}
                      title="No vehicle data"
                      description="Add vehicles to your fleet to start tracking their individual costs and performance."
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

      <SlideOver open={addOpen} onClose={() => setAddOpen(false)} title="Add Cost">
        <CostForm onSuccess={() => { 
          setAddOpen(false); 
          qc.invalidateQueries({ queryKey: ["costs"] }); 
          qc.invalidateQueries({ queryKey: ["costs-summary"] }); 
          qc.invalidateQueries({ queryKey: ["reports-fleet-pnl"] });
        }} />
      </SlideOver>
    </div>
  );
}
