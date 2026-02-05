import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Modal from "react-native-modal";
import { useThemeColors } from "../constants/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

interface ContentCardProps {
  children: React.ReactNode;
  onDelete: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ children, onDelete }) => {
  const colors = useThemeColors();
  const [isModalVisible, setModalVisible] = React.useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    toggleModal();
  };

  return (
    <View
      style={[
        styles.cardContainer,
        { backgroundColor: colors.card, borderColor: colors.subtleBorder },
      ]}
    >
      {children}
      <TouchableOpacity
        onPress={toggleModal}
        style={[
          styles.deleteButton,
          { backgroundColor: colors.card, shadowColor: colors.text },
        ]}
      >
        <Ionicons name="trash-outline" size={24} color={colors.danger} />
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Delete Content
          </Text>
          <Text style={[styles.modalMessage, { color: colors.text }]}>
            Are you sure you want to delete this item?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={toggleModal}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteConfirmButton]}
              onPress={handleDeleteConfirm}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButton: {
    borderRadius: 20,
    position: "absolute",
    top: 4,
    right: 4,
    padding: 4,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
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
  deleteConfirmButton: {
    backgroundColor: "#ff4d4d",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ContentCard;
