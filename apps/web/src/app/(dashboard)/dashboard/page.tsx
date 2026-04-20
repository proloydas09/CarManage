"use client";

import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, TrendingDown, Car, Users, AlertTriangle, Calendar,
  IndianRupee, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/shared/EmptyState";
import api from "@/lib/api";
import { formatCurrency } from "@antigravity/utils";
import { formatDate } from "@antigravity/utils";

function StatCard({ title, value, sub, trend, icon: Icon, color = "brand" }: {
  title: string; value: string; sub?: string;
  trend?: { value: number; label: string };
  icon: any; color?: "brand" | "success" | "danger" | "warning";
}) {
  const colors = {
    brand: "text-brand-400 bg-brand-500/10",
    success: "text-success bg-success/10",
    danger: "text-danger bg-danger/10",
    warning: "text-warning bg-warning/10",
  };

  return (
    <div className="stat-card animate-slide-in-up">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? "text-success" : "text-danger"}`}>
            {trend.value >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold font-mono text-white">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{title}</p>
        {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-xs space-y-1 shadow-xl">
      <p className="text-slate-400 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/v1/reports/dashboard").then((r) => r.data.data),
  });

  const { data: trendData } = useQuery({
    queryKey: ["monthly-trend"],
    queryFn: () => api.get("/api/v1/reports/monthly-trend?months=6").then((r) => r.data.data),
  });

  const d = dashData;

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header title="Overview" subtitle="Fleet performance at a glance" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card h-28 animate-pulse">
                <div className="w-10 h-10 bg-bg-muted rounded-xl" />
                <div className="space-y-2">
                  <div className="h-6 bg-bg-muted rounded w-24" />
                  <div className="h-3 bg-bg-muted rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const chartData = (trendData ?? []).map((m: any) => ({
    name: m.label,
    Revenue: m.revenuePaise,
    Costs: m.costPaise,
    Profit: m.netProfitPaise,
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Overview" subtitle="Fleet performance at a glance" />

      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(d?.thisMonth?.revenuePaise ?? 0)}
            trend={{ value: d?.revenueMom ?? 0, label: "vs last month" }}
            icon={IndianRupee}
            color="brand"
          />
          <StatCard
            title="Monthly Profit"
            value={formatCurrency(d?.thisMonth?.netProfitPaise ?? 0)}
            sub={`Costs: ${formatCurrency(d?.thisMonth?.costPaise ?? 0)}`}
            icon={TrendingUp}
            color={(d?.thisMonth?.netProfitPaise ?? 0) >= 0 ? "success" : "danger"}
          />
          <StatCard
            title="Active Cars"
            value={`${d?.activeCars ?? 0} / ${d?.totalCars ?? 0}`}
            sub="vehicles in fleet"
            icon={Car}
            color="brand"
          />
          <StatCard
            title="Attention Required"
            value={`${(d?.expiringDocuments ?? 0) + (d?.pendingSettlements ?? 0)}`}
            sub={`${d?.expiringDocuments ?? 0} docs expiring · ${d?.pendingSettlements ?? 0} settlements`}
            icon={AlertTriangle}
            color="warning"
          />
        </div>

        {d?.totalCars === 0 ? (
          <div className="py-20">
            <EmptyState 
              icon={Car}
              title="Welcome aboard!"
              description="Start by adding your first vehicle to track its P&L, maintenance, and earnings."
              actionText="Add your first car"
              actionHref="/dashboard/cars"
            />
          </div>
        ) : (
          <>
            {/* Revenue vs Costs Chart */}

        {/* Revenue vs Costs Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-white font-display">Revenue vs Costs</h2>
                <p className="text-xs text-slate-500">Last 6 months</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                <Bar dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Costs" fill="#2a2f45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Bookings */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-brand-400" />
              <h2 className="font-semibold text-white font-display text-sm">Upcoming Bookings</h2>
            </div>
            <div className="space-y-3">
              {d?.upcomingBookings?.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">No upcoming bookings</p>
              )}
              {d?.upcomingBookings?.map((b: any) => (
                <div key={b.id} className="flex items-start gap-3 p-3 bg-bg-elevated rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{b.pickupLocation}</p>
                    <p className="text-[11px] text-slate-500">{b.car?.registrationNumber} · {formatDate(b.startDate)}</p>
                    <span className={`badge text-[10px] mt-1 ${b.status === "IN_PROGRESS" ? "badge-success" : "badge-info"}`}>
                      {b.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profit Trend Sparkline */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white font-display">Net Profit Trend</h2>
              <p className="text-xs text-slate-500">Monthly net profit across fleet</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => formatCurrency(v, { compact: true })} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Profit" stroke="#6366f1" strokeWidth={2}
                fill="url(#profitGradient)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </>
    )}
  </div>
</div>
);
}
