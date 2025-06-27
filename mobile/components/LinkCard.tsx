import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";
import { IContentItem } from "../types";
import ContentCard from "./ContentCard";

interface LinkCardProps {
  item: IContentItem;
}

const LinkCard: React.FC<LinkCardProps> = ({ item }) => {
  const colors = useThemeColors();

  const handlePress = async () => {
    if (item.url) {
      await WebBrowser.openBrowserAsync(item.url);
    }
  };

  return (
    <ContentCard>
      <TouchableOpacity onPress={handlePress}>
        {item.previewImageUrl && (
          <Image
            source={{ uri: item.previewImageUrl }}
            style={styles.previewImage}
          />
        )}
        {item.title && (
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>
        )}
        {item.url && (
          <Text style={[styles.url, { color: colors.tint }]}>{item.url}</Text>
        )}
        {item.description && (
          <Text style={[styles.description, { color: colors.text }]}>
            {item.description}
          </Text>
        )}
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
