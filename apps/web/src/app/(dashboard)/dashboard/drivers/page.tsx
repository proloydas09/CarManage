"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Users, Search, Phone, Car as CarIcon, MoreVertical } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { SlideOver } from "@/components/shared/SlideOver";
import api from "@/lib/api";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-success", ON_LEAVE: "badge-warning", TERMINATED: "badge-danger",
};

const COMP_LABEL: Record<string, string> = {
  FIXED: "Fixed Salary", PERCENTAGE: "% of Earning", HYBRID: "Fixed + %",
};

function DriverCard({ driver, onDelete }: { driver: any; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-5 hover:border-brand-500/20 transition-all duration-200 group relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 font-bold text-lg flex-shrink-0">
            {driver.name[0]}
          </div>
          <div>
            <Link href={`/dashboard/drivers/${driver.id}`}>
              <p className="font-semibold text-white hover:text-brand-300 transition-colors">{driver.name}</p>
            </Link>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <Phone className="w-3 h-3" />{driver.phone}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${STATUS_BADGE[driver.status] ?? "badge-default"}`}>{driver.status.replace("_", " ")}</span>
          <div className="relative">
            <button onClick={() => setOpen(!open)} className="btn-ghost btn-icon btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 w-36 card-elevated rounded-xl py-1 z-20 shadow-xl animate-fade-in">
                <Link href={`/dashboard/drivers/${driver.id}`} className="block px-3 py-2 text-sm text-slate-300 hover:bg-bg-elevated hover:text-white">View Profile</Link>
                <button onClick={() => { onDelete(); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10">Remove Driver</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {driver.assignedCar && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-bg-elevated rounded-lg p-2">
            <CarIcon className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-mono">{driver.assignedCar.registrationNumber}</span>
            <span className="text-slate-500">— {driver.assignedCar.make} {driver.assignedCar.model}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{COMP_LABEL[driver.compensationType]}</span>
          <span className="text-slate-400">
            {driver.compensationType === "FIXED" ? `₹${(Number(driver.fixedSalaryPaise ?? 0) / 100).toLocaleString("en-IN")}/mo` :
             driver.compensationType === "PERCENTAGE" ? `${driver.percentageRate}%` :
             `₹${(Number(driver.fixedSalaryPaise ?? 0) / 100).toLocaleString("en-IN")} + ${driver.percentageRate}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

function DriverForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: carsData } = useQuery({ queryKey: ["cars"], queryFn: () => api.get("/api/v1/cars?limit=100").then(r => r.data) });
  const [form, setForm] = useState({ name: "", phone: "", licenseNumber: "", licenseExpiry: "", joiningDate: new Date().toISOString().split("T")[0], compensationType: "FIXED", fixedSalaryPaise: "", percentageRate: "", thresholdPaise: "", assignedCarId: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.licenseNumber) return toast.error("Name, phone, and license are required");
    setLoading(true);
    try {
      await api.post("/api/v1/drivers", {
        ...form,
        licenseExpiry: new Date(form.licenseExpiry).toISOString(),
        joiningDate: new Date(form.joiningDate).toISOString(),
        fixedSalaryPaise: form.fixedSalaryPaise ? Math.round(parseFloat(form.fixedSalaryPaise) * 100) : undefined,
        percentageRate: form.percentageRate ? parseFloat(form.percentageRate) : undefined,
        thresholdPaise: form.thresholdPaise ? Math.round(parseFloat(form.thresholdPaise) * 100) : undefined,
        assignedCarId: form.assignedCarId || undefined,
      });
      toast.success("Driver added");
      onSuccess();
    } catch (e: any) { toast.error(e.response?.data?.error ?? "Failed to add driver"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Full Name *</label><input className="input" placeholder="Mohammed Rafiq" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div><label className="label">Phone *</label><input className="input" placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">License No. *</label><input className="input" placeholder="TS01 20200012345" value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} /></div>
        <div><label className="label">License Expiry *</label><input type="date" className="input" value={form.licenseExpiry} onChange={e => setForm(f => ({ ...f, licenseExpiry: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Joining Date</label><input type="date" className="input" value={form.joiningDate} onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))} /></div>
        <div>
          <label className="label">Assign to Car</label>
          <select className="input" value={form.assignedCarId} onChange={e => setForm(f => ({ ...f, assignedCarId: e.target.value }))}>
            <option value="">Unassigned</option>
            {carsData?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.registrationNumber}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Compensation Type *</label>
        <select className="input" value={form.compensationType} onChange={e => setForm(f => ({ ...f, compensationType: e.target.value }))}>
          <option value="FIXED">Fixed Monthly Salary</option>
          <option value="PERCENTAGE">% of Net Earning</option>
          <option value="HYBRID">Fixed + % Above Threshold</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {(form.compensationType === "FIXED" || form.compensationType === "HYBRID") && (
          <div><label className="label">Fixed Salary (₹/mo)</label><input type="number" className="input" placeholder="18000" value={form.fixedSalaryPaise} onChange={e => setForm(f => ({ ...f, fixedSalaryPaise: e.target.value }))} /></div>
        )}
        {(form.compensationType === "PERCENTAGE" || form.compensationType === "HYBRID") && (
          <div><label className="label">Percentage (%)</label><input type="number" step="0.1" className="input" placeholder="10.5" value={form.percentageRate} onChange={e => setForm(f => ({ ...f, percentageRate: e.target.value }))} /></div>
        )}
        {form.compensationType === "HYBRID" && (
          <div><label className="label">Threshold (₹)</label><input type="number" className="input" placeholder="60000" value={form.thresholdPaise} onChange={e => setForm(f => ({ ...f, thresholdPaise: e.target.value }))} /></div>
        )}
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Add Driver"}
      </button>
    </form>
  );
}

export default function DriversPage() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["drivers", search],
    queryFn: () => api.get(`/api/v1/drivers?limit=50&search=${search}`).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/drivers/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["drivers"] }); toast.success("Driver removed"); },
  });

  const drivers = data?.data ?? [];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Drivers" subtitle="Manage your driver roster" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drivers..." className="input pl-9" />
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Driver</button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="card p-5 h-36 animate-pulse"><div className="flex gap-3"><div className="w-11 h-11 rounded-full bg-bg-muted" /><div className="space-y-2 flex-1"><div className="h-4 bg-bg-muted rounded w-3/4" /><div className="h-3 bg-bg-muted rounded w-1/2" /></div></div></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {drivers.map((d: any) => <DriverCard key={d.id} driver={d} onDelete={() => deleteMutation.mutate(d.id)} />)}
            {drivers.length === 0 && (
              <div className="col-span-3 card p-16 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No drivers found</p>
                <button onClick={() => setAddOpen(true)} className="btn-primary mt-4 mx-auto"><Plus className="w-4 h-4" /> Add First Driver</button>
              </div>
            )}
          </div>
        )}
      </div>
      <SlideOver open={addOpen} onClose={() => setAddOpen(false)} title="Add Driver">
        <DriverForm onSuccess={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ["drivers"] }); }} />
      </SlideOver>
    </div>
  );
}
