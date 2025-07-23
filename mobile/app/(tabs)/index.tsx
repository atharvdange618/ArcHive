import { useInfiniteQuery } from "@tanstack/react-query";
import { FontAwesome } from "@expo/vector-icons";
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
          : selectedContentType.toLowerCase()
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
            {contentTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  selectedContentType === type && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedContentType(type)}
              >
                <Text
                  style={{
                    color:
                      selectedContentType === type
                        ? colors.background
                        : colors.text,
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {debouncedSearchQuery || selectedContentType !== "All" ? (
            <ContentList
              contentItems={content || []}
              onRefresh={refetch}
              refreshing={isRefetching}
              searchQuery={debouncedSearchQuery}
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
              <Text
                style={[styles.recentSearchesTitle, { color: colors.text }]}
              >
                Recent Searches
              </Text>
              {recentSearches.map((term) => (
                <TouchableOpacity
                  key={term}
                  onPress={() => setSearchQuery(term)}
                  style={styles.recentSearchItem}
                >
                  <Text style={{ color: colors.primary }}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View>
              <Text style={{ color: colors.text }}>
                No recent searches. Start typing to search.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ContentList
          contentItems={content || []}
          onRefresh={refetch}
          refreshing={isRefetching}
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
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recentSearchItem: {
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
