import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";
import { ContentType, IContentItem } from "../types";
import CodeCard from "./CodeCard";
import LinkCard from "./LinkCard";
import TextCard from "./TextCard";

interface ContentListProps {
  contentItems: IContentItem[];
  onRefresh: () => void;
  refreshing: boolean;
}

const ContentList: React.FC<ContentListProps> = ({
  contentItems,
  onRefresh,
  refreshing,
}) => {
  const colors = useThemeColors();

  const renderItem = ({ item }: { item: IContentItem }) => {
    switch (item.type) {
      case ContentType.Text:
        return <TextCard item={item} />;
      case ContentType.Link:
        return <LinkCard item={item} />;
      case ContentType.Code:
        return <CodeCard item={item} />;
      default:
        return (
          <View
            style={{
              padding: 16,
              backgroundColor: colors.danger,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.text }}>
              Unknown content type: {item.type}
            </Text>
          </View>
        );
    }
  };

  return (
    <FlatList
      data={contentItems}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.text }}>
            No content items yet. Start by adding one!
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});

export default ContentList;
