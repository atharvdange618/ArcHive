import useAuthStore from "@/stores/authStore";
import { router } from "expo-router";
import { TouchableOpacity, View, Image, StyleSheet } from "react-native";

function ProfileTabButton() {
  const { user } = useAuthStore();

  return (
    <View style={{ alignItems: "center" }}>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/profile")}
        style={{ padding: 6 }}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri:
              user?.profilePictureUrl ||
              "https://i.pinimg.com/736x/9e/7e/9b/9e7e9b4fae6e36f811877f088aa12c88.jpg",
          }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});

export default ProfileTabButton;
