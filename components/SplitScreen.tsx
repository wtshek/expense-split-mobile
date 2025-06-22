import { AppStyles } from "@/constants/AppStyles";
import { ExpenseWithDetails, Profile } from "@/types/database";
import {
  fetchExpenses,
  fetchProfiles,
  getCurrentUserProfile,
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

const SplitScreen = () => {
  const [loading, setLoading] = useState(true);
  const [groupExpenses, setGroupExpenses] = useState<ExpenseWithDetails[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
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
      setCurrentProfile(profileResult.data);

      // Fetch all profiles and group expenses
      const [profilesResult, expensesResult] = await Promise.all([
        fetchProfiles(),
        fetchExpenses(userId, null, { is_group_expense: true }),
      ]);

      if (profilesResult.error) {
        Alert.alert(
          "Error",
          "Failed to load profiles: " + profilesResult.error.message
        );
        return;
      }

      if (expensesResult.error) {
        Alert.alert(
          "Error",
          "Failed to load expenses: " + expensesResult.error.message
        );
        return;
      }

      setProfiles(profilesResult.data || []);
      setGroupExpenses(expensesResult.data || []);

      // Calculate balances
      calculateBalances(expensesResult.data || [], userId);
    } catch (error) {
      console.error("Error loading split data:", error);
      Alert.alert("Error", "Failed to load split data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = (
    expenses: ExpenseWithDetails[],
    currentUserId: string
  ) => {
    const balanceMap: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      if (!expense.split_details || !expense.involved_profile_ids) return;

      const splitDetails = expense.split_details;
      const totalAmount = expense.amount;
      const paidBy = expense.paid_by_profile_id;

      // Calculate how much each person owes
      splitDetails.participants.forEach((participant) => {
        const profileId = participant.profile_id;
        const owedAmount = participant.amount;

        if (profileId === currentUserId) {
          // Current user's perspective
          if (paidBy === currentUserId) {
            // Current user paid, others owe them
            splitDetails.participants.forEach((p) => {
              if (p.profile_id !== currentUserId) {
                balanceMap[p.profile_id] =
                  (balanceMap[p.profile_id] || 0) + p.amount;
              }
            });
          } else {
            // Someone else paid, current user owes them
            balanceMap[paidBy] = (balanceMap[paidBy] || 0) - owedAmount;
          }
        }
      });
    });

    setBalances(balanceMap);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getBalanceText = (profileId: string, amount: number) => {
    const profile = profiles.find((p) => p.id === profileId);
    const name = profile?.name || "Unknown";

    if (amount > 0) {
      return `${name} owes you ${formatCurrency(amount)}`;
    } else if (amount < 0) {
      return `You owe ${name} ${formatCurrency(amount)}`;
    } else {
      return `You and ${name} are settled up`;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={AppStyles.colors.accent} />
        <Text style={styles.loadingText}>Loading split data...</Text>
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
        <Text style={styles.title}>Split Expenses</Text>
        <Text style={styles.subtitle}>Your shared expenses and balances</Text>
      </View>

      {/* Balances Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Balances</Text>
        {Object.keys(balances).length > 0 ? (
          <View style={styles.balancesContainer}>
            {Object.entries(balances).map(([profileId, amount]) => {
              if (Math.abs(amount) < 0.01) return null; // Skip near-zero balances

              return (
                <View key={profileId} style={styles.balanceCard}>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceText}>
                      {getBalanceText(profileId, amount)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.balanceIndicator,
                      {
                        backgroundColor:
                          amount > 0
                            ? AppStyles.colors.success
                            : AppStyles.colors.warning,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>All Settled Up!</Text>
            <Text style={styles.emptyStateText}>
              You have no outstanding balances with anyone.
            </Text>
          </View>
        )}
      </View>

      {/* Recent Group Expenses */}
      {groupExpenses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Group Expenses</Text>
          <View style={styles.expensesContainer}>
            {groupExpenses.slice(0, 10).map((expense) => {
              const paidByProfile = profiles.find(
                (p) => p.id === expense.paid_by_profile_id
              );
              const isPaidByCurrentUser =
                expense.paid_by_profile_id === currentProfile?.id;

              return (
                <View key={expense.id} style={styles.expenseCard}>
                  <View style={styles.expenseHeader}>
                    <Text style={styles.expenseIcon}>
                      {expense.category?.icon || "💰"}
                    </Text>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseDescription}>
                        {expense.description}
                      </Text>
                      <Text style={styles.expenseDetails}>
                        {formatDate(expense.expense_date)} • Paid by{" "}
                        {isPaidByCurrentUser ? "You" : paidByProfile?.name}
                      </Text>
                      <Text style={styles.expenseCategory}>
                        {expense.category?.name || "Other"}
                      </Text>
                    </View>
                    <View style={styles.expenseAmountContainer}>
                      <Text style={styles.expenseAmount}>
                        {formatCurrency(expense.amount)}
                      </Text>
                      {expense.split_details && (
                        <Text style={styles.expenseSplit}>
                          Split {expense.split_details.participants.length} ways
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Empty State for Expenses */}
      {groupExpenses.length === 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Group Expenses</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Group Expenses Yet</Text>
            <Text style={styles.emptyStateText}>
              Start adding group expenses to split costs with others.
            </Text>
          </View>
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
  section: {
    marginBottom: AppStyles.spacing.lg,
  },
  sectionTitle: {
    ...AppStyles.typography.h3,
    color: AppStyles.colors.text.primary,
    marginBottom: AppStyles.spacing.md,
  },
  balancesContainer: {
    gap: AppStyles.spacing.sm,
  },
  balanceCard: {
    backgroundColor: AppStyles.colors.background,
    borderRadius: AppStyles.borderRadius.sm,
    padding: AppStyles.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    ...AppStyles.shadows.sm,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.primary,
  },
  balanceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: AppStyles.spacing.sm,
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
  expenseDetails: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.text.secondary,
    marginBottom: 2,
  },
  expenseCategory: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.text.tertiary,
  },
  expenseAmountContainer: {
    alignItems: "flex-end",
    marginLeft: AppStyles.spacing.sm,
  },
  expenseAmount: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.primary,
  },
  expenseSplit: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.accent,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: AppStyles.spacing.xl,
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
    maxWidth: 250,
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

export default SplitScreen;
