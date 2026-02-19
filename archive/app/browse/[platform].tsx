import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getContent } from "../../apis/getContent";
import ContentList from "../../components/ContentList";
import EmptyState from "../../components/EmptyState";
import { Colors } from "../../constants/Colors";
import { getPlatformDisplayName } from "../../constants/platforms";

export default function PlatformDetailScreen() {
  const { platform } = useLocalSearchParams();
  const platformStr = Array.isArray(platform) ? platform[0] : platform;
  const displayName = getPlatformDisplayName(platformStr || "");
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: displayName,
    });
  }, [displayName, navigation]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["contents", "platform", platformStr],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getContent(
        undefined,
        pageParam,
        20,
        undefined,
        platformStr,
      );
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!platformStr,
  });

  const content = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.meta.totalCount || 0;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Failed to load content</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {totalCount} {totalCount === 1 ? "item" : "items"}
        </Text>
      </View>
      {content.length === 0 ? (
        <EmptyState type="filter" filterType={displayName} />
      ) : (
        <ContentList
          contentItems={content}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color={Colors.light.tint}
                style={styles.loader}
              />
            ) : undefined
          }
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: Colors.light.background,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  loader: {
    paddingVertical: 20,
  },
});
