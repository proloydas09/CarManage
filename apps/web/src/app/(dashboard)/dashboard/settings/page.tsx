"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";

const TABS = ["Organisation", "Members", "Account"];

export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  const { user, org, role } = useAuthStore();
  const qc = useQueryClient();

  const { data: orgData } = useQuery({ queryKey: ["org"], queryFn: () => api.get("/api/v1/org").then(r => r.data.data) });
  const [orgForm, setOrgForm] = useState({ name: orgData?.name ?? org?.name ?? "", phone: orgData?.phone ?? "", address: orgData?.address ?? "", gstin: orgData?.gstin ?? "" });

  const updateOrgMutation = useMutation({
    mutationFn: (data: any) => api.patch("/api/v1/org", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org"] }); toast.success("Organisation updated"); },
    onError: () => toast.error("Failed to update"),
  });

  const canEdit = ["OWNER", "ADMIN"].includes(role ?? "");

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Settings" subtitle="Manage your organisation and account" />
      <div className="p-6 max-w-3xl space-y-5">
        <div className="flex gap-2 border-b border-bg-border pb-0">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${i === tab ? "border-brand-500 text-brand-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Organisation */}
        {tab === 0 && (
          <div className="card p-6 space-y-5">
            <h3 className="font-semibold text-white font-display">Organisation Details</h3>
            {orgData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Company Name</label><input className={`input ${!canEdit ? "opacity-60" : ""}`} disabled={!canEdit} defaultValue={orgData.name} onChange={e => setOrgForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><label className="label">Phone</label><input className={`input ${!canEdit ? "opacity-60" : ""}`} disabled={!canEdit} defaultValue={orgData.phone} onChange={e => setOrgForm(f => ({ ...f, phone: e.target.value }))} /></div>
                </div>
                <div><label className="label">Address</label><textarea className={`input ${!canEdit ? "opacity-60" : ""}`} disabled={!canEdit} rows={2} defaultValue={orgData.address} onChange={e => setOrgForm(f => ({ ...f, address: e.target.value }))} /></div>
                <div><label className="label">GSTIN</label><input className={`input font-mono ${!canEdit ? "opacity-60" : ""}`} disabled={!canEdit} defaultValue={orgData.gstin} onChange={e => setOrgForm(f => ({ ...f, gstin: e.target.value }))} /></div>
                <div className="flex items-center justify-between p-4 bg-bg-elevated rounded-xl">
                  <div><p className="text-sm text-white font-medium">Current Plan</p><p className="text-xs text-slate-500 mt-0.5">Billing and plan management</p></div>
                  <span className={`badge font-bold text-sm px-3 py-1 ${orgData.plan === "GROWTH" ? "badge-info" : orgData.plan === "SCALE" ? "badge-success" : "badge-default"}`}>{orgData.plan}</span>
                </div>
                {canEdit && (
                  <button onClick={() => updateOrgMutation.mutate(orgForm)} disabled={updateOrgMutation.isPending} className="btn-primary">
                    {updateOrgMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Changes"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Members */}
        {tab === 1 && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-bg-border">
              <h3 className="font-semibold text-white font-display">Team Members</h3>
            </div>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {(orgData?.members ?? []).map((m: any) => (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-xs font-bold">{m.user.name[0]}</div>
                        <span className="text-sm">{m.user.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-400">{m.user.email}</td>
                    <td><span className={`badge text-[10px] ${m.role === "OWNER" ? "badge-warning" : m.role === "ADMIN" ? "badge-info" : "badge-default"}`}>{m.role}</span></td>
                    <td className="text-xs text-slate-500">{new Date(m.joinedAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Account */}
        {tab === 2 && (
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-white font-display">Account Information</h3>
            <div className="flex items-center gap-4 p-4 bg-bg-elevated rounded-xl">
              <div className="w-14 h-14 rounded-full bg-brand-600/30 flex items-center justify-center text-brand-300 text-2xl font-bold">
                {user?.name?.[0] ?? "?"}
              </div>
              <div>
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-sm text-slate-400">{user?.email}</p>
                <span className={`badge text-[10px] mt-1 ${role === "OWNER" ? "badge-warning" : role === "ADMIN" ? "badge-info" : "badge-default"}`}>{role}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 p-3 bg-bg-elevated rounded-xl">
              To change your name, email, or password, please contact your account administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
