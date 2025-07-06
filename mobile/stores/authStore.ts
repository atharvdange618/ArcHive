import { create } from "zustand";
import { logout as logoutApi } from "@/apis/logout";
import { IUser } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: IUser | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: IUser) => void;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setUser: (user) => set({ user }),
  logout: async () => {
    const { accessToken, refreshToken } = get();
    if (accessToken && refreshToken) {
      try {
        await logoutApi(accessToken, refreshToken);
      } catch (error) {
        console.error("Failed to logout:", error);
      }
    }
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));

export default useAuthStore;
