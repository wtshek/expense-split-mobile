import { handleSupabaseError, supabase } from "@/lib/supabase";
import {
  AuthEvent,
  AuthResponse,
  AuthStateChangeCallback,
  DatabaseResponse,
  Session,
  User,
} from "@/types/database";

// Sign up a new user with email and password
export const signUp = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: handleSupabaseError(error) };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: handleSupabaseError(error),
    };
  }
};

// Sign in an existing user with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: handleSupabaseError(error) };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: handleSupabaseError(error),
    };
  }
};

// Sign out the current user
export const signOut = async (): Promise<DatabaseResponse<boolean>> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Delete the current user's account
// WARNING: This is a sensitive operation - use with caution
export const deleteUser = async (): Promise<DatabaseResponse<boolean>> => {
  try {
    // First, get the current user
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError || !user) {
      return {
        data: null,
        error: new Error("No authenticated user found or failed to get user"),
      };
    }

    // Delete the user account
    // Note: This will trigger CASCADE DELETE for associated profile data
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Get the current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Listen for authentication state changes
export const onAuthStateChange = (callback: AuthStateChangeCallback) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event as AuthEvent, session);
  });

  return subscription;
};

// Unsubscribe from auth state changes
export const unsubscribeAuthStateChange = (subscription: any) => {
  if (subscription) {
    subscription.unsubscribe();
  }
};

// Reset password (send reset email)
export const resetPassword = async (
  email: string
): Promise<DatabaseResponse<boolean>> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Update user password (requires current session)
export const updatePassword = async (
  newPassword: string
): Promise<DatabaseResponse<boolean>> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Update user email (requires current session)
export const updateEmail = async (
  newEmail: string
): Promise<DatabaseResponse<boolean>> => {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting current session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
};

// Refresh the current session
export const refreshSession = async (): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      return { user: null, session: null, error: handleSupabaseError(error) };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: handleSupabaseError(error),
    };
  }
};
