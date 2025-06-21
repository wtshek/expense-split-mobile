import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { AppStyles } from "@/constants/AppStyles";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppStyles.colors.primary,
        tabBarInactiveTintColor: AppStyles.colors.text.secondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: AppStyles.colors.background,
          borderTopWidth: 1,
          borderTopColor: AppStyles.colors.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          height: Platform.OS === "ios" ? 88 : 64,
          ...AppStyles.shadows.sm,
        },
        tabBarLabelStyle: {
          ...AppStyles.typography.small,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Input",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="plus.circle.fill"
              color={
                focused
                  ? AppStyles.colors.primary
                  : AppStyles.colors.text.secondary
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="chart.bar.fill"
              color={
                focused
                  ? AppStyles.colors.primary
                  : AppStyles.colors.text.secondary
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="split"
        options={{
          title: "Split",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="person.2.fill"
              color={
                focused
                  ? AppStyles.colors.primary
                  : AppStyles.colors.text.secondary
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}
