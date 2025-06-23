import { pwaService } from "@/utils/pwa";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export interface PWAState {
  canInstall: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
}

export interface PWAActions {
  showInstallPrompt: () => Promise<boolean>;
  skipWaitingUpdate: () => Promise<void>;
}

export function usePWA(): PWAState & PWAActions {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    // Initialize PWA state
    setCanInstall(pwaService.canInstall());
    setIsStandalone(pwaService.isStandalone());
    setIsOnline(navigator.onLine);

    // Listen for install prompt changes
    const unsubscribeInstall = pwaService.onInstallPromptChange(setCanInstall);

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for service worker updates
    const handleServiceWorkerUpdate = () => {
      setIsUpdateAvailable(true);
    };

    // Check for service worker updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "UPDATE_AVAILABLE") {
          handleServiceWorkerUpdate();
        }
      });
    }

    // Cleanup
    return () => {
      unsubscribeInstall();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const showInstallPrompt = async (): Promise<boolean> => {
    const result = await pwaService.showInstallPrompt();
    if (result) {
      setCanInstall(false);
    }
    return result;
  };

  const skipWaitingUpdate = async (): Promise<void> => {
    await pwaService.skipWaitingServiceWorker();
    setIsUpdateAvailable(false);
  };

  return {
    canInstall,
    isStandalone,
    isOnline,
    isUpdateAvailable,
    showInstallPrompt,
    skipWaitingUpdate,
  };
}
