"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Car as CarIcon, Search, Filter, MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { SlideOver } from "@/components/shared/SlideOver";
import { CarForm } from "@/components/cars/CarForm";
import api from "@/lib/api";
import { formatCurrency } from "@antigravity/utils";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-success",
  IDLE: "badge-warning",
  IN_SERVICE: "badge-info",
  SOLD: "badge-default",
  SCRAPPED: "badge-danger",
};

const FUEL_ICON: Record<string, string> = {
  DIESEL: "⛽", PETROL: "⛽", CNG: "🔵", ELECTRIC: "⚡", HYBRID: "🔋",
};

export default function CarsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["cars", search],
    queryFn: () => api.get(`/api/v1/cars?search=${search}&limit=50`).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/cars/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cars"] }); toast.success("Car removed"); },
    onError: () => toast.error("Failed to delete car"),
  });

  const cars = data?.data ?? [];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Cars" subtitle="Manage your fleet vehicles" />

      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reg, make, model..."
              className="input pl-9"
            />
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Car
          </button>
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 h-40 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-bg-muted rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-bg-muted rounded w-3/4" />
                    <div className="h-3 bg-bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cars.map((car: any) => (
              <CarCard key={car.id} car={car} onDelete={() => deleteMutation.mutate(car.id)} />
            ))}
            {cars.length === 0 && (
              <div className="col-span-3 card p-16 text-center">
                <CarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No cars found</p>
                <p className="text-slate-600 text-sm mt-1">Add your first vehicle to get started</p>
                <button onClick={() => setAddOpen(true)} className="btn-primary mt-4 mx-auto">
                  <Plus className="w-4 h-4" /> Add First Car
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <SlideOver open={addOpen} onClose={() => setAddOpen(false)} title="Add New Car">
        <CarForm onSuccess={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ["cars"] }); }} />
      </SlideOver>
    </div>
  );
}

function CarCard({ car, onDelete }: { car: any; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card p-5 hover:border-brand-500/20 transition-all duration-200 group relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center text-lg flex-shrink-0">
            {FUEL_ICON[car.fuelType] ?? "🚗"}
          </div>
          <div>
            <Link href={`/dashboard/cars/${car.id}`}>
              <p className="font-semibold text-white hover:text-brand-300 transition-colors">
                {car.make} {car.model}
              </p>
            </Link>
            <p className="text-xs font-mono text-slate-500">{car.registrationNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${STATUS_BADGE[car.status] ?? "badge-default"}`}>{car.status}</span>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost btn-icon btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 card-elevated rounded-xl py-1 z-20 shadow-xl animate-fade-in">
                <Link href={`/dashboard/cars/${car.id}`} className="block px-3 py-2 text-sm text-slate-300 hover:bg-bg-elevated hover:text-white">
                  View Details
                </Link>
                <button onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10">
                  Delete Car
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-bg-elevated rounded-lg p-2">
          <p className="text-[10px] text-slate-500">Year</p>
          <p className="text-sm font-semibold text-white">{car.year}</p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-2">
          <p className="text-[10px] text-slate-500">Odometer</p>
          <p className="text-sm font-semibold text-white">{(car.currentOdometer / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-2">
          <p className="text-[10px] text-slate-500">Drivers</p>
          <p className="text-sm font-semibold text-white">{car.drivers?.length ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
