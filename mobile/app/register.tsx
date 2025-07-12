import { register } from "@/apis/register";
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

export default function RegisterScreen() {
  const colors = useThemeColors();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const registerMutation = useMutation({
    mutationFn: register,
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

  const handleRegister = () => {
    registerMutation.mutate({ username, email, password, firstName, lastName });
  };

  const isLoading = registerMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={[styles.title, { color: colors.text }]}>
        Join ArcHive 💙
      </Text>

      <InputField
        label="First Name"
        placeholder="Enter your first name"
        value={firstName}
        onChangeText={setFirstName}
        editable={!isLoading}
      />
      <InputField
        label="Last Name"
        placeholder="Enter your last name"
        value={lastName}
        onChangeText={setLastName}
        editable={!isLoading}
      />
      <InputField
        label="Username"
        placeholder="Choose a username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isLoading}
      />
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
        placeholder="Create a strong password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        title={isLoading ? <ActivityIndicator color="#fff" /> : "Register"}
        onPress={handleRegister}
        style={styles.button}
        disabled={isLoading}
      />

      {/* <View style={styles.dividerContainer}>
        <View
          style={[styles.divider, { backgroundColor: colors.subtleBorder }]}
        />
        <Text style={[styles.dividerText, { color: colors.text }]}>OR</Text>
        <View
          style={[styles.divider, { backgroundColor: colors.subtleBorder }]}
        />
      </View>

      <Button
        title="Sign up with Google"
        onPress={handleGoogleRegister}
        variant="outline"
        style={styles.googleButton}
      /> */}

      <View style={styles.footerTextContainer}>
        <Text style={{ color: colors.text }}>Already have an account? </Text>
        <Link href="/login" asChild>
          <TouchableOpacity disabled={isLoading}>
            <Text style={{ color: colors.tint, fontWeight: "600" }}>Login</Text>
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
