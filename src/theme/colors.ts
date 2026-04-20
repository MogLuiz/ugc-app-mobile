/**
 * Legacy color object — usado diretamente nos StyleSheet.create existentes.
 * Não adicionar estrutura Restyle aqui. Ver theme.ts para tokens flat.
 */
export const colors = {
  primary: '#895af6',
  secondary: '#6366f1',
  background: {
    light: '#f9fafb',
    dark: '#0A0A0A',
  },
  surface: {
    light: '#ffffff',
    dark: '#1A1A1A',
  },
  text: {
    primary: {
      light: '#1f2937',
      dark: '#F9FAFB',
    },
    secondary: {
      light: '#4b5563',
      dark: '#9CA3AF',
    },
  },
  border: {
    light: '#e5e7eb',
    dark: '#2D2D2D',
  },
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
} as const
