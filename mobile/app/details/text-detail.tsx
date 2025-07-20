import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useThemeColors } from "../../constants/useColorScheme";
import { useQuery } from "@tanstack/react-query";
import { getContentById } from "../../apis/getContent";
import HighlightText from "@/components/HighlightText";

export default function TextDetailScreen() {
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
          Failed to load text note.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: contentItem.title || "Text Note" }} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {contentItem.title && (
          <Text style={[styles.title, { color: colors.text }]}>
            {contentItem.title}
          </Text>
        )}
        <View
          style={[
            styles.textContainer,
            { backgroundColor: colors.card, borderColor: colors.subtleBorder },
          ]}
        >
          <HighlightText
            text={contentItem.content || ""}
            highlight={contentItem.content || ""}
            style={[styles.textContent, { color: colors.text }]}
          ></HighlightText>
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
  textContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
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
