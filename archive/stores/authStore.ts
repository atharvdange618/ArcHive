import { create } from "zustand";
import { logout as logoutApi } from "@/apis/logout";
import { IUser } from "@/types";
import * as SecureStore from "expo-secure-store";
import { getUserProfile } from "@/apis/getUserProfile";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: IUser | null;
  isAuthInitialized: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: IUser) => void;
  updateUser: (user: Partial<IUser>) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  pendingUrl: string | null;
  setPendingUrl: (url: string | null) => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthInitialized: false,
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
        await logoutApi(refreshToken);
      } catch (error) {
        console.error("Failed to logout:", error);
      }
    }
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthInitialized: true,
    });
    SecureStore.deleteItemAsync("accessToken");
    SecureStore.deleteItemAsync("refreshToken");
  },
  initializeAuth: async () => {
    const accessToken = await SecureStore.getItemAsync("accessToken");
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken });
      try {
        const user = await getUserProfile();
        set({ user });
      } catch (error) {
        console.error("Failed to fetch user profile on startup:", error);
        get().logout();
      }
    }
    set({ isAuthInitialized: true });
  },
  pendingUrl: null,
  setPendingUrl: (url) => set({ pendingUrl: url }),
}));

export default useAuthStore;
