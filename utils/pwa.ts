import { Platform } from "react-native";

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

class PWAService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstallable = false;
  private installPromptCallbacks: Array<(canInstall: boolean) => void> = [];

  constructor() {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      this.initializePWA();
    }
  }

  private initializePWA() {
    // Register service worker
    this.registerServiceWorker();

    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("PWA: Install prompt available");
      e.preventDefault();
      this.deferredPrompt = e as any;
      this.isInstallable = true;
      this.notifyInstallPromptListeners(true);
    });

    // Listen for appinstalled event
    window.addEventListener("appinstalled", () => {
      console.log("PWA: App installed successfully");
      this.deferredPrompt = null;
      this.isInstallable = false;
      this.notifyInstallPromptListeners(false);
    });

    // Add iOS standalone mode detection
    if (this.isIOSStandalone()) {
      document.body.classList.add("ios-standalone");
    }

    // Add viewport meta tag for better mobile experience
    this.addPWAMetaTags();
  }

  private async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log(
          "PWA: Service Worker registered successfully:",
          registration
        );

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("PWA: New service worker available");
                this.showUpdateAvailableNotification();
              }
            });
          }
        });

        // Handle controller change (new service worker activated)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("PWA: New service worker activated");
          window.location.reload();
        });
      } catch (error) {
        console.error("PWA: Service Worker registration failed:", error);
      }
    }
  }

  private addPWAMetaTags() {
    const head = document.head;

    // Viewport meta tag
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement("meta");
      viewport.name = "viewport";
      viewport.content =
        "width=device-width, initial-scale=1.0, viewport-fit=cover";
      head.appendChild(viewport);
    }

    // Theme color
    const themeColor = document.createElement("meta");
    themeColor.name = "theme-color";
    themeColor.content = "#000000";
    head.appendChild(themeColor);

    // Apple specific meta tags
    const appleMobileCapable = document.createElement("meta");
    appleMobileCapable.name = "apple-mobile-web-app-capable";
    appleMobileCapable.content = "yes";
    head.appendChild(appleMobileCapable);

    const appleStatusBar = document.createElement("meta");
    appleStatusBar.name = "apple-mobile-web-app-status-bar-style";
    appleStatusBar.content = "default";
    head.appendChild(appleStatusBar);

    const appleTitle = document.createElement("meta");
    appleTitle.name = "apple-mobile-web-app-title";
    appleTitle.content = "Expense Split";
    head.appendChild(appleTitle);

    // Microsoft specific
    const msAppTitle = document.createElement("meta");
    msAppTitle.name = "application-name";
    msAppTitle.content = "Expense Split";
    head.appendChild(msAppTitle);

    const msTileColor = document.createElement("meta");
    msTileColor.name = "msapplication-TileColor";
    msTileColor.content = "#000000";
    head.appendChild(msTileColor);
  }

  private isIOSStandalone(): boolean {
    return (
      "standalone" in window.navigator &&
      (window.navigator as any).standalone === true
    );
  }

  private showUpdateAvailableNotification() {
    // You can integrate this with your notification system
    console.log("PWA: Update available - consider showing user notification");
  }

  private notifyInstallPromptListeners(canInstall: boolean) {
    this.installPromptCallbacks.forEach((callback) => callback(canInstall));
  }

  // Public methods
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log("PWA: Install prompt not available");
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("PWA: User accepted install prompt");
        this.deferredPrompt = null;
        this.isInstallable = false;
        this.notifyInstallPromptListeners(false);
        return true;
      } else {
        console.log("PWA: User dismissed install prompt");
        return false;
      }
    } catch (error) {
      console.error("PWA: Error showing install prompt:", error);
      return false;
    }
  }

  public canInstall(): boolean {
    return this.isInstallable;
  }

  public isStandalone(): boolean {
    if (Platform.OS !== "web") return false;

    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      this.isIOSStandalone()
    );
  }

  public onInstallPromptChange(callback: (canInstall: boolean) => void) {
    this.installPromptCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.installPromptCallbacks.indexOf(callback);
      if (index > -1) {
        this.installPromptCallbacks.splice(index, 1);
      }
    };
  }

  public async skipWaitingServiceWorker() {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    }
  }
}

// Export singleton instance
export const pwaService = new PWAService();
