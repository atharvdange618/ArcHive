import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme, View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/Colors";
import useAuthStore from "../stores/authStore";
import { setupAxiosInterceptors } from "../utils/axiosInstance";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function InitialLayout() {
  const { accessToken, initializeAuth, setTokens, logout, isAuthInitialized } = useAuthStore();
  const segments = useSegments();
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      initializeAuth();
      setupAxiosInterceptors(setTokens, logout);
    }
  }, [initializeAuth, loaded, logout, setTokens]);

  useEffect(() => {
    if (!loaded || !isAuthInitialized) return; // Wait for fonts and auth to initialize

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (accessToken && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!accessToken && !inAuthGroup) {
      router.replace("/login");
    }
  }, [accessToken, segments, loaded, isAuthInitialized]);

  if (!loaded || !isAuthInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
      <InitialLayout />
    </QueryClientProvider>
  );
}
