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

const linkSchema = z.object({
  url: z.string().url("Please enter a valid URL."),
  title: z.string().optional(),
  description: z.string().optional(),
});

type LinkFormData = z.infer<typeof linkSchema>;

export default function CreateLinkScreen() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      url: "",
      title: "",
      description: "",
    },
  });

  const { mutate: createLinkContent, isPending } = useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      router.back();
    },
    onError: (error: any) => {
      let errorMessage = "Failed to save link.";
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

  const handleSave = (data: LinkFormData) => {
    createLinkContent({
      url: data.url,
      title: data.title,
      description: data.description,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "New Link" }} />
      <Controller
        control={control}
        name="url"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: errors.url ? colors.danger : colors.subtleBorder,
              },
            ]}
            placeholder="URL (required)"
            placeholderTextColor={colors.placeholderText}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
          />
        )}
      />
      {errors.url && <Text style={styles.errorText}>{errors.url.message}</Text>}
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
                borderColor: colors.subtleBorder,
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
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
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
          {isPending ? "Saving..." : "Save Link"}
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
