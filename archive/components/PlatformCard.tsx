import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getPlatformIcon,
  getPlatformColor,
  getPlatformDisplayName,
} from "../constants/platforms";
import { Colors } from "../constants/Colors";

interface PlatformCardProps {
  platform: string;
  count: number;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  count,
}) => {
  const router = useRouter();
  const iconName = getPlatformIcon(platform);
  const platformColor = getPlatformColor(platform);
  const displayName = getPlatformDisplayName(platform);

  const handlePress = () => {
    router.push(`/browse/${encodeURIComponent(platform)}` as any);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        { borderLeftColor: platformColor },
      ]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <View
          style={[styles.iconContainer, { backgroundColor: platformColor }]}
        >
          <Ionicons name={iconName as any} size={28} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.platformName}>{displayName}</Text>
          <Text style={styles.count}>
            {count} {count === 1 ? "item" : "items"}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.light.tabIconDefault}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  platformName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: "#666",
  },
});
