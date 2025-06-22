import { AppStyles } from "@/constants/AppStyles";
import { ExpenseStats, ExpenseWithDetails } from "@/types/database";
import {
  fetchExpenses,
  getCurrentUserProfile,
  getExpenseStats,
} from "@/utils/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const StatsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [statistics, setStatistics] = useState<ExpenseStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current user profile first
      const profileResult = await getCurrentUserProfile();
      if (profileResult.error || !profileResult.data) {
        Alert.alert("Error", "Failed to get user profile");
        return;
      }

      const userId = profileResult.data.id;

      // Fetch recent expenses and statistics
      const [expensesResult, statsResult] = await Promise.all([
        fetchExpenses(userId),
        getExpenseStats(userId),
      ]);

      if (expensesResult.error) {
        Alert.alert(
          "Error",
          "Failed to load expenses: " + expensesResult.error.message
        );
        return;
      }

      if (statsResult.error) {
        Alert.alert(
          "Error",
          "Failed to load statistics: " + statsResult.error.message
        );
        return;
      }

      setExpenses(expensesResult.data || []);
      setStatistics(statsResult.data);
    } catch (error) {
      console.error("Error loading stats data:", error);
      Alert.alert("Error", "Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={AppStyles.colors.accent} />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Expense Statistics</Text>
        <Text style={styles.subtitle}>Your spending overview</Text>
      </View>

      {/* Statistics Cards */}
      {statistics && (
        <View style={styles.statsContainer}>
          {/* Total Expenses */}
          <View style={[styles.statCard, styles.darkCard]}>
            <Text style={styles.statLabel}>Total Expenses</Text>
            <Text style={styles.statValue}>
              {formatCurrency(statistics.total_amount)}
            </Text>
            <Text style={styles.statSubtext}>
              {statistics.expense_count} transactions
            </Text>
          </View>

          {/* Average per Transaction */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average per Transaction</Text>
            <Text
              style={[
                styles.statValue,
                { color: AppStyles.colors.text.primary },
              ]}
            >
              {formatCurrency(statistics.average_amount)}
            </Text>
          </View>
        </View>
      )}

      {/* Category Breakdown */}
      {statistics?.category_breakdown &&
        statistics.category_breakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            <View style={styles.categoryContainer}>
              {statistics.category_breakdown.map((category: any) => (
                <View key={category.category_id} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryIcon}>📊</Text>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>
                        {category.category_name}
                      </Text>
                      <Text style={styles.categoryCount}>
                        {category.expense_count} expenses
                      </Text>
                    </View>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(category.total_amount)}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            (category.total_amount / statistics.total_amount) *
                            100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

      {/* Recent Expenses */}
      {expenses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <View style={styles.expensesContainer}>
            {expenses.slice(0, 10).map((expense) => (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <Text style={styles.expenseIcon}>
                    {expense.category?.icon || "💰"}
                  </Text>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDescription}>
                      {expense.description}
                    </Text>
                    <Text style={styles.expenseCategory}>
                      {expense.category?.name || "Other"} •{" "}
                      {formatDate(expense.expense_date)}
                    </Text>
                    {expense.is_group_expense && (
                      <Text style={styles.expenseGroup}>Group Expense</Text>
                    )}
                  </View>
                  <Text style={styles.expenseAmount}>
                    {formatCurrency(expense.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {expenses.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Expenses Yet</Text>
          <Text style={styles.emptyStateText}>
            Start adding expenses to see your statistics here.
          </Text>
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity
        style={[
          styles.refreshButton,
          refreshing && styles.refreshButtonDisabled,
        ]}
        onPress={handleRefresh}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator color={AppStyles.colors.text.inverse} />
        ) : (
          <Text style={styles.refreshButtonText}>Refresh Data</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.colors.surface,
  },
  contentContainer: {
    padding: AppStyles.spacing.md,
    paddingBottom: AppStyles.spacing.xxl,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...AppStyles.typography.body,
    color: AppStyles.colors.text.secondary,
    marginTop: AppStyles.spacing.md,
  },
  header: {
    marginBottom: AppStyles.spacing.lg,
  },
  title: {
    ...AppStyles.typography.h2,
    color: AppStyles.colors.text.primary,
    marginBottom: AppStyles.spacing.xs,
  },
  subtitle: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: AppStyles.spacing.md,
    marginBottom: AppStyles.spacing.lg,
  },
  statCard: {
    backgroundColor: AppStyles.colors.background,
    borderRadius: AppStyles.borderRadius.md,
    padding: AppStyles.spacing.md,
    width: "48%",
    ...AppStyles.shadows.sm,
  },
  darkCard: {
    backgroundColor: AppStyles.colors.darkCard,
    width: "100%",
    marginBottom: AppStyles.spacing.md,
  },
  statLabel: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.secondary,
    marginBottom: AppStyles.spacing.xs,
  },
  statValue: {
    ...AppStyles.typography.h2,
    color: AppStyles.colors.text.inverse,
    marginBottom: AppStyles.spacing.xs,
  },
  statSubtext: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.text.tertiary,
    opacity: 0.8,
  },
  section: {
    marginBottom: AppStyles.spacing.lg,
  },
  sectionTitle: {
    ...AppStyles.typography.h3,
    color: AppStyles.colors.text.primary,
    marginBottom: AppStyles.spacing.md,
  },
  categoryContainer: {
    gap: AppStyles.spacing.sm,
  },
  categoryCard: {
    backgroundColor: AppStyles.colors.background,
    borderRadius: AppStyles.borderRadius.sm,
    padding: AppStyles.spacing.md,
    ...AppStyles.shadows.sm,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: AppStyles.spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: AppStyles.spacing.sm,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.primary,
  },
  categoryCount: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.text.tertiary,
  },
  categoryAmount: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: AppStyles.colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: AppStyles.colors.accent,
  },
  expensesContainer: {
    gap: AppStyles.spacing.sm,
  },
  expenseCard: {
    backgroundColor: AppStyles.colors.background,
    borderRadius: AppStyles.borderRadius.sm,
    padding: AppStyles.spacing.md,
    ...AppStyles.shadows.sm,
  },
  expenseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  expenseIcon: {
    fontSize: 20,
    marginRight: AppStyles.spacing.sm,
    marginTop: 2,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.primary,
    marginBottom: 2,
  },
  expenseCategory: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.text.tertiary,
    marginBottom: 2,
  },
  expenseGroup: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.accent,
    fontWeight: "500",
  },
  expenseAmount: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.primary,
    marginLeft: AppStyles.spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: AppStyles.spacing.xxl,
  },
  emptyStateTitle: {
    ...AppStyles.typography.h3,
    color: AppStyles.colors.text.primary,
    marginBottom: AppStyles.spacing.sm,
  },
  emptyStateText: {
    ...AppStyles.typography.body,
    color: AppStyles.colors.text.secondary,
    textAlign: "center",
    maxWidth: 200,
  },
  refreshButton: {
    backgroundColor: AppStyles.colors.text.primary,
    borderRadius: AppStyles.borderRadius.sm,
    paddingVertical: AppStyles.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: AppStyles.spacing.lg,
    minHeight: 48,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.inverse,
  },
});

export default StatsScreen;
