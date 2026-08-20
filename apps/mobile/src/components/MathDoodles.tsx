import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface MathDoodlesProps {
  color: string;
  opacity?: number;
}

/** Faint scattered maths notation, echoing the reference screens' chalkboard
 * texture (a²+b²=c², √x, sin θ = opp/hyp, a parabola). Decorative only. */
export function MathDoodles({ color, opacity = 0.16 }: MathDoodlesProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Text style={[styles.formula, { color, opacity, top: "6%", left: "8%", fontSize: 22 }]}>
        a² + b² = c²
      </Text>
      <Text style={[styles.formula, { color, opacity, top: "14%", right: "10%", fontSize: 26 }]}>
        √x
      </Text>
      <Text style={[styles.formula, { color, opacity, top: "34%", right: "6%", fontSize: 15 }]}>
        sin θ = opp/hyp
      </Text>
      <Text style={[styles.formula, { color, opacity, bottom: "22%", left: "6%", fontSize: 18 }]}>
        2x + 5 = 13
      </Text>
      <Svg
        style={[StyleSheet.absoluteFill, { opacity }]}
        viewBox="0 0 200 300"
        preserveAspectRatio="none"
      >
        {/* a simple parabola arc */}
        <Path d="M20 60 Q80 -10 140 60" stroke={color} strokeWidth={1.5} fill="none" />
        {/* a right triangle */}
        <Path d="M40 220 L40 260 L110 260 Z" stroke={color} strokeWidth={1.5} fill="none" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  formula: {
    position: "absolute",
    fontWeight: "600",
  },
});
