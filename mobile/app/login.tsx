/* eslint-disable react/no-unescaped-entities */
import { Link, Stack } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { useThemeColors } from "../constants/useColorScheme";

export default function LoginScreen() {
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Implement login logic here
    console.log("Login with:", email, password);
  };

  const handleGoogleLogin = () => {
    // Implement Google login logic here
    console.log("Login with Google");
  };

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
      />
      <InputField
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} style={styles.button} />

      <View style={styles.dividerContainer}>
        <View
          style={[styles.divider, { backgroundColor: colors.subtleBorder }]}
        />
        <Text style={[styles.dividerText, { color: colors.text }]}>OR</Text>
        <View
          style={[styles.divider, { backgroundColor: colors.subtleBorder }]}
        />
      </View>

      <Button
        title="Sign in with Google"
        onPress={handleGoogleLogin}
        variant="outline"
        style={styles.googleButton}
      />

      <View style={styles.footerTextContainer}>
        <Text style={{ color: colors.text }}>Don't have an account? </Text>
        <Link href="/register" asChild>
          <TouchableOpacity>
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
});
