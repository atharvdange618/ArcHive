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

export default function TabOneScreen() {
  const colors = useThemeColors();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const headerHeight = useSharedValue(100);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["contents", debouncedSearchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      if (debouncedSearchQuery) {
        await addRecentSearch(debouncedSearchQuery);
      }
      const response = await getContent(debouncedSearchQuery, pageParam);
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          size="large"
          color={colors.primary}
        />
      );
    }

    if (debouncedSearchQuery) {
      return (
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
      );
    }

    if (isSearchVisible && recentSearches.length > 0) {
      return (
        <View style={styles.recentSearchesContainer}>
          <Text style={[styles.recentSearchesTitle, { color: colors.text }]}>
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
      );
    }

    return (
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
    );
  };

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

      {renderContent()}

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
});
