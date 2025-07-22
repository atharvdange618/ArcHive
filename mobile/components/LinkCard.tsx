import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";
import { IContentItem } from "../types";
import ContentCard from "./ContentCard";
import HighlightText from "./HighlightText";

interface LinkCardProps {
  item: IContentItem;
  searchQuery?: string;
  onDelete: () => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ item, searchQuery, onDelete }) => {
  const colors = useThemeColors();

  const handlePress = async () => {
    if (item.url) {
      await WebBrowser.openBrowserAsync(item.url);
    }
  };

  return (
    <ContentCard onDelete={onDelete}>
      <TouchableOpacity onPress={handlePress}>
        {item.previewImageUrl && (
          <Image
            source={{ uri: item.previewImageUrl }}
            style={styles.previewImage}
          />
        )}
        {item.title && (
          <HighlightText
            text={item.title}
            highlight={searchQuery || ""}
            style={[styles.title, { color: colors.text }]}
          />
        )}
        {item.url && (
          <HighlightText
            text={item.url}
            highlight={searchQuery || ""}
            style={[styles.url, { color: colors.tint }]}
          />
        )}
        {item.description && (
          <HighlightText
            text={item.description}
            highlight={searchQuery || ""}
            style={[styles.description, { color: colors.text }]}
          />
        )}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <Text
                key={index}
                style={[
                  styles.tag,
                  { backgroundColor: colors.tint, color: colors.text },
                ]}
              >
                {tag}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </ContentCard>
  );
};

const styles = StyleSheet.create({
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  url: {
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
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

export default LinkCard;
