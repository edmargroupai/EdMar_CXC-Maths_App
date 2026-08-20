import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { radii, spacing } from "@edmar/design";
import { LogoMark, Wordmark } from "@/src/components/Logo";
import { MathDoodles } from "@/src/components/MathDoodles";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useThemeColors } from "@/src/theme/useThemeColors";

// S-02/S-03 (§17.3) visual preview of email+password / Google / Facebook
// sign-in (blueprint §C.2). Not wired to Supabase Auth yet — that, the
// age-band gate, and the anonymous->permanent migration are P13 (§25.1).
export default function SignInScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <MathDoodles color={colors.navy} opacity={0.08} />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandBlock}>
            <LogoMark
              size={72}
              capColor={colors.navy}
              bookColor={colors.gold}
              accentColor={colors.navy}
            />
            <View style={{ marginTop: spacing.sm }}>
              <Wordmark
                size={26}
                align="center"
                edColor={colors.navy}
                marColor={colors.gold}
                subtitleColor={colors.textSecondary}
              />
            </View>
          </View>

          <Text style={[styles.heading, { color: colors.navy }]}>Welcome Back!</Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Sign in to continue your learning journey.
          </Text>

          <View style={styles.form}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              colors={colors}
              icon={<MailIcon color={colors.textSecondary} />}
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!passwordVisible}
              colors={colors}
              icon={<LockIcon color={colors.textSecondary} />}
              trailing={
                <Pressable
                  onPress={() => setPasswordVisible((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                  hitSlop={8}
                >
                  <EyeIcon color={colors.textSecondary} open={passwordVisible} />
                </Pressable>
              }
            />

            <Pressable accessibilityRole="button" style={styles.forgotRow}>
              <Text style={[styles.forgotText, { color: colors.brand }]}>Forgot Password?</Text>
            </Pressable>

            <PrimaryButton
              label="Sign In"
              variant="brand"
              onPress={() => {
                // No backend yet (P13). Visual preview only.
              }}
            />

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <SocialButton label="Continue with Google" colors={colors} icon={<GoogleGlyph />} />
            <SocialButton label="Continue with Facebook" colors={colors} icon={<FacebookGlyph />} />
          </View>

          <View style={styles.signUpRow}>
            <Text style={{ color: colors.textSecondary }}>Don&apos;t have an account? </Text>
            <Pressable
              onPress={() => router.push("/(onboarding)/welcome")}
              accessibilityRole="button"
            >
              <Text style={[styles.signUpLink, { color: colors.brand }]}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  colors: ReturnType<typeof useThemeColors>;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences";
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  icon,
  trailing,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.navy }]}>{label}</Text>
      <View
        style={[styles.fieldBox, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        {icon}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.fieldInput, { color: colors.textPrimary }]}
        />
        {trailing}
      </View>
    </View>
  );
}

function SocialButton({
  label,
  icon,
  colors,
}: {
  label: string;
  icon: React.ReactNode;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.socialButton,
        { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      {icon}
      <Text style={[styles.socialLabel, { color: colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

function MailIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18v12H3V6Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="m3 7 9 6 9-6" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

function LockIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 11h12v9H6v-9Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function EyeIcon({ color, open }: { color: string; open: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" stroke={color} strokeWidth={2} />
      <Circle cx="12" cy="12" r={open ? 3 : 0.5} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function GoogleGlyph() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22 12.2c0-.8-.07-1.4-.2-2H12v3.9h5.6c-.24 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6Z"
      />
      <Path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.9-2.4l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10 10 0 0 0 12 22Z"
      />
      <Path fill="#FBBC05" d="M6.2 13.7a6 6 0 0 1 0-3.4V7.6H2.7a10 10 0 0 0 0 8.8l3.5-2.7Z" />
      <Path
        fill="#EA4335"
        d="M12 6.4c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 3.3 14.6 2.3 12 2.3a10 10 0 0 0-9.3 5.3l3.5 2.7c.8-2.5 3.1-4 5.8-4Z"
      />
    </Svg>
  );
}

function FacebookGlyph() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11" fill="#1877F2" />
      <Path
        d="M13.4 21v-7h2.3l.35-2.7h-2.65V9.6c0-.78.22-1.32 1.34-1.32h1.43V5.87c-.25-.03-1.1-.11-2.1-.11-2.08 0-3.5 1.27-3.5 3.6v2h-2.35v2.7h2.35v7h2.83Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  brandBlock: {
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: spacing.xl,
  },
  subheading: {
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
  },
  forgotRow: {
    alignItems: "flex-end",
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.lg,
    minHeight: 48,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  signUpLink: {
    fontWeight: "700",
  },
});
