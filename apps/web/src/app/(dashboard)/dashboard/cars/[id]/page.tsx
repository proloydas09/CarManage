"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Car as CarIcon, DollarSign, TrendingUp, FileText, Gauge, Settings } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Header } from "@/components/layout/Header";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@antigravity/utils";

const TABS = ["Overview", "Costs", "Earnings", "Documents", "Odometer"];

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState(0);

  const { data: carData, isLoading } = useQuery({ queryKey: ["car", id], queryFn: () => api.get(`/api/v1/cars/${id}`).then(r => r.data.data) });
  const { data: pnlData } = useQuery({ queryKey: ["car-pnl", id], queryFn: () => api.get(`/api/v1/cars/${id}/pnl`).then(r => r.data.data) });
  const { data: costsData } = useQuery({ queryKey: ["car-costs", id], queryFn: () => api.get(`/api/v1/costs?carId=${id}&limit=50`).then(r => r.data) });
  const { data: earningsData } = useQuery({ queryKey: ["car-earnings", id], queryFn: () => api.get(`/api/v1/earnings?carId=${id}&limit=50`).then(r => r.data) });

  if (isLoading) return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-4">
        <div className="h-8 bg-bg-elevated rounded w-48 animate-pulse" />
        <div className="card h-48 animate-pulse" />
      </div>
    </div>
  );

  const car = carData;
  const pnl = pnlData;

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title={`${car?.make} ${car?.model}`} subtitle={car?.registrationNumber} />
      <div className="p-6 space-y-5">
        <Link href="/dashboard/cars" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to fleet
        </Link>

        {/* P&L Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500">Total Revenue</p>
            <p className="text-xl font-bold font-mono text-white mt-1">{formatCurrency(pnl?.revenuePaise ?? 0)}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500">Total Costs</p>
            <p className="text-xl font-bold font-mono text-danger mt-1">{formatCurrency(pnl?.costPaise ?? 0)}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500">Net Profit</p>
            <p className={`text-xl font-bold font-mono mt-1 ${(pnl?.netProfitPaise ?? 0) >= 0 ? "text-success" : "text-danger"}`}>{formatCurrency(pnl?.netProfitPaise ?? 0)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-bg-border pb-0">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${i === tab ? "border-brand-500 text-brand-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 0 && (
          <div className="grid grid-cols-2 gap-5">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-white font-display text-sm">Vehicle Details</h3>
              {[
                ["Registration", car?.registrationNumber],
                ["Make & Model", `${car?.make} ${car?.model}`],
                ["Year", car?.year],
                ["Fuel Type", car?.fuelType],
                ["Status", car?.status],
                ["Odometer", `${(car?.currentOdometer / 1000)?.toFixed(1)} K km`],
                ["Depreciation", `${car?.depreciationRate}% ${car?.depreciationMethod?.replace("_", "-")}`],
                ["Purchase Price", formatCurrency(Number(car?.purchasePricePaise ?? 0))],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-white font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-white font-display text-sm">Assigned Drivers</h3>
              {car?.drivers?.length === 0 && <p className="text-slate-500 text-sm">No drivers assigned</p>}
              {car?.drivers?.map((d: any) => (
                <Link key={d.id} href={`/dashboard/drivers/${d.id}`} className="flex items-center gap-3 p-3 bg-bg-elevated rounded-xl hover:border-brand-500/20 border border-transparent transition-all">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 text-sm font-bold">{d.name[0]}</div>
                  <div><p className="text-sm text-white font-medium">{d.name}</p><p className="text-xs text-slate-500">{d.status}</p></div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Costs */}
        {tab === 1 && (
          <div className="card overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Vendor</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                {costsData?.data?.map((c: any) => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs text-slate-500">{formatDate(c.date)}</td>
                    <td><span className="text-xs">{c.category.replace("_", " ")}</span></td>
                    <td className="text-xs text-slate-400">{c.description ?? "—"}</td>
                    <td className="text-xs text-slate-500">{c.vendorName ?? "—"}</td>
                    <td className="text-right font-mono font-medium text-danger">{formatCurrency(Number(c.amountPaise))}</td>
                  </tr>
                ))}
                {(!costsData?.data?.length) && <tr><td colSpan={5} className="text-center py-8 text-slate-500">No costs recorded</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Earnings */}
        {tab === 2 && (
          <div className="card overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Source</th><th>Customer</th><th>Trip KM</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                {earningsData?.data?.map((e: any) => (
                  <tr key={e.id}>
                    <td className="font-mono text-xs text-slate-500">{formatDate(e.date)}</td>
                    <td><span className="badge badge-info text-[10px]">{e.source.replace("_", " ")}</span></td>
                    <td className="text-xs text-slate-400">{e.customer?.name ?? "Walk-in"}</td>
                    <td className="font-mono text-xs">{e.tripKm ? `${parseFloat(e.tripKm).toFixed(0)} km` : "—"}</td>
                    <td className="text-right font-mono font-semibold text-success">{formatCurrency(Number(e.amountPaise))}</td>
                  </tr>
                ))}
                {(!earningsData?.data?.length) && <tr><td colSpan={5} className="text-center py-8 text-slate-500">No earnings recorded</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Documents */}
        {tab === 3 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {car?.documents?.map((doc: any) => {
              const days = doc.expiryDate ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / 86400000) : null;
              const expired = days !== null && days < 0;
              const critical = days !== null && days >= 0 && days <= 7;
              return (
                <div key={doc.id} className={`card p-4 ${expired ? "border-danger/30" : critical ? "border-warning/30" : ""}`}>
                  <p className="text-sm font-medium text-white">{doc.type.replace("_", " ")}</p>
                  {doc.expiryDate && (
                    <>
                      <p className="text-xs text-slate-500 mt-1">Expiry: {formatDate(doc.expiryDate)}</p>
                      <span className={`badge text-[10px] mt-2 ${expired ? "badge-danger" : critical ? "badge-warning" : "badge-success"}`}>
                        {expired ? `Expired ${Math.abs(days!)} days ago` : critical ? `${days} days left` : "Valid"}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
            {(!car?.documents?.length) && <p className="text-slate-500 text-sm col-span-3 py-8 text-center">No documents uploaded</p>}
          </div>
        )}

        {/* Odometer */}
        {tab === 4 && (
          <div className="card overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Date</th><th className="text-right">Reading (km)</th><th>Notes</th></tr></thead>
              <tbody>
                {car?.odometerLogs?.map((log: any) => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs text-slate-500">{formatDate(log.readingDate)}</td>
                    <td className="text-right font-mono font-medium">{log.reading.toLocaleString("en-IN")}</td>
                    <td className="text-xs text-slate-400">{log.notes ?? "—"}</td>
                  </tr>
                ))}
                {(!car?.odometerLogs?.length) && <tr><td colSpan={3} className="text-center py-8 text-slate-500">No odometer logs</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
