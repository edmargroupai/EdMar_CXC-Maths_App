import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { tokens } from "@edmar/design";

interface LogoMarkProps {
  size?: number;
  capColor?: string;
  bookColor?: string;
  accentColor?: string;
}

/** Graduation-cap-over-open-book mark. A simplified redraw of the reference
 * logo — not a pixel copy of any commissioned artwork. */
export function LogoMark({
  size = 48,
  capColor = tokens.colors.light.navy,
  bookColor = tokens.colors.light.gold,
  accentColor = tokens.colors.light.navy,
}: LogoMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* open book */}
      <Path
        d="M8 40c6-4 13-4 24 0 11-4 18-4 24 0v10c-6-4-13-4-24 0-11-4-18-4-24 0V40Z"
        fill={bookColor}
      />
      <Path d="M32 40v10" stroke={accentColor} strokeWidth={1.5} opacity={0.4} />
      {/* mortarboard */}
      <Path d="M32 14 4 26l28 12 28-12-28-12Z" fill={capColor} />
      <Path
        d="M18 30v9c0 4 7 8 14 8s14-4 14-8v-9"
        stroke={capColor}
        strokeWidth={2.5}
        fill="none"
      />
      <Circle cx="58" cy="27" r="2.4" fill={accentColor} />
      <Path d="M58 27v11" stroke={accentColor} strokeWidth={2} />
    </Svg>
  );
}

interface WordmarkProps {
  size?: number;
  edColor?: string;
  marColor?: string;
  subtitleColor?: string;
  align?: "left" | "center";
}

/** "EdMar" wordmark + "CXC MATHS" subtitle, matching the two-tone treatment
 * in the reference screens (navy "Ed", gold "Mar"). */
export function Wordmark({
  size = 28,
  edColor = tokens.colors.light.navy,
  marColor = tokens.colors.light.gold,
  subtitleColor = tokens.colors.light.textSecondary,
  align = "left",
}: WordmarkProps) {
  return (
    <View style={{ alignItems: align === "center" ? "center" : "flex-start" }}>
      <Text style={{ fontSize: size, fontWeight: "800", letterSpacing: 0.2 }}>
        <Text style={{ color: edColor }}>Ed</Text>
        <Text style={{ color: marColor }}>Mar</Text>
      </Text>
      <Text
        style={{
          fontSize: size * 0.36,
          fontWeight: "700",
          letterSpacing: 2,
          color: subtitleColor,
          marginTop: -2,
        }}
      >
        CXC MATHS
      </Text>
    </View>
  );
}
