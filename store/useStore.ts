import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => {
    if (user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    set({ user: null });
  },
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
