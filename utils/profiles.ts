import {
  getCurrentUserId,
  handleSupabaseError,
  supabase,
} from "@/lib/supabase";
import {
  DatabaseListResponse,
  DatabaseResponse,
  Profile,
  ProfileUpdate,
} from "@/types/database";

// Fetch a single profile by its ID
export const fetchProfile = async (
  userId: string
): Promise<DatabaseResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Update a user's own profile (name field primarily)
export const updateProfile = async (
  userId: string,
  updates: ProfileUpdate
): Promise<DatabaseResponse<Profile>> => {
  try {
    // Verify that the user is updating their own profile
    const currentUserId = await getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: new Error("Unauthorized: Can only update your own profile"),
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Fetch all profiles (useful for selecting participants for groups/expenses)
export const fetchProfiles = async (): Promise<
  DatabaseListResponse<Profile>
> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Get current user's profile
export const getCurrentUserProfile = async (): Promise<
  DatabaseResponse<Profile>
> => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    return fetchProfile(currentUserId);
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Update current user's profile
export const updateCurrentUserProfile = async (
  updates: ProfileUpdate
): Promise<DatabaseResponse<Profile>> => {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No authenticated user found"),
      };
    }

    return updateProfile(currentUserId, updates);
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Delete a profile (typically handled automatically via CASCADE when user is deleted)
export const deleteProfile = async (
  userId: string
): Promise<DatabaseResponse<boolean>> => {
  try {
    // Verify that the user is deleting their own profile
    const currentUserId = await getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: new Error("Unauthorized: Can only delete your own profile"),
      };
    }

    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Search profiles by name (useful for adding members to groups)
export const searchProfiles = async (
  searchTerm: string
): Promise<DatabaseListResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .order("name", { ascending: true })
      .limit(10);

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Check if a profile exists for the current user
export const currentUserHasProfile = async (): Promise<boolean> => {
  try {
    const result = await getCurrentUserProfile();
    return !!result.data && !result.error;
  } catch (error) {
    console.error("Error checking if current user has profile:", error);
    return false;
  }
};
