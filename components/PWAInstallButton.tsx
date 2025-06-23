import { AppStyles } from "@/constants/AppStyles";
import { usePWA } from "@/hooks/usePWA";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface PWAInstallButtonProps {
  style?: any;
  showText?: boolean;
  size?: "small" | "medium" | "large";
}

export default function PWAInstallButton({
  style,
  showText = true,
  size = "medium",
}: PWAInstallButtonProps) {
  const { canInstall, isStandalone, showInstallPrompt } = usePWA();

  // Don't show on native platforms or if already installed
  if (Platform.OS !== "web" || isStandalone || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const success = await showInstallPrompt();
    if (success) {
      console.log("App installation initiated");
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          iconSize: 18,
        };
      case "large":
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          iconSize: 28,
        };
      default:
        return {
          paddingHorizontal: 20,
          paddingVertical: 12,
          iconSize: 24,
        };
    }
  };

  const buttonSize = getButtonSize();

  return (
    <TouchableOpacity
      onPress={handleInstall}
      style={[
        {
          backgroundColor: AppStyles.colors.primary,
          borderRadius: AppStyles.borderRadius.sm,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: buttonSize.paddingHorizontal,
          paddingVertical: buttonSize.paddingVertical,
          ...AppStyles.shadows.sm,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <Ionicons
        name="download-outline"
        size={buttonSize.iconSize}
        color={AppStyles.colors.text.inverse}
      />
      {showText && (
        <Text
          style={[
            AppStyles.typography.bodyMedium,
            {
              color: AppStyles.colors.text.inverse,
              marginLeft: AppStyles.spacing.sm,
            },
          ]}
        >
          Install App
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Optional: PWA Status Indicator Component
export function PWAStatusIndicator() {
  const { isOnline, isStandalone } = usePWA();

  if (Platform.OS !== "web") return null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: AppStyles.spacing.md,
        paddingVertical: AppStyles.spacing.xs,
        backgroundColor: AppStyles.colors.surface,
        borderRadius: AppStyles.borderRadius.sm,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isOnline
            ? AppStyles.colors.success
            : AppStyles.colors.error,
          marginRight: AppStyles.spacing.xs,
        }}
      />
      <Text
        style={[
          AppStyles.typography.small,
          { color: AppStyles.colors.text.tertiary },
        ]}
      >
        {isOnline ? "Online" : "Offline"}
        {isStandalone && " • Installed"}
      </Text>
    </View>
  );
}
