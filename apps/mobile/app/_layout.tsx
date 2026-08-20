import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "@/src/lib/AuthContext";

SplashScreen.preventAutoHideAsync();

// Visual-preview shell (see docs/PROJECT_INSTRUCTIONS.md "expedited preview"
// note), plus a minimal AuthProvider for the out-of-sequence sign-in
// preview (app/(auth)/sign-in.tsx, app/(app)/home.tsx). The real root
// layout — TanStack Query, the sync queue, theming, session persistence via
// expo-secure-store — is P14 (§19).
export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </AuthProvider>
  );
}
