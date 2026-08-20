import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, radii } from "@edmar/design";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useThemeColors } from "@/src/theme/useThemeColors";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/lib/AuthContext";

// Minimal authenticated landing screen proving the sign-in preview works
// end-to-end against real Supabase Auth + RLS. Reads `profiles` directly in
// snake_case here rather than through a camelCase mapper — @edmar/api-client
// (D-15, the only place that conversion is allowed to happen) doesn't exist
// yet. The real post-login shell (tabs, TanStack Query, §19) is P14.
interface ProfileRow {
  id: string;
  email: string;
  role: string;
  syllabus_version: string;
  territory: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { session, setSession } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.replace("/(auth)/sign-in");
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, email, role, syllabus_version, territory")
      .eq("id", session.user.id)
      .single()
      .then(({ data, error: queryError }) => {
        if (cancelled) return;
        if (queryError) setError(queryError.message);
        else setProfile(data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    router.replace("/(auth)/sign-in");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.heading, { color: colors.navy }]}>You&apos;re signed in</Text>
          {loading ? (
            <ActivityIndicator color={colors.brand} style={{ marginTop: spacing.xl }} />
          ) : error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          ) : profile ? (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Row label="Email" value={profile.email} colors={colors} />
              <Row label="Role" value={profile.role} colors={colors} />
              <Row label="Syllabus" value={profile.syllabus_version} colors={colors} />
              <Row label="Territory" value={profile.territory} colors={colors} />
            </View>
          ) : null}

          <View style={{ marginTop: spacing.xxl }}>
            <PrimaryButton label="Sign Out" variant="outlineOnLight" onPress={handleSignOut} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Row({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, flexGrow: 1 },
  heading: { fontSize: 24, fontWeight: "800" },
  errorText: { marginTop: spacing.lg, fontSize: 14, fontWeight: "600" },
  card: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: { gap: 2 },
  rowLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  rowValue: { fontSize: 16 },
});
