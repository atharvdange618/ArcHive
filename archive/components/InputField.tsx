import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useThemeColors } from "../constants/useColorScheme";

import { Ionicons } from "@expo/vector-icons";

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  isPassword,
  style,
  ...props
}) => {
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: error ? "red" : colors.subtleBorder,
            },
            style,
          ]}
          placeholderTextColor={colors.placeholderText}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color={colors.text}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 6,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputField;
