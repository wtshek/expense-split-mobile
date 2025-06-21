// Modern Fintech App Design System
export const AppStyles = {
  // Colors
  colors: {
    primary: "#000000",
    secondary: "#374151",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    cardBackground: "#FFFFFF",
    darkCard: "#1F2937",
    text: {
      primary: "#111827",
      secondary: "#374151",
      tertiary: "#6B7280",
      inverse: "#FFFFFF",
    },
    border: "#E5E7EB",
    accent: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },

  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: "700" as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: "600" as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: "600" as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: "500" as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: "400" as const,
      lineHeight: 20,
    },
    captionMedium: {
      fontSize: 14,
      fontWeight: "500" as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: "400" as const,
      lineHeight: 16,
    },
    smallMedium: {
      fontSize: 12,
      fontWeight: "500" as const,
      lineHeight: 16,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Common Styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  darkCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  inputField: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#111827",
  },

  button: {
    primary: {
      backgroundColor: "#111827",
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    secondary: {
      backgroundColor: "transparent",
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
  },
};
