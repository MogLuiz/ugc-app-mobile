import { createTheme } from '@shopify/restyle'

const palette = {
  // Brand
  purple500: '#895af6',
  purple600: '#7c4aed',
  purple700: '#6d28d9',
  purpleSurface: '#f3edff',
  purpleSurfaceAlt: '#e4d7ff',

  // Neutral
  slate900: '#0f172a',
  gray800: '#1f2937',
  gray700: '#374151',
  gray600: '#4b5563',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
  gray200: '#e5e7eb',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
  white: '#ffffff',

  // Semantic
  red500: '#ef4444',
  red400: '#f87171',
  redSurface: '#fef2f2',
  redBorder: '#fecaca',
  green500: '#10b981',
  amber500: '#f59e0b',

  transparent: 'transparent',
} as const

const theme = createTheme({
  colors: {
    // Brand
    primary: palette.purple500,
    primaryPressed: palette.purple600,
    primarySurface: palette.purpleSurface,
    primarySurfaceAlt: palette.purpleSurfaceAlt,

    // Backgrounds
    background: palette.gray50,
    backgroundAlt: palette.gray100,
    surface: palette.white,
    surfaceAlt: palette.slate100,

    // Text
    text: palette.gray800,
    textStrong: palette.slate900,
    textSecondary: palette.gray600,
    textTertiary: palette.gray500,
    textMuted: palette.gray400,
    textInverse: palette.white,

    // Borders
    border: palette.gray200,
    borderSubtle: palette.slate200,

    // States
    error: palette.red500,
    errorSubtle: palette.red400,
    errorSurface: palette.redSurface,
    errorBorder: palette.redBorder,
    success: palette.green500,
    warning: palette.amber500,

    // UI
    inputBackground: palette.white,
    disabledBg: palette.slate100,
    disabledText: palette.gray400,
    focus: palette.purple500,
    tabBarBackground: palette.white,

    transparent: palette.transparent,
  },

  spacing: {
    s1: 4,
    s2: 8,
    s3: 12,
    s4: 16,
    s5: 20,
    s6: 24,
    s8: 32,
    s12: 48,
    s16: 64,
    s20: 80,
  },

  borderRadii: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    card: 20,
    full: 9999,
  },

  textVariants: {
    defaults: {
      fontFamily: 'System',
      color: 'text',
    },
    h1: {
      fontSize: 32,
      fontWeight: '900' as const,
      color: 'textStrong',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 26,
      fontWeight: '900' as const,
      color: 'textStrong',
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: 'textStrong',
    },
    h4: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: 'text',
    },
    body: {
      fontSize: 16,
      color: 'text',
      lineHeight: 24,
    },
    bodySm: {
      fontSize: 14,
      color: 'text',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      color: 'textSecondary',
      lineHeight: 16,
    },
    label: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: 'textMuted',
      letterSpacing: 0.8,
    },
  },

  // React Native shadow format
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    primary: {
      shadowColor: '#895af6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
    cardBrand: {
      shadowColor: '#895af6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 4,
    },
    cardNeutral: {
      shadowColor: '#1f2937',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
})

export type Theme = typeof theme
export default theme
