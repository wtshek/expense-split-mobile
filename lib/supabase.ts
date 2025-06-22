import { createClient } from "@supabase/supabase-js";

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set."
  );
}

// Create Supabase client with authentication enabled
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Enable session persistence since we now have authentication
    persistSession: true,
    // Auto refresh tokens
    autoRefreshToken: true,
    // Detect session in URL (useful for email confirmations)
    detectSessionInUrl: true,
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): Error => {
  console.error("Supabase Error:", error);

  if (error?.message) {
    return new Error(error.message);
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  return new Error("An unexpected database error occurred");
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

// Helper function to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
};

// Helper function to test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Connection test failed:", error);
      return false;
    }

    console.log("Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Connection test error:", error);
    return false;
  }
};
