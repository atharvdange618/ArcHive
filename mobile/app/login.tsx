/* eslint-disable react/no-unescaped-entities */
import { login } from "@/apis/login";
import { useMutation } from "@tanstack/react-query";
import { Link, Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { useThemeColors } from "../constants/useColorScheme";
import useAuthStore from "../stores/authStore";
// import { useOAuth } from "@/hooks/useOAuth";

export default function LoginScreen() {
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // const {
  //   loginWithGoogle,
  //   isLoading: oauthLoading,
  //   error: oauthError,
  // } = useOAuth();

  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      router.replace("/(tabs)");
    },
    onError: (err: any) => {
      console.log(err);
      setError(err.message);
    },
  });

  const handleLogin = () => {
    loginMutation.mutate({ email, password });
  };

  const isLoading = loginMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={[styles.title, { color: colors.text }]}>Welcome Back!</Text>

      <InputField
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <InputField
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        title={isLoading ? <ActivityIndicator color="#fff" /> : "Login"}
        onPress={handleLogin}
        style={styles.button}
        disabled={isLoading}
      />

      {/* <View style={styles.dividerContainer}>
        <View
          style={[styles.divider, { backgroundColor: colors.subtleBorder }]}
        ></View>
        <Text style={[styles.dividerText, { color: colors.text }]}>OR</Text>
        <View
          style={[styles.divider, { backgroundColor: colors.subtleBorder }]}
        ></View>
      </View> */}

      {/* <Button
        title={
          oauthLoading ? (
            <ActivityIndicator color={colors.tint} />
          ) : (
            "Sign in with Google"
          )
        }
        onPress={loginWithGoogle}
        variant="outline"
        style={styles.googleButton}
        disabled={oauthLoading}
      /> */}

      {/* {oauthError && <Text style={styles.errorText}>{oauthError}</Text>} */}

      <View style={styles.footerTextContainer}>
        <Text style={{ color: colors.text }}>Don't have an account? </Text>
        <Link href="/register" asChild>
          <TouchableOpacity disabled={isLoading}>
            <Text style={{ color: colors.tint, fontWeight: "600" }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  googleButton: {
    marginBottom: 20,
  },
  footerTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});
