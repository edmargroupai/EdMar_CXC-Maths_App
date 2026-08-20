// packages/design/src/tokens.ts
//
// Colour, type, space and radii tokens (Technical Build Spec §33 file map).
//
// Palette below is transcribed (by eye, not a colour-picker) from the
// onboarding/login mockups supplied 2026-08-19 — navy + gold. Treat the hex
// values as close approximations pending real brand guideline files, not
// exact swatches. Note this differs from EdMar's existing print-publisher
// mark (E2P | EdMar Education Publishers — dark green + gold); nothing here
// reconciles the two, that's a founder decision, not an engineering one.
// Swapping the palette later is a change to this file only — nothing
// downstream should hard-code a colour value (B-17: 4.5:1 text contrast;
// B-8/D.3 dark mode).

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

/** B-17: minimum touch target, points. */
export const minTouchTarget = 44;

export const fontFamily = {
  // System stack — no custom font is bundled until brand type is confirmed.
  sans: "System",
  mono: "Menlo, Consolas, monospace",
} as const;

/** Type scale: size (pt), line height (pt), weight. */
export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: "700" },
  h1: { fontSize: 22, lineHeight: 28, fontWeight: "700" },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
  h3: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  body: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  bodySm: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
  button: { fontSize: 16, lineHeight: 20, fontWeight: "600" },
  math: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
} as const;

/**
 * Primitive colour scale. Neutral gray + a single placeholder brand hue.
 * All pairs below meet WCAG AA (4.5:1) for body text against their paired
 * surface — verified by hand; re-verify if a value changes.
 */
const primitives = {
  white: "#FFFFFF",
  black: "#000000",
  gray50: "#F8F9FA",
  gray100: "#F1F3F5",
  gray200: "#E9ECEF",
  gray300: "#DEE2E6",
  gray400: "#CED4DA",
  gray500: "#ADB5BD",
  gray600: "#6C757D",
  gray700: "#495057",
  gray800: "#343A40",
  gray900: "#212529",
  // Navy — the onboarding hero surface and wordmark colour.
  navy50: "#EAF0FB",
  navy100: "#C7D5F0",
  navy300: "#5C7BC4",
  navy500: "#1B3A82",
  navy600: "#132C6B",
  navy700: "#0D2158",
  navy900: "#081638",
  // Interactive blue — buttons/links on light surfaces (distinct from navy,
  // matches the login screen's "Sign In" button).
  brand50: "#EAF0FE",
  brand100: "#CBDAFC",
  brand300: "#5C86E8",
  brand500: "#2554C7",
  brand600: "#1E44A8",
  brand700: "#173583",
  // Gold — the CTA / accent colour ("Master Maths.", "Get Started").
  gold300: "#FFDE85",
  gold500: "#FFC72C",
  gold600: "#E6AC00",
  gold700: "#B38300",
  success500: "#2F9E44",
  success700: "#1B7A2E",
  error500: "#E03131",
  error700: "#B01E1E",
  warning500: "#F08C00",
  warning700: "#B36200",
} as const;

export const colorsLight = {
  background: "#F4F8FD",
  surface: primitives.white,
  surfaceRaised: primitives.white,
  border: primitives.gray300,
  textPrimary: primitives.navy900,
  textSecondary: primitives.gray700,
  textOnBrand: primitives.white,
  textDisabled: primitives.gray500,
  brand: primitives.brand500,
  brandPressed: primitives.brand600,
  brandSubtle: primitives.brand50,
  navy: primitives.navy600,
  navyDeep: primitives.navy900,
  navySubtle: primitives.navy50,
  gold: primitives.gold500,
  goldPressed: primitives.gold600,
  textOnGold: primitives.navy900,
  success: primitives.success700,
  successSubtle: "#EBFBEE",
  error: primitives.error700,
  errorSubtle: "#FFF5F5",
  warning: primitives.warning700,
  warningSubtle: "#FFF9DB",
  overlay: "rgba(8, 22, 56, 0.55)",
} as const;

export const colorsDark = {
  background: primitives.gray900,
  surface: primitives.gray800,
  surfaceRaised: "#2B3035",
  border: primitives.gray700,
  textPrimary: primitives.gray100,
  textSecondary: primitives.gray400,
  textOnBrand: primitives.white,
  textDisabled: primitives.gray600,
  brand: primitives.brand300,
  brandPressed: primitives.brand100,
  brandSubtle: "#132347",
  navy: primitives.navy300,
  navyDeep: primitives.navy900,
  navySubtle: "#0F1E43",
  gold: primitives.gold300,
  goldPressed: primitives.gold500,
  textOnGold: primitives.navy900,
  success: "#69DB7C",
  successSubtle: "#0F3D1A",
  error: "#FF8787",
  errorSubtle: "#4A1414",
  warning: "#FFD43B",
  warningSubtle: "#4A3300",
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

export type ThemeName = "light" | "dark";
export type ColorToken = keyof typeof colorsLight;
export type ColorPalette = Record<ColorToken, string>;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
export type TypographyToken = keyof typeof typography;

export const tokens = {
  spacing,
  radii,
  minTouchTarget,
  fontFamily,
  typography,
  colors: { light: colorsLight, dark: colorsDark },
} as const;

export function colorsFor(theme: ThemeName): ColorPalette {
  return theme === "dark" ? colorsDark : colorsLight;
}
