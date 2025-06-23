import { AppStyles } from "@/constants/AppStyles";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console or error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error?.message ||
                "An unexpected error occurred. Please try again."}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    padding: AppStyles.spacing.lg,
  },
  errorContainer: {
    backgroundColor: AppStyles.colors.background,
    borderRadius: AppStyles.borderRadius.md,
    padding: AppStyles.spacing.xl,
    alignItems: "center",
    maxWidth: 320,
    ...AppStyles.shadows.md,
  },
  title: {
    ...AppStyles.typography.h2,
    color: AppStyles.colors.text.primary,
    textAlign: "center",
    marginBottom: AppStyles.spacing.md,
  },
  message: {
    ...AppStyles.typography.body,
    color: AppStyles.colors.text.secondary,
    textAlign: "center",
    marginBottom: AppStyles.spacing.lg,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: AppStyles.colors.text.primary,
    borderRadius: AppStyles.borderRadius.sm,
    paddingVertical: AppStyles.spacing.md,
    paddingHorizontal: AppStyles.spacing.xl,
    minWidth: 120,
  },
  retryButtonText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.inverse,
    textAlign: "center",
  },
});

export default ErrorBoundary;
