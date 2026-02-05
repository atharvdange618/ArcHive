import { create } from "zustand";
import { logout as logoutApi } from "@/apis/logout";
import { IUser } from "@/types";
import * as SecureStore from "expo-secure-store";
import { getUserProfile } from "@/apis/getUserProfile";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: IUser | null;
  isAuthInitialized: boolean; // New state to track initialization
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
  isAuthInitialized: false, // Initialize to false
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
    set({ accessToken: null, refreshToken: null, user: null, isAuthInitialized: true }); // Set to true on logout
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
    set({ isAuthInitialized: true }); // Set to true after initialization attempt
  },
}));

export default useAuthStore;
