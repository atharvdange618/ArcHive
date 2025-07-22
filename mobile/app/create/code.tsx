import { Stack, router } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useThemeColors } from "../../constants/useColorScheme";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContent } from "@/apis/createContent";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const codeSchema = z.object({
  title: z.string().optional(),
  code: z.string().min(1, "Code snippet cannot be empty."),
  tags: z.string().optional(),
});

type CodeFormData = z.infer<typeof codeSchema>;

export default function CreateCodeScreen() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      code: "",
      tags: "",
    },
  });

  const { mutate: createCodeContent, isPending } = useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      router.back();
    },
    onError: (error: any) => {
      let errorMessage = "Failed to save code snippet.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.details
      ) {
        const { errors } = error.response.data.details;
        if (errors && errors.length > 0) {
          errorMessage = errors
            .map((e: { message: string }) => e.message)
            .join("\n");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Validation Error", errorMessage);
    },
  });

  const handleSave = (data: CodeFormData) => {
    createCodeContent({
      title: data.title,
      code: data.code,
      tags:
        data.tags
          ?.split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag) || [],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "New Code Snippet" }} />
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: errors.title ? colors.danger : colors.subtleBorder,
              },
            ]}
            placeholder="Title (optional)"
            placeholderTextColor={colors.placeholderText}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: errors.code ? colors.danger : colors.subtleBorder,
                fontFamily: "SpaceMono-Regular",
              },
            ]}
            placeholder="Your code snippet..."
            placeholderTextColor={colors.placeholderText}
            multiline
            textAlignVertical="top"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.code && (
        <Text style={styles.errorText}>{errors.code.message}</Text>
      )}
      <Controller
        control={control}
        name="tags"
        render={({ field: { onChange, onBlur, value } }) => (
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
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.tint }]}
        onPress={handleSubmit(handleSave)}
        disabled={isPending}
      >
        <Text style={[styles.buttonText, { color: colors.card }]}>
          {isPending ? "Saving..." : "Save Code"}
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
  errorText: {
    color: "#ff0000",
    marginBottom: 16,
    fontSize: 14,
  },
});
