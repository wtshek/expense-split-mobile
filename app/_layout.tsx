import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "react-native-reanimated";

import AuthWrapper from "@/components/AuthWrapper";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useColorScheme } from "@/hooks/useColorScheme";

// Import PWA CSS for web
if (Platform.OS === "web") {
  require("../web/pwa.css");
}

// Initialize PWA service for web (client-side only)
if (Platform.OS === "web" && typeof window !== "undefined") {
  import("@/utils/pwa").then((module) => {
    // PWA service auto-initializes through singleton
    console.log("PWA service initialized");
  });
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthWrapper>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AuthWrapper>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
