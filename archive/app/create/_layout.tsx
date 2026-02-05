import { Stack } from "expo-router";

export default function CreateLayout() {
  return (
    <Stack>
      <Stack.Screen name="text" options={{ headerShown: true }} />
      <Stack.Screen name="link" options={{ headerShown: true }} />
      <Stack.Screen name="code" options={{ headerShown: true }} />
    </Stack>
  );
}
