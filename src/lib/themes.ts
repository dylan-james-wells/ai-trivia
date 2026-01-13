// Keyboard component theme configurations
// These map to CSS variables defined in globals.css

export type KeyboardTheme =
  | "primary"
  | "secondary"
  | "destructive"
  | "destructive-outline"
  | "success"
  | "warning"
  | "gray"
  | "gray-dark"
  | "submit"
  | "modal"
  | "answered"
  | "container";

export interface ThemeColors {
  bgColor: string;
  hoverBgColor: string;
  borderColor: string;
  shadowBgColor: string;
  textColor: string;
}

export const keyboardThemes: Record<KeyboardTheme, ThemeColors> = {
  primary: {
    bgColor: "var(--color-primary)",
    hoverBgColor: "var(--color-primary-hover)",
    borderColor: "var(--color-primary-border)",
    shadowBgColor: "var(--color-primary-shadow)",
    textColor: "var(--color-text-white)",
  },
  secondary: {
    bgColor: "var(--color-secondary-bg)",
    hoverBgColor: "var(--color-secondary-hover)",
    borderColor: "var(--color-secondary-border)",
    shadowBgColor: "var(--color-secondary-shadow)",
    textColor: "var(--color-secondary-text)",
  },
  destructive: {
    bgColor: "var(--color-destructive-dark)",
    hoverBgColor: "var(--color-destructive)",
    borderColor: "var(--color-destructive-border)",
    shadowBgColor: "var(--color-destructive-shadow-dark)",
    textColor: "var(--color-text-white)",
  },
  "destructive-outline": {
    bgColor: "var(--color-destructive-bg)",
    hoverBgColor: "var(--color-destructive-hover)",
    borderColor: "var(--color-destructive)",
    shadowBgColor: "var(--color-destructive-shadow)",
    textColor: "var(--color-destructive)",
  },
  success: {
    bgColor: "var(--color-success)",
    hoverBgColor: "var(--color-success-hover)",
    borderColor: "var(--color-success-border)",
    shadowBgColor: "var(--color-success-hover)",
    textColor: "var(--color-text-white)",
  },
  warning: {
    bgColor: "var(--color-warning)",
    hoverBgColor: "var(--color-warning-hover)",
    borderColor: "var(--color-warning-border)",
    shadowBgColor: "var(--color-warning-shadow)",
    textColor: "var(--color-text-white)",
  },
  gray: {
    bgColor: "var(--color-gray-100)",
    hoverBgColor: "var(--color-gray-200)",
    borderColor: "var(--color-gray-300)",
    shadowBgColor: "var(--color-gray-200)",
    textColor: "var(--color-gray-700)",
  },
  "gray-dark": {
    bgColor: "var(--color-gray-500)",
    hoverBgColor: "var(--color-gray-600)",
    borderColor: "var(--color-gray-700)",
    shadowBgColor: "var(--color-gray-800)",
    textColor: "var(--color-text-white)",
  },
  submit: {
    bgColor: "var(--color-submit)",
    hoverBgColor: "var(--color-submit-hover)",
    borderColor: "var(--color-submit-border)",
    shadowBgColor: "var(--color-submit-shadow)",
    textColor: "var(--color-text-white)",
  },
  modal: {
    bgColor: "var(--color-bg-modal)",
    hoverBgColor: "var(--color-bg-modal)",
    borderColor: "var(--color-primary-border)",
    shadowBgColor: "var(--color-bg-modal-shadow)",
    textColor: "var(--color-text-white)",
  },
  answered: {
    bgColor: "var(--color-answered-bg)",
    hoverBgColor: "var(--color-answered-bg)",
    borderColor: "var(--color-answered-border)",
    shadowBgColor: "var(--color-answered-border)",
    textColor: "var(--color-answered-text)",
  },
  container: {
    bgColor: "var(--color-bg-white)",
    hoverBgColor: "var(--color-bg-white)",
    borderColor: "var(--color-gray-200)",
    shadowBgColor: "var(--color-gray-100)",
    textColor: "var(--color-text-dark)",
  },
};

// Helper to get theme colors with optional overrides
export function getThemeColors(
  theme: KeyboardTheme | undefined,
  defaultTheme: KeyboardTheme,
  overrides: Partial<ThemeColors>
): ThemeColors {
  const baseTheme = keyboardThemes[theme ?? defaultTheme];
  return {
    bgColor: overrides.bgColor ?? baseTheme.bgColor,
    hoverBgColor: overrides.hoverBgColor ?? baseTheme.hoverBgColor,
    borderColor: overrides.borderColor ?? baseTheme.borderColor,
    shadowBgColor: overrides.shadowBgColor ?? baseTheme.shadowBgColor,
    textColor: overrides.textColor ?? baseTheme.textColor,
  };
}
