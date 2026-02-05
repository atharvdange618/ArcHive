import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";
import { IContentItem } from "../types";
import ContentCard from "./ContentCard";
import HighlightText from "./HighlightText";
import { router } from "expo-router";

interface CodeCardProps {
  item: IContentItem;
  searchQuery?: string;
  onDelete: () => void;
}

const CodeCard: React.FC<CodeCardProps> = ({ item, searchQuery, onDelete }) => {
  const colors = useThemeColors();

  const handlePress = () => {
    router.push(`/details/code-detail?id=${item._id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <ContentCard onDelete={onDelete}>
        {item.title && (
          <HighlightText
            text={item.title}
            highlight={searchQuery || ""}
            style={[styles.title, { color: colors.text }]}
          />
        )}
        <View
          style={[styles.codeContainer, { backgroundColor: colors.background }]}
        >
          <HighlightText
            text={item.content as string}
            highlight={searchQuery || ""}
            style={[styles.code, { color: colors.text }]}
          />
        </View>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View
                key={index}
                style={[styles.tagContainer, { backgroundColor: colors.tint }]}
              >
                <Text style={[styles.tagText, { color: colors.text }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ContentCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  codeContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  code: {
    fontFamily: "SpaceMono",
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    alignItems: "flex-start",
  },
  tagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
  },
});

export default CodeCard;
