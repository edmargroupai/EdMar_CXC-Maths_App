import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { radii, spacing } from "@edmar/design";
import { LogoMark, Wordmark } from "@/src/components/Logo";
import { MathDoodles } from "@/src/components/MathDoodles";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useThemeColors } from "@/src/theme/useThemeColors";

// S-01 (§17.3) visual preview — screen 1 of the onboarding flow (blueprint
// §C.1 "Screen 1 — Value, once"). Only this screen and (auth)/sign-in exist;
// the exam-sitting question, interests screen and the real anonymous first
// question are P13 work, not built here.

const FEATURES = [
  {
    key: "aligned",
    title: "CXC Aligned",
    description: "Questions mapped to the latest CXC Mathematics syllabus.",
    Icon: TargetIcon,
  },
  {
    key: "solutions",
    title: "Step-by-Step Solutions",
    description: "Understand every step with clear explanations.",
    Icon: BookIcon,
  },
  {
    key: "progress",
    title: "Track Your Progress",
    description: "Identify strengths, fix weaknesses and improve continuously.",
    Icon: ChartIcon,
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.hero, { backgroundColor: colors.navy }]}>
        <MathDoodles color="#FFFFFF" opacity={0.12} />
        <SafeAreaView edges={["top"]} style={styles.heroContent}>
          <View style={styles.topRow}>
            <View style={styles.brandRow}>
              <LogoMark
                size={34}
                capColor="#FFFFFF"
                bookColor={colors.gold}
                accentColor="#FFFFFF"
              />
              <Wordmark
                size={18}
                edColor="#FFFFFF"
                marColor={colors.gold}
                subtitleColor="rgba(255,255,255,0.75)"
              />
            </View>
            <PrimaryButton
              label="Sign In"
              variant="outlineOnDark"
              onPress={() => router.push("/(auth)/sign-in")}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.heroScroll}
          >
            <View style={styles.headlineBlock}>
              <Text style={styles.headline}>Practise.</Text>
              <Text style={styles.headline}>Understand.</Text>
              <Text style={[styles.headline, { color: colors.gold }]}>Master Maths.</Text>
              <Text style={styles.subtext}>Your CXC Maths practice partner for success.</Text>
            </View>

            <View style={styles.featureList}>
              {FEATURES.map(({ key, title, description, Icon }) => (
                <View key={key} style={styles.featureRow}>
                  <View style={styles.featureBadge}>
                    <Icon color={colors.navy} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{title}</Text>
                    <Text style={styles.featureDescription}>{description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>

      <SafeAreaView edges={["bottom"]} style={styles.ctaSection}>
        <PrimaryButton
          label="Get Started"
          variant="gold"
          onPress={() => router.push("/(auth)/sign-in")}
          accessibilityHint="Continues to sign in"
        />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Join thousands of students mastering CXC Mathematics.
        </Text>
      </SafeAreaView>
    </View>
  );
}

function TargetIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={2} />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}

function BookIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 5c3-1.5 6-1.5 8 0v14c-2-1.5-5-1.5-8 0V5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M20 5c-3-1.5-6-1.5-8 0v14c2-1.5 5-1.5 8 0V5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChartIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20V10M12 20V4M20 20v-7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    flex: 1,
    borderBottomLeftRadius: radii.xl * 2,
    borderBottomRightRadius: radii.xl * 2,
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroScroll: {
    paddingBottom: spacing.xl,
  },
  headlineBlock: {
    marginTop: spacing.xxl,
  },
  headline: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
  },
  subtext: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    marginTop: spacing.md,
    maxWidth: 280,
  },
  featureList: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  featureBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  featureDescription: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 2,
  },
  ctaSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
  },
});
