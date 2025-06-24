import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { AppStyles } from "@/constants/AppStyles";
import { pwaService } from "@/utils/pwa";
export default function TabLayout() {
  // Calculate padding for PWA standalone mode
  const getPWATabBarStyle = () => {
    const isStandalone = Platform.OS === "web" && pwaService.isStandalone();
    const isIOS = Platform.OS === "ios";
    
    let paddingBottom = 8;
    let height = 64;
    
    if (isIOS) {
      paddingBottom = 24;
      height = 88;
    } else if (isStandalone && Platform.OS === "web") {
      // Add extra padding for PWA standalone mode on web
      paddingBottom = 16;
      height = 72;
    }
    
    return {
      backgroundColor: AppStyles.colors.background,
      borderTopWidth: 1,
      borderTopColor: AppStyles.colors.border,
      paddingTop: 8,
      paddingBottom,
      height,
      ...AppStyles.shadows.sm,
    };
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppStyles.colors.primary,
        tabBarInactiveTintColor: AppStyles.colors.text.secondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: getPWATabBarStyle(),
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
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={24}
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
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={24}
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
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
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
