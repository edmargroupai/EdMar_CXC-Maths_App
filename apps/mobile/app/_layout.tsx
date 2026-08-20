import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

// Visual-preview shell only (see docs/PROJECT_INSTRUCTIONS.md "expedited
// preview" note). The real root layout — providers for Supabase auth,
// TanStack Query, the sync queue, theming — is P14 (§19).
export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
