import { createClient } from "@supabase/supabase-js";

// Minimal out-of-sequence auth preview (see app/(auth)/sign-in.tsx). The real
// client — session persistence via expo-secure-store, TanStack Query
// integration, the sync queue — is D-11/P14 (§19). This one deliberately
// does not persist sessions, so it doesn't establish a storage pattern that
// P14 would then have to rip out.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — set them in apps/mobile/.env.local",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
