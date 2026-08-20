import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { radii, minTouchTarget } from "@edmar/design";
import { useThemeColors } from "@/src/theme/useThemeColors";

export type ButtonVariant = "gold" | "brand" | "outlineOnDark" | "outlineOnLight";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  accessibilityHint?: string;
}

/** The one pill-button primitive used by both onboarding and auth screens. */
export function PrimaryButton({
  label,
  onPress,
  variant = "brand",
  icon,
  accessibilityHint,
}: PrimaryButtonProps) {
  const colors = useThemeColors();

  const backgroundColor =
    variant === "gold" ? colors.gold : variant === "brand" ? colors.brand : "transparent";
  const textColor =
    variant === "gold" ? colors.textOnGold : variant === "brand" ? colors.textOnBrand : colors.navy;
  const borderColor = variant === "outlineOnDark" ? "rgba(255,255,255,0.7)" : colors.navy;
  const bordered = variant === "outlineOnDark" || variant === "outlineOnLight";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, opacity: pressed ? 0.85 : 1 },
        bordered && { borderWidth: 1.5, borderColor },
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text
          style={[styles.label, { color: variant === "outlineOnDark" ? "#FFFFFF" : textColor }]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget,
    borderRadius: radii.pill,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
