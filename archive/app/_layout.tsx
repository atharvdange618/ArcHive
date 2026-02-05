import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { useThemeColors } from "../constants/useColorScheme";
import useAuthStore from "../stores/authStore";
import { setupAxiosInterceptors } from "../utils/axiosInstance";
import Toast from "react-native-toast-message";
import { createContent } from "../apis/createContent";
import { useIncomingLinkHandler } from "../hooks/useIncomingLinkHandler";

import { ShareIntentProvider } from "expo-share-intent";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function InitialLayout() {
  const { accessToken, initializeAuth, setTokens, logout, isAuthInitialized } =
    useAuthStore();
  const segments = useSegments();
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const colors = useThemeColors();
  const { pendingUrl, clearPendingUrl } = useIncomingLinkHandler();
  const queryClient = useQueryClient();

  const handleCreateContent = useCallback(
    async (url: string) => {
      try {
        await createContent({ url });
        queryClient.invalidateQueries({ queryKey: ["contents"] });
        Toast.show({
          type: "success",
          text1: "Link Saved!",
          text2: "The link has been successfully saved to your ArcHive.",
        });
      } catch (error) {
        console.error("Failed to save link:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to save the link.",
        });
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      initializeAuth();
      setupAxiosInterceptors(setTokens, logout);
    }
  }, [initializeAuth, loaded, logout, setTokens]);

  useEffect(() => {
    if (loaded && isAuthInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthInitialized]);

  useEffect(() => {
    if (!loaded || !isAuthInitialized) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (pendingUrl) {
      if (accessToken) {
        console.log("Processing pending URL (logged in):", pendingUrl);
        handleCreateContent(pendingUrl).finally(() => {
          clearPendingUrl();
          if (inAuthGroup) {
            router.replace("/(tabs)");
          }
        });
        return;
      } else {
        console.log("Storing pending URL, redirecting to login:", pendingUrl);
        if (!inAuthGroup) {
          router.replace("/login");
        }
        return;
      }
    }

    if (accessToken && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!accessToken && !inAuthGroup) {
      router.replace("/login");
    }
  }, [
    accessToken,
    segments,
    loaded,
    isAuthInitialized,
    pendingUrl,
    clearPendingUrl,
    handleCreateContent,
  ]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
      <Stack.Screen name="details" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ShareIntentProvider>
        <InitialLayout />
      </ShareIntentProvider>
      <Toast />
    </QueryClientProvider>
  );
}
