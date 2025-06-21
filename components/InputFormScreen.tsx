import { AppStyles } from "@/constants/AppStyles";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const InputFormScreen = () => (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
  >
    {/* Balance Card */}
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>Current Balance</Text>
      <Text style={styles.balanceAmount}>€ 0.00</Text>
      <Text style={styles.balanceSubtext}>Available to spend</Text>
    </View>

    {/* Quick Actions */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>+</Text>
          </View>
          <Text style={styles.actionText}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>📷</Text>
          </View>
          <Text style={styles.actionText}>Scan Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>👥</Text>
          </View>
          <Text style={styles.actionText}>Split Bill</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>💳</Text>
          </View>
          <Text style={styles.actionText}>Manual Entry</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Recent Activity */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        <Text style={styles.emptyStateText}>No recent expenses</Text>
        <Text style={styles.emptyStateSubtext}>
          Start by adding your first expense above
        </Text>
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
  balanceCard: {
    ...AppStyles.darkCard,
    marginBottom: AppStyles.spacing.lg,
    alignItems: "center",
  },
  balanceLabel: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.inverse,
    opacity: 0.8,
    marginBottom: AppStyles.spacing.xs,
  },
  balanceAmount: {
    ...AppStyles.typography.h1,
    color: AppStyles.colors.text.inverse,
    marginBottom: AppStyles.spacing.xs,
  },
  balanceSubtext: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.text.inverse,
    opacity: 0.6,
  },
  section: {
    marginBottom: AppStyles.spacing.lg,
  },
  sectionTitle: {
    ...AppStyles.typography.h3,
    color: AppStyles.colors.text.primary,
    marginBottom: AppStyles.spacing.md,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    ...AppStyles.card,
    width: "48%",
    alignItems: "center",
    marginBottom: AppStyles.spacing.md,
    paddingVertical: AppStyles.spacing.lg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: AppStyles.borderRadius.full,
    backgroundColor: AppStyles.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: AppStyles.spacing.md,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionText: {
    ...AppStyles.typography.captionMedium,
    color: AppStyles.colors.text.primary,
    textAlign: "center",
  },
  activityCard: {
    ...AppStyles.card,
    alignItems: "center",
    paddingVertical: AppStyles.spacing.xl,
  },
  emptyStateText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.secondary,
    marginBottom: AppStyles.spacing.xs,
  },
  emptyStateSubtext: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.tertiary,
    textAlign: "center",
  },
});

export default InputFormScreen;
