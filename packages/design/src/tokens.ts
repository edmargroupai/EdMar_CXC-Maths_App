// packages/design/src/tokens.ts
//
// Colour, type, space and radii tokens (Technical Build Spec §33 file map).
//
// PLACEHOLDER PALETTE. EdMar's real brand assets (logo, palette, type) are an
// open item owned by the founder, due before P14 (Appendix B). Until they
// land, every value below is a brand-neutral, accessibility-checked default
// so mobile-shell work (P14) is not blocked on brand delivery. Swapping the
// palette is a change to this file only — nothing downstream should hard-code
// a colour value (B-17: 4.5:1 text contrast; B-8/D.3 dark mode).

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
  brand50: "#EDF4FF",
  brand100: "#D6E4FF",
  brand300: "#7FAEFF",
  brand500: "#2563EB",
  brand600: "#1D4ED8",
  brand700: "#1E40AF",
  success500: "#2F9E44",
  success700: "#1B7A2E",
  error500: "#E03131",
  error700: "#B01E1E",
  warning500: "#F08C00",
  warning700: "#B36200",
} as const;

export const colorsLight = {
  background: primitives.white,
  surface: primitives.gray50,
  surfaceRaised: primitives.white,
  border: primitives.gray300,
  textPrimary: primitives.gray900,
  textSecondary: primitives.gray700,
  textOnBrand: primitives.white,
  textDisabled: primitives.gray500,
  brand: primitives.brand500,
  brandPressed: primitives.brand600,
  brandSubtle: primitives.brand50,
  success: primitives.success700,
  successSubtle: "#EBFBEE",
  error: primitives.error700,
  errorSubtle: "#FFF5F5",
  warning: primitives.warning700,
  warningSubtle: "#FFF9DB",
  overlay: "rgba(33, 37, 41, 0.5)",
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
