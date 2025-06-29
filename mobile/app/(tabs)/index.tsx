import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ContentList from "../../components/ContentList";
import Fab from "../../components/Fab";
import { useThemeColors } from "../../constants/useColorScheme";
import useAuthStore from "../../stores/authStore";
import { ContentType, IContentItem } from "../../types";

export default function TabOneScreen() {
  const colors = useThemeColors();
  const user = useAuthStore((state) => state.user);

  // Dummy data for demonstration
  const dummyContent: IContentItem[] = [
    {
      _id: "1",
      userId: "user1",
      type: ContentType.Text,
      title: "My First Note",
      content:
        "This is a test note. It contains some important information that I want to remember.",
      tags: ["notes", "test"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "2",
      userId: "user1",
      type: ContentType.Link,
      title: "Reiatsu",
      url: "https://www.npmjs.com/package/reiatsu",
      description:
        "A minimal, type-safe HTTP server framework for Node.js, built from first principles using only Node.js core modules. Reiatsu is designed for simplicity, performance, and modern web development no dependencies, fully typed, and production-ready.",
      tags: ["http", "webserver", "framework", "nodejs"],
      previewImageUrl:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcodigoonclick.com%2Fwp-content%2Fuploads%2F2019%2F05%2Fnpm-nodejs.jpeg&f=1&nofb=1&ipt=98a773dbcb9cf791435d8cee5efef81eae6b3a13ef3ac7a2b8b7f9352d103f07",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "3",
      userId: "user1",
      type: ContentType.Code,
      title: "Python Hello World",
      content: "print('Hello World')",
      tags: ["python", "code", "algorithm"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "4",
      userId: "user1",
      type: ContentType.Text,
      title: "Meeting Notes",
      content:
        "Discussed project timelines, assigned tasks to John and Jane. Follow up on budget next week.",
      tags: ["work", "meeting"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.subtleBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Hello, {`${user?.username}!` || "ArcHive 💙"}
        </Text>
        <TouchableOpacity onPress={() => console.log("Search pressed")}>
          <FontAwesome name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content List */}
      <ContentList contentItems={dummyContent} />

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
