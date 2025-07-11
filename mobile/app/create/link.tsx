import { Stack } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColors } from "../../constants/useColorScheme";

export default function CreateLinkScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "New Link" }} />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.subtleBorder,
          },
        ]}
        placeholder="URL (required)"
        placeholderTextColor={colors.placeholderText}
      />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.subtleBorder,
          },
        ]}
        placeholder="Title (optional)"
        placeholderTextColor={colors.placeholderText}
      />
      <TextInput
        style={[
          styles.textArea,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.subtleBorder,
          },
        ]}
        placeholder="Description (optional)"
        placeholderTextColor={colors.placeholderText}
        multiline
        textAlignVertical="top"
      />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.subtleBorder,
          },
        ]}
        placeholder="Tags (comma-separated)"
        placeholderTextColor={colors.placeholderText}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.tint }]}
      >
        <Text style={[styles.buttonText, { color: colors.card }]}>
          Save Link
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
