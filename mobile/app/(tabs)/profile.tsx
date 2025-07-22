import { View, Text, StyleSheet, Image, Modal, TextInput } from "react-native";
import { useThemeColors } from "@/constants/useColorScheme";
import useAuthStore from "@/stores/authStore";
import Button from "@/components/Button";
import { router } from "expo-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/apis/updateProfile";

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user, logout, updateUser } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user?.profilePictureUrl || ""
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      updateUser(data.user);
      setModalVisible(false);
    },
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({ firstName, lastName, profilePictureUrl });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: user?.profilePictureUrl || "https://via.placeholder.com/150",
          }}
          style={styles.profilePicture}
        />
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        
        <Text style={[styles.email, { color: colors.tint }]}>
          {user?.email}
        </Text>
      </View>

      <Button
        title="Edit Profile"
        onPress={() => setModalVisible(true)}
        style={styles.editButton}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View
            style={[
              {
                margin: 20,
                borderRadius: 20,
                padding: 35,
                alignItems: "center",
                shadowColor: colors.text,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              },
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.modalText, { color: colors.text }]}>
              Edit Profile
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.subtleBorder },
              ]}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.subtleBorder },
              ]}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.subtleBorder },
              ]}
              placeholder="Profile Picture URL"
              value={profilePictureUrl}
              onChangeText={setProfilePictureUrl}
            />
            <Button title="Update" onPress={handleUpdateProfile} />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              variant="outline"
            />
          </View>
        </View>
      </Modal>

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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
});
