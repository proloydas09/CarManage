"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart3, TrendingUp, PieChart as PieIcon, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { Header } from "@/components/layout/Header";
import api from "@/lib/api";
import { formatCurrency } from "@antigravity/utils";

const TABS = ["Fleet P&L", "Monthly Trend", "Cost Breakdown", "Car Comparison"];

const CATEGORY_COLORS: Record<string, string> = {
  FUEL: "#6366f1", MAINTENANCE: "#f59e0b", INSURANCE: "#10b981", EMI: "#3b82f6",
  DRIVER_SALARY: "#8b5cf6", TOLL: "#ec4899", PERMIT: "#14b8a6", TAX: "#f97316",
  CLEANING: "#84cc16", TYRE: "#06b6d4", SPARE_PARTS: "#a855f7", OTHER: "#64748b",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-xs space-y-1 shadow-xl">
      <p className="text-slate-400 font-medium">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>)}
    </div>
  );
};

export default function ReportsPage() {
  const [tab, setTab] = useState(0);

  const { data: fleetPnl } = useQuery({ queryKey: ["fleet-pnl"], queryFn: () => api.get("/api/v1/reports/fleet-pnl").then(r => r.data.data) });
  const { data: trendData } = useQuery({ queryKey: ["monthly-trend-12"], queryFn: () => api.get("/api/v1/reports/monthly-trend?months=12").then(r => r.data.data) });
  const { data: costBreakdown } = useQuery({ queryKey: ["cost-breakdown"], queryFn: () => api.get("/api/v1/reports/cost-breakdown").then(r => r.data.data) });

  const chartTrend = (trendData ?? []).map((m: any) => ({ name: m.label, Revenue: m.revenuePaise, Costs: m.costPaise, Profit: m.netProfitPaise }));
  const chartCars = (fleetPnl?.cars ?? []).map((c: any) => ({ name: `${c.make.slice(0,4)} ${c.registrationNumber.slice(-4)}`, Revenue: c.revenuePaise, Costs: c.costPaise, Profit: c.netProfitPaise }));
  const pieCosts = (costBreakdown ?? []).map((c: any) => ({ name: c.category, value: c.amountPaise, color: CATEGORY_COLORS[c.category] ?? "#64748b" }));

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Reports" subtitle="Financial analytics and insights" />
      <div className="p-6 space-y-5">
        {/* Tab bar */}
        <div className="flex gap-2 border-b border-bg-border pb-0">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${i === tab ? "border-brand-500 text-brand-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Fleet P&L */}
        {tab === 0 && (
          <div className="space-y-5">
            {fleetPnl && (
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
                  <p className="text-xl font-bold font-mono text-white">{formatCurrency(fleetPnl.totalRevenuePaise)}</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">Total Costs</p>
                  <p className="text-xl font-bold font-mono text-danger">{formatCurrency(fleetPnl.totalCostPaise)}</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">Net Profit</p>
                  <p className={`text-xl font-bold font-mono ${fleetPnl.netProfitPaise >= 0 ? "text-success" : "text-danger"}`}>{formatCurrency(fleetPnl.netProfitPaise)}</p>
                </div>
              </div>
            )}
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead><tr><th>Vehicle</th><th className="text-right">Revenue</th><th className="text-right">Costs</th><th className="text-right">Net Profit</th><th className="text-right">Margin</th></tr></thead>
                <tbody>
                  {(fleetPnl?.cars ?? []).map((c: any) => (
                    <tr key={c.carId}>
                      <td><div><p className="font-mono text-xs">{c.registrationNumber}</p><p className="text-[11px] text-slate-500">{c.make} {c.model}</p></div></td>
                      <td className="text-right font-mono font-medium">{formatCurrency(c.revenuePaise)}</td>
                      <td className="text-right font-mono text-danger">{formatCurrency(c.costPaise)}</td>
                      <td className={`text-right font-mono font-bold ${c.netProfitPaise >= 0 ? "text-success" : "text-danger"}`}>{formatCurrency(c.netProfitPaise)}</td>
                      <td className="text-right text-xs text-slate-400">{c.profitMarginPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {tab === 1 && (
          <div className="card p-5">
            <h3 className="font-semibold text-white font-display mb-4">12-Month Revenue vs Costs</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="Costs" stroke="#ef4444" strokeWidth={2} fill="url(#costGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cost Breakdown */}
        {tab === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-semibold text-white font-display mb-4">Cost by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieCosts} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                    {pieCosts.map((s: any, i: number) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: "#1a1d26", border: "1px solid #2a2f45", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead><tr><th>Category</th><th className="text-right">Amount</th><th className="text-right">%</th></tr></thead>
                <tbody>
                  {(costBreakdown ?? []).map((c: any) => (
                    <tr key={c.category}>
                      <td><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[c.category] ?? "#64748b" }} />{c.category.replace(/_/g, " ")}</div></td>
                      <td className="text-right font-mono">{formatCurrency(c.amountPaise)}</td>
                      <td className="text-right text-slate-400">{c.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Car Comparison */}
        {tab === 3 && (
          <div className="card p-5">
            <h3 className="font-semibold text-white font-display mb-4">Car P&L Comparison</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartCars} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Costs" fill="#2a2f45" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
