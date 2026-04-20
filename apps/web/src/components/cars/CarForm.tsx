"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { CarStatus, FuelType, DepreciationMethod } from "@antigravity/types";

interface CarFormProps {
  onSuccess: () => void;
  defaultValues?: Partial<any>;
}

export function CarForm({ onSuccess, defaultValues }: CarFormProps) {
  const [form, setForm] = useState({
    registrationNumber: defaultValues?.registrationNumber ?? "",
    make: defaultValues?.make ?? "",
    model: defaultValues?.model ?? "",
    year: defaultValues?.year ?? new Date().getFullYear(),
    fuelType: defaultValues?.fuelType ?? "DIESEL",
    status: defaultValues?.status ?? "ACTIVE",
    purchasePrice: defaultValues?.purchasePricePaise ? (Number(defaultValues.purchasePricePaise) / 100).toString() : "",
    purchaseDate: defaultValues?.purchaseDate ? new Date(defaultValues.purchaseDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    depreciationMethod: defaultValues?.depreciationMethod ?? "STRAIGHT_LINE",
    depreciationRate: defaultValues?.depreciationRate ?? 20,
    currentOdometer: defaultValues?.currentOdometer ?? 0,
    color: defaultValues?.color ?? "",
    seatingCapacity: defaultValues?.seatingCapacity ?? "",
    notes: defaultValues?.notes ?? "",
  });

  const mutation = useMutation({
    mutationFn: (data: any) => defaultValues?.id
      ? api.patch(`/api/v1/cars/${defaultValues.id}`, data)
      : api.post("/api/v1/cars", data),
    onSuccess: () => {
      toast.success(defaultValues?.id ? "Car updated" : "Car added to fleet");
      onSuccess();
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Failed to save car"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.registrationNumber || !form.make || !form.model || !form.purchasePrice) {
      return toast.error("Please fill all required fields");
    }
    mutation.mutate({
      registrationNumber: form.registrationNumber.toUpperCase().trim(),
      make: form.make,
      model: form.model,
      year: Number(form.year),
      fuelType: form.fuelType,
      status: form.status,
      purchasePrice: Math.round(parseFloat(form.purchasePrice) * 100),
      purchaseDate: new Date(form.purchaseDate).toISOString(),
      depreciationMethod: form.depreciationMethod,
      depreciationRate: Number(form.depreciationRate),
      currentOdometer: Number(form.currentOdometer),
      color: form.color || undefined,
      seatingCapacity: form.seatingCapacity ? Number(form.seatingCapacity) : undefined,
      notes: form.notes || undefined,
    });
  };

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      {/* Registration & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Registration No. *</label>
          <input className="input font-mono uppercase" placeholder="TS 09 AB 1234" value={form.registrationNumber} onChange={f("registrationNumber")} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={f("status")}>
            {Object.values(CarStatus).map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>

      {/* Make, Model, Year */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Make *</label>
          <input className="input" placeholder="Toyota" value={form.make} onChange={f("make")} />
        </div>
        <div>
          <label className="label">Model *</label>
          <input className="input" placeholder="Innova Crysta" value={form.model} onChange={f("model")} />
        </div>
        <div>
          <label className="label">Year *</label>
          <input type="number" className="input" placeholder="2022" value={form.year} onChange={f("year")} />
        </div>
      </div>

      {/* Fuel & Color & Seats */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Fuel Type</label>
          <select className="input" value={form.fuelType} onChange={f("fuelType")}>
            {Object.values(FuelType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Color</label>
          <input className="input" placeholder="White" value={form.color} onChange={f("color")} />
        </div>
        <div>
          <label className="label">Seats</label>
          <input type="number" className="input" placeholder="7" value={form.seatingCapacity} onChange={f("seatingCapacity")} />
        </div>
      </div>

      {/* Purchase details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Purchase Price (₹) *</label>
          <input type="number" step="0.01" className="input" placeholder="1500000" value={form.purchasePrice} onChange={f("purchasePrice")} />
        </div>
        <div>
          <label className="label">Purchase Date</label>
          <input type="date" className="input" value={form.purchaseDate} onChange={f("purchaseDate")} />
        </div>
      </div>

      {/* Depreciation */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Depreciation Method</label>
          <select className="input" value={form.depreciationMethod} onChange={f("depreciationMethod")}>
            {Object.values(DepreciationMethod).map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Annual Rate (%)</label>
          <input type="number" step="0.1" className="input" value={form.depreciationRate} onChange={f("depreciationRate")} />
        </div>
      </div>

      {/* Odometer */}
      <div>
        <label className="label">Current Odometer (km)</label>
        <input type="number" className="input" placeholder="0" value={form.currentOdometer} onChange={f("currentOdometer")} />
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <textarea className="input" rows={2} placeholder="Any additional details..." value={form.notes} onChange={f("notes")} />
      </div>

      <button type="submit" disabled={mutation.isPending} className="btn-primary w-full justify-center py-3">
        {mutation.isPending
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : defaultValues?.id ? "Update Car" : "Add to Fleet"
        }
      </button>
    </form>
  );
}
