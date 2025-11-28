import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeColors } from "../constants/useColorScheme";

interface EmptyStateProps {
  type?: "default" | "search" | "filter";
  searchQuery?: string;
  filterType?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = "default",
  searchQuery,
  filterType,
}) => {
  const colors = useThemeColors();

  const getEmptyStateContent = () => {
    switch (type) {
      case "search":
        return {
          icon: "search",
          title: "No results found",
          description: searchQuery
            ? `We couldn't find anything matching "${searchQuery}"`
            : "Try searching with different keywords",
          iconColor: colors.primary,
        };
      case "filter":
        return {
          icon: "filter",
          title: `No ${filterType} items`,
          description: `You don't have any ${filterType?.toLowerCase()} content yet. Create one to get started!`,
          iconColor: colors.primary,
        };
      default:
        return {
          icon: "archive",
          title: "Your ArcHive is empty",
          description:
            "Start building your knowledge base by adding your first item!",
          iconColor: colors.primary,
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${content.iconColor}15` },
        ]}
      >
        <FontAwesome5 name={content.icon} size={64} color={content.iconColor} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {content.title}
      </Text>
      <Text style={[styles.description, { color: colors.secondary }]}>
        {content.description}
      </Text>
      {type === "default" && (
        <View style={styles.tipsContainer}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            Quick Tips:
          </Text>
          <View style={styles.tipItem}>
            <FontAwesome5
              name="plus-circle"
              size={16}
              color={colors.primary}
              style={styles.tipIcon}
            />
            <Text style={[styles.tipText, { color: colors.secondary }]}>
              Tap the + button to create new content
            </Text>
          </View>
          <View style={styles.tipItem}>
            <FontAwesome5
              name="link"
              size={16}
              color={colors.primary}
              style={styles.tipIcon}
            />
            <Text style={[styles.tipText, { color: colors.secondary }]}>
              Save links, code snippets, or notes
            </Text>
          </View>
          <View style={styles.tipItem}>
            <FontAwesome5
              name="search"
              size={16}
              color={colors.primary}
              style={styles.tipIcon}
            />
            <Text style={[styles.tipText, { color: colors.secondary }]}>
              Use search to find your saved content
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  tipsContainer: {
    width: "100%",
    maxWidth: 320,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
    width: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default EmptyState;
