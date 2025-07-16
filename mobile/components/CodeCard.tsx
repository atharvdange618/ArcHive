import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";
import { IContentItem } from "../types";
import ContentCard from "./ContentCard";
import HighlightText from "./HighlightText";

interface CodeCardProps {
  item: IContentItem;
  searchQuery?: string;
}

const CodeCard: React.FC<CodeCardProps> = ({ item, searchQuery }) => {
  const colors = useThemeColors();

  return (
    <ContentCard>
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
            <Text
              key={index}
              style={[
                styles.tag,
                { backgroundColor: colors.tint, color: colors.card },
              ]}
            >
              {tag}
            </Text>
          ))}
        </View>
      )}
    </ContentCard>
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
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
});

export default CodeCard;
