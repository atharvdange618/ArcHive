import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import { useThemeColors } from "@/constants/useColorScheme";
import useAuthStore from "@/stores/authStore";
import Button from "@/components/Button";
import { router } from "expo-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updateProfile, uploadProfilePicture } from "@/apis/updateProfile";
import { getUserStats } from "@/apis/getUserStats";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { FontAwesome5 } from "@expo/vector-icons";

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user, logout, updateUser } = useAuthStore();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    setIsLogoutModalVisible(false);
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      updateUser(data.user);
      setIsEditModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Profile updated successfully!",
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Failed to update profile",
        text2: error.message || "Please try again.",
      });
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onMutate: () => {
      setIsUploadingImage(true);
    },
    onSuccess: (data) => {
      updateUser(data.user);
      Toast.show({
        type: "success",
        text1: "Profile picture updated!",
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Failed to upload image",
        text2: error.message || "Please try again.",
      });
    },
    onSettled: () => {
      setIsUploadingImage(false);
    },
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({ firstName, lastName });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "We need camera roll permissions to make this work!",
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadProfilePictureMutation.mutate(result.assets[0].uri);
    }
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.profileHeader}>
        <TouchableOpacity
          onPress={pickImage}
          disabled={isUploadingImage}
          style={styles.profilePictureContainer}
        >
          <Image
            source={{
              uri:
                user?.profilePictureUrl ||
                "https://i.pinimg.com/736x/4c/60/42/4c6042228823e4a4657dc30425955222.jpg",
            }}
            style={styles.profilePicture}
          />
          {isUploadingImage ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          ) : (
            <View style={styles.cameraIconContainer}>
              <FontAwesome5 name="camera" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.tapHint, { color: colors.secondary }]}>
          Tap to change photo
        </Text>
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>

        <Text style={[styles.email, { color: colors.tint }]}>
          {user?.email}
        </Text>
      </View>

      {statsLoading ? (
        <View style={styles.statsLoadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : stats ? (
        <View style={styles.statsContainer}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>
            Your Archive Statistics
          </Text>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={styles.statHeader}>
              <FontAwesome5 name="archive" size={24} color={colors.tint} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalItems}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>
              Total Items
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statCardTitle, { color: colors.text }]}>
              Content Breakdown
            </Text>
            <View style={styles.typeBreakdown}>
              <View style={styles.typeRow}>
                <FontAwesome5 name="link" size={20} color="#3b82f6" />
                <Text style={[styles.typeLabel, { color: colors.text }]}>
                  Links
                </Text>
                <Text style={[styles.typeValue, { color: colors.tint }]}>
                  {stats.byType.link}
                </Text>
              </View>
              <View style={styles.typeRow}>
                <FontAwesome5 name="file-alt" size={20} color="#10b981" />
                <Text style={[styles.typeLabel, { color: colors.text }]}>
                  Text Notes
                </Text>
                <Text style={[styles.typeValue, { color: colors.tint }]}>
                  {stats.byType.text}
                </Text>
              </View>
              <View style={styles.typeRow}>
                <FontAwesome5 name="code" size={20} color="#f59e0b" />
                <Text style={[styles.typeLabel, { color: colors.text }]}>
                  Code Snippets
                </Text>
                <Text style={[styles.typeValue, { color: colors.tint }]}>
                  {stats.byType.code}
                </Text>
              </View>
            </View>
          </View>

          {stats.recentActivity > 0 && (
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={styles.statHeader}>
                <FontAwesome5 name="clock" size={24} color="#8b5cf6" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.recentActivity}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>
                Added in last 7 days
              </Text>
            </View>
          )}

          {stats.topTags && stats.topTags.length > 0 && (
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statCardTitle, { color: colors.text }]}>
                Top Tags
              </Text>
              <View style={styles.tagsContainer}>
                {stats.topTags.map((tagItem, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tagChip,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: colors.text }]}>
                      #{tagItem.name}
                    </Text>
                    <View
                      style={[
                        styles.tagCount,
                        { backgroundColor: colors.tint },
                      ]}
                    >
                      <Text style={styles.tagCountText}>{tagItem.count}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : null}

      <Button
        title="Edit Profile"
        onPress={() => setIsEditModalVisible(true)}
        style={styles.editButton}
      />

      <Modal
        isVisible={isEditModalVisible}
        onBackdropPress={() => setIsEditModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.modal}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Profile
            </Text>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <FontAwesome5 name="times" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.secondary }]}>
                First Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.subtleBorder,
                  },
                ]}
                placeholder="Enter first name"
                placeholderTextColor={colors.placeholderText}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.secondary }]}>
                Last Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.subtleBorder,
                  },
                ]}
                placeholder="Enter last name"
                placeholderTextColor={colors.placeholderText}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: colors.primary }]}
              onPress={handleUpdateProfile}
              disabled={updateProfileMutation.isPending}
            >
              <Text style={styles.updateButtonText}>
                {updateProfileMutation.isPending
                  ? "Updating..."
                  : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ marginTop: "auto", width: "100%" }}>
        <Button title="Logout" onPress={() => setIsLogoutModalVisible(true)} />
      </View>

      <Modal
        isVisible={isLogoutModalVisible}
        onBackdropPress={() => setIsLogoutModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={styles.modal}
      >
        <View
          style={[styles.logoutModalContent, { backgroundColor: colors.card }]}
        >
          <View style={styles.logoutIconContainer}>
            <FontAwesome5 name="sign-out-alt" size={32} color={colors.danger} />
          </View>

          <Text style={[styles.logoutTitle, { color: colors.text }]}>
            Logout
          </Text>
          <Text style={[styles.logoutMessage, { color: colors.secondary }]}>
            Are you sure you want to log out of your account?
          </Text>

          <View style={styles.logoutButtons}>
            <TouchableOpacity
              style={[
                styles.logoutButton,
                styles.cancelLogoutButton,
                { borderColor: colors.subtleBorder },
              ]}
              onPress={() => setIsLogoutModalVisible(false)}
            >
              <Text style={[styles.cancelLogoutText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.logoutButton,
                styles.confirmLogoutButton,
                { backgroundColor: colors.danger },
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.confirmLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 50,
  },
  statsLoadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  statsContainer: {
    width: "100%",
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  typeBreakdown: {
    gap: 12,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  typeLabel: {
    flex: 1,
    fontSize: 15,
  },
  typeValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tagCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  profilePictureContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#4A90E2",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  tapHint: {
    fontSize: 13,
    marginBottom: 12,
    fontStyle: "italic",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
  },
  editButton: {
    width: "100%",
    marginBottom: 20,
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  updateButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutModalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  logoutIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(229, 62, 62, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoutTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  logoutMessage: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  logoutButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelLogoutButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  confirmLogoutButton: {
    // backgroundColor set dynamically
  },
  cancelLogoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmLogoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
  },
});
