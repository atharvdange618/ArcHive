import { useQuery } from "@tanstack/react-query";
import { FontAwesome } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ContentList from "../../components/ContentList";
import Fab from "../../components/Fab";
import { useThemeColors } from "../../constants/useColorScheme";
import { IContentItem } from "../../types";
import { getContent } from "../../apis/getContent";

export default function TabOneScreen() {
  const colors = useThemeColors();

  const {
    data: content,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<IContentItem[], Error>({
    queryKey: ["content"],
    queryFn: async () => {
      const response = await getContent();
      return response.data;
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.subtleBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          ArcHive 💙
        </Text>
        <TouchableOpacity onPress={() => console.log("Search pressed")}>
          <FontAwesome name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {isLoading ? (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          size="large"
          color={colors.primary}
        />
      ) : (
        <ContentList
          contentItems={content || []}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}

      {/* Floating Action Button (FAB) */}
      <Fab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
