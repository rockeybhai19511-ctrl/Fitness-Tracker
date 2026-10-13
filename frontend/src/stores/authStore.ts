import { create } from "zustand";

type AuthState = {
  token: string | null;
  username: string | null;
  setAuth: (token: string, username: string) => void;
  logout: () => void;
};

const storedToken = localStorage.getItem("pulse-token");
const storedUser = localStorage.getItem("pulse-user");

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  username: storedUser,
  setAuth: (token, username) => {
    localStorage.setItem("pulse-token", token);
    localStorage.setItem("pulse-user", username);
    set({ token, username });
  },
  logout: () => {
    localStorage.removeItem("pulse-token");
    localStorage.removeItem("pulse-user");
    set({ token: null, username: null });
  },
}));
