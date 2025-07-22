import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

interface ContentCardProps {
  children: React.ReactNode;
  onDelete: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ children, onDelete }) => {
  const colors = useThemeColors();

  const handleDelete = () => {
    Alert.alert(
      "Delete Content",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: onDelete,
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          padding: 16,
          marginBottom: 12,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        { backgroundColor: colors.card, borderColor: colors.subtleBorder },
      ]}
    >
      {children}
      <TouchableOpacity
        onPress={handleDelete}
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
          position: "absolute",
          top: 4,
          right: 4,
          padding: 4,
        }}
      >
        <Ionicons name="trash-outline" size={24} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
};

export default ContentCard;
