import useAuthStore from "@/stores/authStore";
import { router } from "expo-router";
import { useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";

interface ProfileTabButtonProps {
  imageUrl?: string;
}

const { width } = Dimensions.get("window");

function ProfileTabButton({ imageUrl }: ProfileTabButtonProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleDropdownClose = () => setDropdownVisible(false);

  return (
    <View style={{ alignItems: "center" }}>
      <TouchableOpacity
        onPress={() => setDropdownVisible((v) => !v)}
        style={{ padding: 6 }}
        activeOpacity={0.7}
      >
        <Image
          source={
            imageUrl
              ? {
                  uri: imageUrl,
                }
              : undefined
          }
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
          }}
        />
      </TouchableOpacity>

      {dropdownVisible && (
        <>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handleDropdownClose}
            activeOpacity={1}
          />
          <View
            style={[styles.dropdownMenu, { bottom: 45, left: width / 2 - 160 }]}
          >
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleDropdownClose();
                router.push("/(tabs)/profile");
              }}
            >
              <Text style={styles.dropdownText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={async () => {
                handleDropdownClose();
                await useAuthStore.getState().logout();
                router.replace("/login");
              }}
            >
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownMenu: {
    position: "absolute",
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: "#222",
  },
});

export default ProfileTabButton;
