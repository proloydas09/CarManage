"use client";

import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "../shared/ThemeToggle";
import { useUIStore, useAuthStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { setNotificationDrawer } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get("/api/v1/notifications?unreadOnly=true").then((r) => r.data),
    enabled: isAuthenticated,
    refetchInterval: 60000, // every minute
  });

  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-bg-border bg-bg-surface/80 backdrop-blur-sm flex-shrink-0">
      <div>
        <h1 className="page-title text-lg">{title}</h1>
        {subtitle && <p className="page-subtitle text-xs">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* Notification bell */}
        <button
          onClick={() => setNotificationDrawer(true)}
          className="relative btn-ghost btn-icon"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
