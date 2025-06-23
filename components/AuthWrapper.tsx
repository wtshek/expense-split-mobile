import { AppStyles } from "@/constants/AppStyles";
import { User } from "@/types/database";
import {
  getCurrentSession,
  getCurrentUser,
  onAuthStateChange,
  signIn,
  signOut,
  signUp,
} from "@/utils/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // First, check if there's an existing session
        const session = await getCurrentSession();
        if (session?.user && isMounted) {
          console.log("Found existing session for user:", session.user.id);
          setUser(session.user as User);
        } else {
          // Try to get current user (this might still work without session)
          const user = await getCurrentUser();
          if (user && isMounted) {
            console.log("Found current user:", user.id);
            setUser(user);
          }
        }
      } catch (error) {
        console.warn("Auth initialization failed:", error);
        // Don't set error state here, just continue with no user
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const subscription = onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (!isMounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user as User);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleAuth = async () => {
    if (authLoading) return;

    clearMessages();

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    if (isSignUp && !formData.name.trim()) {
      setErrorMessage("Please enter your name");
      return;
    }

    setAuthLoading(true);

    try {
      let result;

      if (isSignUp) {
        result = await signUp(formData.email, formData.password, {
          name: formData.name,
        });
        if (result.error) {
          setErrorMessage(result.error.message);
        } else {
          setSuccessMessage(
            "Account created successfully! Please check your email to verify your account."
          );
          setFormData({ email: "", password: "", name: "" });
          // Switch to sign in mode after successful signup
          setTimeout(() => {
            setIsSignUp(false);
            setSuccessMessage("");
          }, 3000);
        }
      } else {
        result = await signIn(formData.email, formData.password);
        if (result.error) {
          setErrorMessage(result.error.message);
        } else {
          setFormData({ email: "", password: "", name: "" });
          // User will be automatically redirected to homepage via auth state change
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.error) {
      setErrorMessage("Failed to sign out: " + result.error.message);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: "", password: "", name: "" });
    clearMessages();
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppStyles.colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.authContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Expense Splitter</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? "Create your account" : "Welcome back"}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.messageContainer}>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Success Message */}
            {successMessage ? (
              <View style={styles.messageContainer}>
                <Text style={styles.successMessage}>{successMessage}</Text>
              </View>
            ) : null}

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, name: text }))
                  }
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.authButton,
                authLoading && styles.authButtonDisabled,
              ]}
              onPress={handleAuth}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color={AppStyles.colors.text.inverse} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isSignUp ? "Sign Up" : "Sign In"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleAuthMode}
            >
              <Text style={styles.toggleButtonText}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Show main app if authenticated
  return (
    <View style={styles.container}>
      <View style={styles.userHeader}>
        <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppStyles.colors.background,
  },
  loadingText: {
    ...AppStyles.typography.body,
    color: AppStyles.colors.text.secondary,
    marginTop: AppStyles.spacing.md,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    padding: AppStyles.spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: AppStyles.spacing.xxl,
  },
  title: {
    ...AppStyles.typography.h1,
    color: AppStyles.colors.text.primary,
    marginBottom: AppStyles.spacing.sm,
  },
  subtitle: {
    ...AppStyles.typography.body,
    color: AppStyles.colors.text.secondary,
    textAlign: "center",
  },
  form: {
    gap: AppStyles.spacing.lg,
  },
  messageContainer: {
    padding: AppStyles.spacing.md,
    borderRadius: AppStyles.borderRadius.sm,
    marginBottom: AppStyles.spacing.sm,
  },
  errorMessage: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.error,
    textAlign: "center",
  },
  successMessage: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.success,
    textAlign: "center",
  },
  inputGroup: {
    gap: AppStyles.spacing.sm,
  },
  label: {
    ...AppStyles.typography.captionMedium,
    color: AppStyles.colors.text.primary,
  },
  textInput: {
    ...AppStyles.inputField,
    ...AppStyles.typography.body,
  },
  authButton: {
    backgroundColor: AppStyles.colors.text.primary,
    borderRadius: AppStyles.borderRadius.sm,
    paddingVertical: AppStyles.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: AppStyles.spacing.md,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.inverse,
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: AppStyles.spacing.md,
  },
  toggleButtonText: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.accent,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: AppStyles.spacing.md,
    paddingVertical: AppStyles.spacing.sm,
    backgroundColor: AppStyles.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AppStyles.colors.border,
  },
  welcomeText: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.secondary,
  },
  signOutButton: {
    paddingHorizontal: AppStyles.spacing.sm,
    paddingVertical: AppStyles.spacing.xs,
  },
  signOutText: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.accent,
  },
});

export default AuthWrapper;
