import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import useAuthStore from "@/stores/authStore";

export default function AuthCallback() {
  const { accessToken, refreshToken, email, username } = useLocalSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    if (accessToken && refreshToken && email && username) {
      setTokens(accessToken as string, refreshToken as string);
      setUser({ email, username });
      router.replace("/(tabs)");
    } else {
      // handle error or show loading
    }
  }, [accessToken, email, refreshToken, router, setTokens, setUser, username]);

  return null;
}
