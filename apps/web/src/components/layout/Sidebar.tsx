"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Zap, LayoutDashboard, Car, DollarSign, TrendingUp, Users,
  Calendar, BarChart3, Settings, Bell, ChevronLeft, LogOut,
  Menu, X, CreditCard,
} from "lucide-react";
import { useAuthStore, useUIStore } from "@/lib/store";
import { toast } from "sonner";
import api from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/cars", label: "Cars", icon: Car },
  { href: "/dashboard/costs", label: "Costs", icon: DollarSign },
  { href: "/dashboard/earnings", label: "Earnings", icon: TrendingUp },
  { href: "/dashboard/drivers", label: "Drivers", icon: Users },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
];

const bottomNavItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavItem({ href, label, icon: Icon, collapsed }: { href: string; label: string; icon: any; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link href={href} className={`nav-item ${isActive ? "nav-item-active" : ""}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, org, role, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await api.post("/auth/logout", { refreshToken });
    } catch {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    clearAuth();
    toast.success("Signed out");
    router.push("/login");
  };

  const planBadge: Record<string, string> = {
    STARTER: "bg-slate-500/20 text-slate-400",
    GROWTH: "bg-brand-500/20 text-brand-300",
    SCALE: "bg-success/20 text-success",
  };

  return (
    <aside className={`
      flex flex-col h-full bg-bg-surface border-r border-bg-border
      transition-all duration-300 flex-shrink-0
      ${sidebarCollapsed ? "w-16" : "w-56"}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-bg-border flex-shrink-0">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex-shrink-0 flex items-center justify-center shadow-glow-sm">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-display font-bold text-base truncate" style={{ color: "var(--text-heading)" }}>Antigravity</span>
        )}
        <button onClick={toggleSidebar} className="ml-auto transition-colors" style={{ color: "var(--text-muted)" }}>
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Org badge */}
      {!sidebarCollapsed && org && (
        <div className="mx-3 mt-3 p-3 bg-bg-elevated rounded-xl border border-bg-border">
          <p className="text-xs truncate font-medium" style={{ color: "var(--text-muted)" }}>{org.name}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${planBadge[org.plan] ?? planBadge.STARTER}`}>
            {org.plan}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 mt-2">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="p-2 border-t border-bg-border space-y-0.5">
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} {...item} collapsed={sidebarCollapsed} />
        ))}
        <button onClick={handleLogout} className={`nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-danger/10`}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* User */}
      {!sidebarCollapsed && user && (
        <div className="p-3 border-t border-bg-border flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-600/30 flex items-center justify-center text-brand-300 text-xs font-bold flex-shrink-0">
            {user.name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "var(--text-heading)" }}>{user.name}</p>
            <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{role}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
