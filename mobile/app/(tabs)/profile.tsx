import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import { useThemeColors } from "@/constants/useColorScheme";
import useAuthStore from "@/stores/authStore";
import Button from "@/components/Button";
import { router } from "expo-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProfile, uploadProfilePicture } from "@/apis/updateProfile";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user, logout, updateUser } = useAuthStore();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user?.profilePictureUrl || ""
  );
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
    updateProfileMutation.mutate({ firstName, lastName, profilePictureUrl });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to make this work!"
      );
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage} disabled={isUploadingImage}>
          <Image
            source={{
              uri: user?.profilePictureUrl || "https://via.placeholder.com/150",
            }}
            style={styles.profilePicture}
          />
          {isUploadingImage && (
            <View style={styles.uploadingOverlay}>
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>

        <Text style={[styles.email, { color: colors.tint }]}>
          {user?.email}
        </Text>
      </View>

      <Button
        title="Edit Profile"
        onPress={() => setIsEditModalVisible(true)}
        style={styles.editButton}
      />

      <Modal
        isVisible={isEditModalVisible}
        onBackdropPress={() => setIsEditModalVisible(false)}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalText, { color: colors.text }]}>
              Edit Profile
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.subtleBorder },
              ]}
              placeholder="First Name"
              placeholderTextColor={colors.placeholderText}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.subtleBorder },
              ]}
              placeholder="Last Name"
              placeholderTextColor={colors.placeholderText}
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.subtleBorder },
              ]}
              placeholder="Profile Picture URL"
              placeholderTextColor={colors.placeholderText}
              value={profilePictureUrl}
              onChangeText={setProfilePictureUrl}
            />
            <Button title="Update" onPress={handleUpdateProfile} />
            <Button
              title="Cancel"
              onPress={() => setIsEditModalVisible(false)}
              variant="outline"
            />
          </View>
        </View>
      </Modal>

      <Button
        title="Logout"
        onPress={() => setIsLogoutModalVisible(true)}
        style={styles.logoutButton}
      />

      <Modal
        isVisible={isLogoutModalVisible}
        onBackdropPress={() => setIsLogoutModalVisible(false)}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalText, { color: colors.text }]}>
            Confirm Logout
          </Text>
          <Text style={[styles.modalMessage, { color: colors.text }]}>
            Are you sure you want to log out?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsLogoutModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.logoutConfirmButton]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
  },
  editButton: {
    width: "100%",
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: "auto",
    width: "100%",
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#555",
  },
  logoutConfirmButton: {
    backgroundColor: "#222",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
