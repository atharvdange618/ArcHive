import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useThemeColors } from "../../constants/useColorScheme";
import { useQuery } from "@tanstack/react-query";
import { getContentById } from "../../apis/getContent";
import HighlightText from "@/components/HighlightText";
import * as Clipboard from "expo-clipboard";
import { FontAwesome } from "@expo/vector-icons";

export default function CodeDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();

  const {
    data: contentItem,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["content", id],
    queryFn: () => getContentById(id as string),
    enabled: !!id,
  });

  const handleCopyToClipboard = async () => {
    if (contentItem?.content) {
      await Clipboard.setStringAsync(contentItem.content);
      alert("Code copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !contentItem) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          Failed to load code snippet.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: contentItem.title || "Code Snippet" }} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {contentItem.title && (
          <Text style={[styles.title, { color: colors.text }]}>
            {contentItem.title}
          </Text>
        )}

        <View
          style={[
            styles.codeBlockHeader,
            { borderBottomColor: colors.subtleBorder },
          ]}
        >
          <Text style={[styles.codeBlockTitle, { color: colors.text }]}>
            Code
          </Text>
          <TouchableOpacity
            onPress={handleCopyToClipboard}
            style={styles.copyButton}
          >
            <FontAwesome name="copy" size={16} color={colors.text} />
            <Text style={[styles.copyButtonText, { color: colors.text }]}>
              Copy
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.codeContainer,
            { backgroundColor: colors.card, borderColor: colors.subtleBorder },
          ]}
        >
          <HighlightText
            text={contentItem.content || ""}
            highlight={contentItem.content || ""}
            style={[styles.codeContent, { color: colors.text }]}
          />
        </View>

        {contentItem.tags && contentItem.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {contentItem.tags.map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: colors.tint }]}
              >
                <Text style={[styles.tagText, { color: colors.card }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.timestampsContainer}>
          <Text style={[styles.timestamp, { color: colors.secondary }]}>
            Created: {new Date(contentItem.createdAt).toLocaleString()}
          </Text>
          <Text style={[styles.timestamp, { color: colors.secondary }]}>
            Updated: {new Date(contentItem.updatedAt).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
    textAlign: "center",
  },
  codeBlockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
  },
  codeBlockTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  copyButtonText: {
    marginLeft: 5,
    fontSize: 14,
  },
  codeContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  codeContent: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "SpaceMono-Regular" : "monospace", // Fallback for Android
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  timestampsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 10,
  },
  timestamp: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 5,
  },
});
