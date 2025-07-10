import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "@/constants/useColorScheme";
import useAuthStore from "@/stores/authStore";
import Button from "@/components/Button";
import { router } from "expo-router";

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileHeader}>
        <Text style={[styles.username, { color: colors.text }]}>
          {user?.username}
        </Text>
        <Text style={[styles.email, { color: colors.tint }]}>
          {user?.email}
        </Text>
      </View>

      <Button
        title="Logout"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 50,
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 30,
  },
  logoutButton: {
    marginTop: "auto",
    width: "100%",
  },
});
