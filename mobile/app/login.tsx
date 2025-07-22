/* eslint-disable react/no-unescaped-entities */
import { login } from "@/apis/login";
import Button from "@/components/Button";
import InputField from "@/components/InputField";
import { useThemeColors } from "@/constants/useColorScheme";
import useAuthStore from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, Stack, router } from "expo-router";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const colors = useThemeColors();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      router.replace("/(tabs)");
    },
    onError: (err: any) => {
      console.log(err);
      setError("root", {
        type: "manual",
        message: err.message || "An error occurred.",
      });
    },
  });

  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const isLoading = loginMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={[styles.title, { color: colors.text }]}>Welcome Back!</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            label="Email"
            placeholder="Enter your email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            label="Password"
            placeholder="Enter your password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            isPassword
            editable={!isLoading}
            error={errors.password?.message}
          />
        )}
      />

      {errors.root && (
        <Text style={styles.errorText}>{errors.root.message}</Text>
      )}

      <Button
        title={
          isLoading ? <ActivityIndicator color={colors.background} /> : "Login"
        }
        onPress={handleSubmit(handleLogin)}
        style={styles.button}
        disabled={isLoading}
      />

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
