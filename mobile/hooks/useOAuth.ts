import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useCallback, useState } from "react";
import useAuthStore from "@/stores/authStore";
import { router } from "expo-router";
import Constants from "expo-constants";

export function useOAuth(): {
  loginWithGoogle: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
} {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL as
    | string
    | undefined;

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const redirectUrl = Linking.createURL("auth-callback");

    try {
      if (!apiBaseUrl) {
        throw new Error("API Base URL not configured.");
      }

      const appRedirectPrefix = redirectUrl.replace(/\/auth-callback$/, "");

      const authUrl = new URL(`${apiBaseUrl}/auth/google`);
      authUrl.searchParams.append("appRedirectPrefix", appRedirectPrefix);

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        redirectUrl
      );

      if (result.type !== "success" || !result.url) {
        throw new Error("Authentication was cancelled or failed.");
      }

      const parsed = Linking.parse(result.url);
      const params = parsed.queryParams;

      if (!params)
        throw new Error("No query params received from OAuth callback.");

      const accessToken = params.accessToken as string | undefined;
      const refreshToken = params.refreshToken as string | undefined;
      const email = params.email as string | undefined;
      const username = params.username as string | undefined;

      if (!accessToken || !refreshToken || !email || !username) {
        throw new Error("Missing required login information.");
      }

      setTokens(accessToken, refreshToken);
      setUser({ email, username });

      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, setTokens, setUser]);

  return {
    loginWithGoogle,
    isLoading,
    error,
  };
}
