import { create } from "zustand";

type UiState = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toast: { message: string; type: "success" | "info" | "warning" } | null;
  setSidebarOpen: (open: boolean) => void;
  toggleCollapsed: () => void;
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
  clearToast: () => void;
};

const collapsedStored = localStorage.getItem("pulse-sidebar") === "collapsed";

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: collapsedStored,
  toast: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCollapsed: () =>
    set((state) => {
      const sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem("pulse-sidebar", sidebarCollapsed ? "collapsed" : "expanded");
      return { sidebarCollapsed };
    }),
  showToast: (message, type = "info") => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
