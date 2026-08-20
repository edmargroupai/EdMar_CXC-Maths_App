import { useColorScheme } from "@/components/useColorScheme";
import { colorsFor, type ColorPalette } from "@edmar/design";

/** The only place a screen should read theme colours from (§20.2 — no hard-coded values). */
export function useThemeColors(): ColorPalette {
  const scheme = useColorScheme();
  return colorsFor(scheme === "dark" ? "dark" : "light");
}
