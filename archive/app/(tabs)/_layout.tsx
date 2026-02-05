import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useThemeColors } from "../../constants/useColorScheme";
import ProfileTabButton from "@/components/ProfileTabButton";

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.subtleBorder,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={30} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarButton: (props) => <ProfileTabButton {...props} />,
        }}
      />
    </Tabs>
  );
}
