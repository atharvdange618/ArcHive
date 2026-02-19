import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getPlatforms } from "../../apis/getPlatforms";
import { PlatformCard } from "../../components/PlatformCard";
import EmptyState from "../../components/EmptyState";
import { Colors } from "../../constants/Colors";

export default function BrowseScreen() {
  const {
    data: platforms,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["platforms"],
    queryFn: getPlatforms,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load platforms</Text>
      </View>
    );
  }

  if (!platforms || platforms.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState type="default" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse by Platform</Text>
        <Text style={styles.headerSubtitle}>
          {platforms.length} {platforms.length === 1 ? "platform" : "platforms"}
        </Text>
      </View>
      <FlatList
        data={platforms}
        keyExtractor={(item) => item.platform}
        renderItem={({ item }) => (
          <PlatformCard platform={item.platform} count={item.count} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.light.tint}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#666",
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
});
