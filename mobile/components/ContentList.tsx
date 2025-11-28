import React from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";
import { ContentType, IContentItem } from "../types";
import CodeCard from "./CodeCard";
import LinkCard from "./LinkCard";
import TextCard from "./TextCard";
import EmptyState from "./EmptyState";
import { FlashList } from "@shopify/flash-list";
import { useDeleteContent } from "../hooks/useDeleteContent";

interface ContentListProps {
  contentItems: IContentItem[];
  onRefresh: () => void;
  refreshing: boolean;
  searchQuery?: string;
  onEndReached?: () => void;
  ListFooterComponent?: React.ReactElement;
  emptyStateType?: "default" | "search" | "filter";
  filterType?: string;
}

const ContentList: React.FC<ContentListProps> = ({
  contentItems,
  onRefresh,
  refreshing,
  searchQuery,
  onEndReached,
  ListFooterComponent,
  emptyStateType = "default",
  filterType,
}) => {
  const colors = useThemeColors();
  const { mutate: deleteContent } = useDeleteContent(onRefresh);

  const renderItem = ({ item }: { item: IContentItem }) => {
    const onDelete = () => deleteContent(item._id);

    switch (item.type) {
      case ContentType.Text:
        return (
          <TextCard item={item} searchQuery={searchQuery} onDelete={onDelete} />
        );
      case ContentType.Link:
        return (
          <LinkCard item={item} searchQuery={searchQuery} onDelete={onDelete} />
        );
      case ContentType.Code:
        return (
          <CodeCard item={item} searchQuery={searchQuery} onDelete={onDelete} />
        );
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
    <FlashList
      data={contentItems}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyState
          type={emptyStateType}
          searchQuery={searchQuery}
          filterType={filterType}
        />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent}
      estimatedItemSize={150}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    padding: 16,
  },
});

export default ContentList;
