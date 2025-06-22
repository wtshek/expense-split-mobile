import { getCurrentUserId, testConnection } from "@/lib/supabase";
import {
  Category,
  ExpenseStats,
  ExpenseWithDetails,
  GroupWithMembers,
  Profile,
} from "@/types/database";
import { getCurrentUser } from "./auth";
import {
  areCategoriesInitialized,
  initializeDefaultCategories,
} from "./categories";
import { getExpenseStats, getRecentExpenses } from "./expenses";
import { fetchGroups } from "./groups";
import {
  createProfile,
  currentUserHasProfile,
  getCurrentUserProfile,
} from "./profiles";

// Database initialization result
export interface DatabaseInitResult {
  success: boolean;
  profile?: Profile | null;
  categories?: Category[];
  error?: Error;
}

// Initialize the database for the current user
export const initializeDatabase = async (): Promise<DatabaseInitResult> => {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      return {
        success: false,
        error: new Error(
          "Failed to connect to Supabase. Please check your configuration."
        ),
      };
    }

    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: new Error("No authenticated user found. Please sign in first."),
      };
    }

    // Check if user has a profile, create one if not
    let profile: Profile | null = null;
    const hasProfile = await currentUserHasProfile();

    if (!hasProfile) {
      // Create a default profile for the user
      const createResult = await createProfile({
        id: currentUser.id,
        name: currentUser.email?.split("@")[0] || "User", // Use email prefix as default name
      });

      if (createResult.error) {
        return {
          success: false,
          error: createResult.error,
        };
      }

      profile = createResult.data;
    } else {
      const profileResult = await getCurrentUserProfile();
      if (profileResult.error) {
        return {
          success: false,
          error: profileResult.error,
        };
      }
      profile = profileResult.data;
    }

    // Initialize categories
    const categoriesResult = await initializeDefaultCategories();
    if (categoriesResult.error) {
      return {
        success: false,
        error: categoriesResult.error,
      };
    }

    return {
      success: true,
      profile,
      categories: categoriesResult.data || [],
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown initialization error"),
    };
  }
};

// Dashboard data interface
export interface DashboardData {
  profile: Profile | null;
  recentExpenses: ExpenseWithDetails[];
  stats: ExpenseStats | null;
  groups: GroupWithMembers[];
  categories: Category[];
  error?: Error;
}

// Get comprehensive dashboard data for the current user
export const getDashboardData = async (
  days: number = 30
): Promise<DashboardData> => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        profile: null,
        recentExpenses: [],
        stats: null,
        groups: [],
        categories: [],
        error: new Error("No authenticated user found"),
      };
    }

    // Get all required data in parallel
    const [
      profileResult,
      recentExpensesResult,
      statsResult,
      groupsResult,
      categoriesResult,
    ] = await Promise.all([
      getCurrentUserProfile(),
      getRecentExpenses(days, 10), // Get last 10 recent expenses
      getExpenseStats(currentUserId), // Get overall stats for user
      fetchGroups(currentUserId),
      initializeDefaultCategories(), // This will return existing categories if already initialized
    ]);

    return {
      profile: profileResult.data,
      recentExpenses: recentExpensesResult.data || [],
      stats: statsResult.data,
      groups: groupsResult.data || [],
      categories: categoriesResult.data || [],
      error:
        profileResult.error ||
        recentExpensesResult.error ||
        statsResult.error ||
        groupsResult.error ||
        categoriesResult.error ||
        undefined,
    };
  } catch (error) {
    return {
      profile: null,
      recentExpenses: [],
      stats: null,
      groups: [],
      categories: [],
      error:
        error instanceof Error
          ? error
          : new Error("Failed to load dashboard data"),
    };
  }
};

// Check if the current user's database is properly initialized
export const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    const [hasProfile, hasCategories] = await Promise.all([
      currentUserHasProfile(),
      areCategoriesInitialized(),
    ]);

    return hasProfile && hasCategories;
  } catch (error) {
    console.error("Error checking database initialization:", error);
    return false;
  }
};

// Get user setup status
export interface UserSetupStatus {
  isAuthenticated: boolean;
  hasProfile: boolean;
  hasCategories: boolean;
  isFullySetup: boolean;
}

export const getUserSetupStatus = async (): Promise<UserSetupStatus> => {
  try {
    const currentUser = await getCurrentUser();
    const isAuthenticated = !!currentUser;

    if (!isAuthenticated) {
      return {
        isAuthenticated: false,
        hasProfile: false,
        hasCategories: false,
        isFullySetup: false,
      };
    }

    const [hasProfile, hasCategories] = await Promise.all([
      currentUserHasProfile(),
      areCategoriesInitialized(),
    ]);

    return {
      isAuthenticated,
      hasProfile,
      hasCategories,
      isFullySetup: hasProfile && hasCategories,
    };
  } catch (error) {
    console.error("Error getting user setup status:", error);
    return {
      isAuthenticated: false,
      hasProfile: false,
      hasCategories: false,
      isFullySetup: false,
    };
  }
};

// Re-export all utility functions from individual modules for convenience
export * from "./auth";
export * from "./categories";
export * from "./expenses";
export * from "./groups";
export * from "./profiles";
