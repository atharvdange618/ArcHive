import { create } from "zustand";
import { logout as logoutApi } from "@/apis/logout";
import { IUser } from "@/types";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: IUser | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: IUser) => void;
  updateUser: (user: Partial<IUser>) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
    SecureStore.setItemAsync("accessToken", accessToken);
    SecureStore.setItemAsync("refreshToken", refreshToken);
  },
  setUser: (user) => set({ user }),
  updateUser: (user) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...user } : null,
    })),
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
    SecureStore.deleteItemAsync("accessToken");
    SecureStore.deleteItemAsync("refreshToken");
  },
  initializeAuth: async () => {
    const accessToken = await SecureStore.getItemAsync("accessToken");
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken });
      // Optionally, you might want to fetch user data here if not stored securely
      // or if it can change.
    }
  },
}));

export default useAuthStore;
