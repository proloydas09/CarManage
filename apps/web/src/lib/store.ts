import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User { id: string; name: string; email: string; avatarUrl?: string }
interface Org { id: string; name: string; plan: string; logoUrl?: string }

interface AuthState {
  user: User | null;
  org: Org | null;
  role: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: { user: User; org: Org; role: string; tokens: { accessToken: string; refreshToken: string } }) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

interface UIState {
  sidebarCollapsed: boolean;
  notificationDrawerOpen: boolean;
  theme: "dark" | "light";
  toggleSidebar: () => void;
  setNotificationDrawer: (open: boolean) => void;
  setTheme: (theme: "dark" | "light") => void;
}

interface DateRangeState {
  startDate: Date;
  endDate: Date;
  setDateRange: (start: Date, end: Date) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      org: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: ({ user, org, role, tokens }) =>
        set({
          user, org, role,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({ user: null, org: null, role: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      updateUser: (partial) => set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
    }),
    {
      name: "antigravity-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        org: state.org,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      notificationDrawerOpen: false,
      theme: "dark",
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setNotificationDrawer: (open) => set({ notificationDrawerOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "antigravity-ui" }
  )
);

export const useDateRangeStore = create<DateRangeState>((set) => {
  const now = new Date();
  return {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    setDateRange: (startDate, endDate) => set({ startDate, endDate }),
  };
});
