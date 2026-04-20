"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Calendar, MapPin, Car as CarIcon, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { SlideOver } from "@/components/shared/SlideOver";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@antigravity/utils";
import { EarningSource } from "@antigravity/types";

const STATUS_STYLES: Record<string, { badge: string; icon: any; label: string }> = {
  INQUIRY:     { badge: "badge-default", icon: Clock,        label: "Inquiry" },
  CONFIRMED:   { badge: "badge-info",    icon: CheckCircle,  label: "Confirmed" },
  IN_PROGRESS: { badge: "badge-warning", icon: CarIcon,      label: "In Progress" },
  COMPLETED:   { badge: "badge-success", icon: CheckCircle,  label: "Completed" },
  CANCELLED:   { badge: "badge-danger",  icon: XCircle,      label: "Cancelled" },
};

function BookingForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: carsData } = useQuery({ queryKey: ["cars"], queryFn: () => api.get("/api/v1/cars?limit=100").then(r => r.data) });
  const { data: driversData } = useQuery({ queryKey: ["drivers"], queryFn: () => api.get("/api/v1/drivers?limit=100").then(r => r.data) });
  const { data: customersData } = useQuery({ queryKey: ["customers"], queryFn: () => api.get("/api/v1/customers?limit=100").then(r => r.data) });
  const [form, setForm] = useState({ carId: "", driverId: "", customerId: "", customerName: "", customerPhone: "", source: "BOOKING", status: "INQUIRY", pickupLocation: "", dropLocation: "", startDate: "", endDate: "", estimatedKm: "", quotedAmountPaise: "", advancePaidPaise: "0", notes: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carId || !form.quotedAmountPaise || !form.startDate || !form.pickupLocation) return toast.error("Car, pickup, date and amount are required");
    setLoading(true);
    try {
      await api.post("/api/v1/bookings", {
        ...form,
        quotedAmountPaise: Math.round(parseFloat(form.quotedAmountPaise) * 100),
        advancePaidPaise: Math.round(parseFloat(form.advancePaidPaise || "0") * 100),
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        estimatedKm: form.estimatedKm ? parseFloat(form.estimatedKm) : undefined,
        driverId: form.driverId || undefined,
        customerId: form.customerId || undefined,
        customerName: form.customerName || undefined,
        customerPhone: form.customerPhone || undefined,
      });
      toast.success("Booking created!");
      onSuccess();
    } catch (e: any) { toast.error(e.response?.data?.error ?? "Failed to create booking"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Vehicle *</label>
          <select className="input" value={form.carId} onChange={e => setForm(f => ({ ...f, carId: e.target.value }))}>
            <option value="">Select</option>
            {carsData?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.registrationNumber}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Driver</label>
          <select className="input" value={form.driverId} onChange={e => setForm(f => ({ ...f, driverId: e.target.value }))}>
            <option value="">Unassigned</option>
            {driversData?.data?.filter((d: any) => d.status === "ACTIVE").map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Customer</label>
          <select className="input" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}>
            <option value="">Walk-in</option>
            {customersData?.data?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="INQUIRY">Inquiry</option>
            <option value="CONFIRMED">Confirmed</option>
          </select>
        </div>
      </div>
      {!form.customerId && (
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Customer Name</label><input className="input" placeholder="Walk-in name" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} /></div>
          <div><label className="label">Customer Phone</label><input className="input" placeholder="9876543210" value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} /></div>
        </div>
      )}
      <div><label className="label">Pickup Location *</label><input className="input" placeholder="Hyderabad Airport" value={form.pickupLocation} onChange={e => setForm(f => ({ ...f, pickupLocation: e.target.value }))} /></div>
      <div><label className="label">Drop Location</label><input className="input" placeholder="Bengaluru Whitefield" value={form.dropLocation} onChange={e => setForm(f => ({ ...f, dropLocation: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Start Date *</label><input type="datetime-local" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
        <div><label className="label">End Date</label><input type="datetime-local" className="input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Quoted Amount (₹) *</label><input type="number" className="input" placeholder="15000" value={form.quotedAmountPaise} onChange={e => setForm(f => ({ ...f, quotedAmountPaise: e.target.value }))} /></div>
        <div><label className="label">Advance Paid (₹)</label><input type="number" className="input" placeholder="5000" value={form.advancePaidPaise} onChange={e => setForm(f => ({ ...f, advancePaidPaise: e.target.value }))} /></div>
      </div>
      <div><label className="label">Notes</label><textarea className="input" rows={2} placeholder="Any special instructions..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Booking"}
      </button>
    </form>
  );
}

export default function BookingsPage() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", statusFilter],
    queryFn: () => api.get(`/api/v1/bookings?limit=50${statusFilter ? `&status=${statusFilter}` : ""}`).then(r => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/bookings/${id}/cancel`, { reason: "Cancelled by manager" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); toast.success("Booking cancelled"); },
  });

  const bookings = data?.data ?? [];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Bookings" subtitle="Manage trips and reservations" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            {["", "INQUIRY", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-outline"}`}>
                {s || "All"}
              </button>
            ))}
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-primary ml-auto"><Plus className="w-4 h-4" /> New Booking</button>
        </div>

        <div className="space-y-3">
          {isLoading && [...Array(5)].map((_, i) => <div key={i} className="card p-4 h-24 animate-pulse" />)}
          {!isLoading && bookings.map((b: any) => {
            const s = STATUS_STYLES[b.status] ?? STATUS_STYLES.INQUIRY;
            const balance = Number(b.quotedAmountPaise) - Number(b.advancePaidPaise);
            return (
              <div key={b.id} className="card p-4 hover:border-brand-500/20 transition-all flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white text-sm">{b.pickupLocation}</p>
                        {b.dropLocation && <><span className="text-slate-600">→</span><p className="text-sm text-slate-400">{b.dropLocation}</p></>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="font-mono">{b.car?.registrationNumber}</span>
                        {b.driver && <span>· {b.driver.name}</span>}
                        {b.customerName || b.customer?.name ? <span>· {b.customerName ?? b.customer?.name}</span> : null}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold font-mono text-white">{formatCurrency(Number(b.quotedAmountPaise))}</p>
                      {balance > 0 && <p className="text-xs text-warning">Balance: {formatCurrency(balance)}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`badge text-[10px] ${s.badge}`}>{s.label}</span>
                      <span className="text-[11px] text-slate-600 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(b.startDate)}</span>
                    </div>
                    {!["COMPLETED", "CANCELLED"].includes(b.status) && (
                      <button onClick={() => cancelMutation.mutate(b.id)} className="btn-ghost btn-sm text-danger hover:bg-danger/10 text-xs">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {!isLoading && bookings.length === 0 && (
            <div className="card p-16 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No bookings found</p>
              <button onClick={() => setAddOpen(true)} className="btn-primary mt-4 mx-auto"><Plus className="w-4 h-4" /> Create First Booking</button>
            </div>
          )}
        </div>
      </div>
      <SlideOver open={addOpen} onClose={() => setAddOpen(false)} title="New Booking">
        <BookingForm onSuccess={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ["bookings"] }); }} />
      </SlideOver>
    </div>
  );
}
