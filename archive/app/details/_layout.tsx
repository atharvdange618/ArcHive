import { Stack } from "expo-router";

export default function DetailsLayout() {
  return (
    <Stack>
      <Stack.Screen name="code-detail" options={{ headerShown: false }} />
      <Stack.Screen name="text-detail" options={{ headerShown: false }} />
    </Stack>
  );
}
