import { AppStyles } from "@/constants/AppStyles";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const StatsScreen = () => (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
  >
    {/* Overview Cards */}
    <View style={styles.overviewGrid}>
      <View style={styles.overviewCard}>
        <Text style={styles.overviewLabel}>Total Spent</Text>
        <Text style={styles.overviewAmount}>€ 0.00</Text>
        <Text style={styles.overviewChange}>+0% from last month</Text>
      </View>

      <View style={styles.overviewCard}>
        <Text style={styles.overviewLabel}>Pending Splits</Text>
        <Text style={styles.overviewAmount}>€ 0.00</Text>
        <Text style={styles.overviewChange}>0 transactions</Text>
      </View>
    </View>

    {/* Monthly Summary */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Monthly Summary</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>This Month</Text>
          <Text style={styles.summaryValue}>€ 0.00</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Last Month</Text>
          <Text style={styles.summaryValue}>€ 0.00</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Average</Text>
          <Text style={styles.summaryValue}>€ 0.00</Text>
        </View>
      </View>
    </View>

    {/* Categories */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Top Categories</Text>
      <View style={styles.categoriesCard}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No expenses yet</Text>
          <Text style={styles.emptyStateText}>
            Start tracking expenses to see category breakdowns
          </Text>
        </View>
      </View>
    </View>

    {/* Recent Trends */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Spending Trends</Text>
      <View style={styles.trendsCard}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Charts coming soon</Text>
          <Text style={styles.emptyStateText}>
            Visual spending trends and analytics
          </Text>
        </View>
      </View>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.colors.surface,
  },
  contentContainer: {
    padding: AppStyles.spacing.md,
    paddingBottom: AppStyles.spacing.xxl,
  },
  overviewGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: AppStyles.spacing.lg,
  },
  overviewCard: {
    ...AppStyles.card,
    width: "48%",
    alignItems: "center",
  },
  overviewLabel: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.secondary,
    marginBottom: AppStyles.spacing.xs,
  },
  overviewAmount: {
    ...AppStyles.typography.h2,
    color: AppStyles.colors.text.primary,
    marginBottom: AppStyles.spacing.xs,
  },
  overviewChange: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.text.tertiary,
  },
  section: {
    marginBottom: AppStyles.spacing.lg,
  },
  sectionTitle: {
    ...AppStyles.typography.h3,
    color: AppStyles.colors.text.primary,
    marginBottom: AppStyles.spacing.md,
  },
  summaryCard: {
    ...AppStyles.card,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: AppStyles.spacing.sm,
  },
  summaryLabel: {
    ...AppStyles.typography.body,
    color: AppStyles.colors.text.secondary,
  },
  summaryValue: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: AppStyles.colors.border,
    marginVertical: AppStyles.spacing.xs,
  },
  categoriesCard: {
    ...AppStyles.card,
    minHeight: 120,
    justifyContent: "center",
  },
  trendsCard: {
    ...AppStyles.card,
    minHeight: 180,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: AppStyles.spacing.lg,
  },
  emptyStateTitle: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.secondary,
    marginBottom: AppStyles.spacing.xs,
  },
  emptyStateText: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.tertiary,
    textAlign: "center",
  },
});

export default StatsScreen;
