import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../constants/useColorScheme";
import { IContentItem } from "../types";
import { formatDate } from "../utils/helpers";
import ContentCard from "./ContentCard";
import HighlightText from "./HighlightText";
import { getPlatformIcon, getPlatformColor } from "../constants/platforms";

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
        {item.platform && (
          <View
            style={[
              styles.platformBadge,
              { backgroundColor: getPlatformColor(item.platform) },
            ]}
          >
            <Ionicons
              name={getPlatformIcon(item.platform) as any}
              size={14}
              color="#fff"
            />
          </View>
        )}
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
        {item.createdAt && (
          <Text style={[styles.date, { color: colors.text, opacity: 0.6 }]}>
            {formatDate(item.createdAt)}
          </Text>
        )}
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
      </TouchableOpacity>
    </ContentCard>
  );
};

const styles = StyleSheet.create({
  platformBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
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
  date: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
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

export default LinkCard;
