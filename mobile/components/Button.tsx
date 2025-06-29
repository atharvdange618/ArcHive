import React from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "outline";
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  variant = "primary",
}) => {
  const colors = useThemeColors();

  const getButtonStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.tint,
          borderColor: colors.tint,
        };
      case "secondary":
        return {
          backgroundColor: colors.card,
          borderColor: colors.subtleBorder,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.tint,
          borderWidth: 1,
        };
      default:
        return {};
    }
  };

  const getButtonTextStyles = () => {
    switch (variant) {
      case "primary":
        return { color: "#FFFFFF" };
      case "secondary":
        return { color: colors.text };
      case "outline":
        return { color: colors.tint };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyles(), style]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, getButtonTextStyles()]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Button;
