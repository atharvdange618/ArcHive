import { Text, View } from "react-native";

export default function ErrorScreen({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "red", fontWeight: "bold" }}>App Crashed</Text>
      <Text>{error.message}</Text>
    </View>
  );
}
