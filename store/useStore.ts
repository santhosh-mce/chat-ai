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
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("user");
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
};

export const useStore = create<AppState>((set) => ({
  user: getStoredUser(),
  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", user.token);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    set({ user: null });
  },
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  selectedModel: "z-ai/glm-4.5-air:free",
  setSelectedModel: (model) => set({ selectedModel: model }),
}));
