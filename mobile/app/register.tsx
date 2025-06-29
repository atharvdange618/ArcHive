import { Link, Stack } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { useThemeColors } from "../constants/useColorScheme";

export default function RegisterScreen() {
  const colors = useThemeColors();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    // Implement registration logic here
    console.log("Register with:", username, email, password);
  };

  const handleGoogleRegister = () => {
    // Implement Google registration logic here
    console.log("Register with Google");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={[styles.title, { color: colors.text }]}>Join ArcHive</Text>

      <InputField
        label="Username"
        placeholder="Choose a username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
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
        placeholder="Create a strong password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Register" onPress={handleRegister} style={styles.button} />

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
        title="Sign up with Google"
        onPress={handleGoogleRegister}
        variant="outline"
        style={styles.googleButton}
      />

      <View style={styles.footerTextContainer}>
        <Text style={{ color: colors.text }}>Already have an account? </Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
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
});
