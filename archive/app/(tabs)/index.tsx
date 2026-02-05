import { useInfiniteQuery } from "@tanstack/react-query";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import ContentList from "../../components/ContentList";
import Fab from "../../components/Fab";
import { useThemeColors } from "../../constants/useColorScheme";
import { getContent } from "../../apis/getContent";
import { addRecentSearch, getRecentSearches } from "../../utils/recentSearches";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const contentTypes = ["All", "Link", "Text", "Code"];

export default function TabOneScreen() {
  const colors = useThemeColors();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedContentType, setSelectedContentType] = useState("All");

  const headerHeight = useSharedValue(100);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["contents", debouncedSearchQuery, selectedContentType],
    queryFn: async ({ pageParam = 1 }) => {
      if (debouncedSearchQuery) {
        await addRecentSearch(debouncedSearchQuery);
      }
      const response = await getContent(
        debouncedSearchQuery,
        pageParam,
        10,
        selectedContentType === "All"
          ? undefined
          : selectedContentType.toLowerCase(),
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
  });

  const content = data?.pages.flatMap((page) => page.data) || [];

  useEffect(() => {
    if (isSearchVisible && !debouncedSearchQuery) {
      getRecentSearches().then(setRecentSearches);
    }
  }, [isSearchVisible, debouncedSearchQuery]);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    setSearchQuery("");
    headerHeight.value = withTiming(isSearchVisible ? 100 : 120, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.header,
          { borderBottomColor: colors.subtleBorder },
          animatedHeaderStyle,
        ]}
      >
        {!isSearchVisible ? (
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              ArcHive 💙
            </Text>
            <TouchableOpacity onPress={toggleSearch}>
              <FontAwesome name="search" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search your ArcHive..."
              placeholderTextColor={colors.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={toggleSearch}>
              <FontAwesome name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {isSearchVisible ? (
        <View style={{ flex: 1 }}>
          <View style={styles.filterContainer}>
            {contentTypes.map((type) => {
              const isSelected = selectedContentType === type;
              const getIcon = () => {
                switch (type) {
                  case "Link":
                    return "link";
                  case "Text":
                    return "file-text";
                  case "Code":
                    return "code";
                  default:
                    return "th-large";
                }
              };

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    isSelected && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    },
                  ]}
                  onPress={() => setSelectedContentType(type)}
                >
                  <FontAwesome5
                    name={getIcon()}
                    size={14}
                    color={isSelected ? "#FFFFFF" : colors.secondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color: isSelected ? "#FFFFFF" : colors.text,
                        fontWeight: isSelected ? "600" : "500",
                      },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {debouncedSearchQuery || selectedContentType !== "All" ? (
            <ContentList
              contentItems={content || []}
              onRefresh={refetch}
              refreshing={isRefetching}
              searchQuery={debouncedSearchQuery}
              emptyStateType={
                debouncedSearchQuery
                  ? "search"
                  : selectedContentType !== "All"
                    ? "filter"
                    : "default"
              }
              filterType={selectedContentType}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : undefined
              }
            />
          ) : isSearchVisible && recentSearches.length > 0 ? (
            <View style={styles.recentSearchesContainer}>
              <View style={styles.recentSearchesHeader}>
                <FontAwesome5 name="history" size={20} color={colors.primary} />
                <Text
                  style={[styles.recentSearchesTitle, { color: colors.text }]}
                >
                  Recent Searches
                </Text>
              </View>
              <View style={styles.recentSearchesList}>
                {recentSearches.map((term) => (
                  <TouchableOpacity
                    key={term}
                    onPress={() => setSearchQuery(term)}
                    style={[
                      styles.recentSearchItem,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <FontAwesome5
                      name="search"
                      size={14}
                      color={colors.secondary}
                      style={styles.searchItemIcon}
                    />
                    <Text
                      style={[styles.recentSearchText, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {term}
                    </Text>
                    <FontAwesome5
                      name="arrow-right"
                      size={14}
                      color={colors.secondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptySearchContainer}>
              <View
                style={[
                  styles.emptySearchIconContainer,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <FontAwesome5 name="search" size={56} color={colors.primary} />
              </View>
              <Text style={[styles.emptySearchTitle, { color: colors.text }]}>
                Start Your Search
              </Text>
              <Text
                style={[
                  styles.emptySearchDescription,
                  { color: colors.secondary },
                ]}
              >
                Type in the search box above to find your saved links, notes,
                and code snippets
              </Text>
              <View style={styles.searchTipsContainer}>
                <View style={styles.searchTipItem}>
                  <View
                    style={[
                      styles.tipBadge,
                      { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <FontAwesome5
                      name="lightbulb"
                      size={14}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    style={[styles.searchTipText, { color: colors.secondary }]}
                  >
                    Search by title, description, or content
                  </Text>
                </View>
                <View style={styles.searchTipItem}>
                  <View
                    style={[
                      styles.tipBadge,
                      { backgroundColor: `${colors.primary}20` },
                    ]}
                  >
                    <FontAwesome5
                      name="filter"
                      size={14}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    style={[styles.searchTipText, { color: colors.secondary }]}
                  >
                    Use filters to narrow down by type
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        <ContentList
          contentItems={content || []}
          onRefresh={refetch}
          refreshing={isRefetching}
          emptyStateType="default"
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : undefined
          }
        />
      )}

      <Fab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    marginRight: 10,
  },
  recentSearchesContainer: {
    padding: 16,
  },
  recentSearchesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  recentSearchesList: {
    gap: 8,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  searchItemIcon: {
    opacity: 0.6,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 15,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptySearchIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptySearchTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySearchDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  searchTipsContainer: {
    width: "100%",
    maxWidth: 320,
    gap: 16,
  },
  searchTipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  searchTipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: "transparent",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#CBD5E0",
    backgroundColor: "transparent",
  },
  filterButtonText: {
    fontSize: 14,
  },
});
