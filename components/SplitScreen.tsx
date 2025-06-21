import { AppStyles } from "@/constants/AppStyles";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SplitScreen = () => (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
  >
    {/* Active Splits Summary */}
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Active Splits</Text>
      <Text style={styles.summaryAmount}>€ 0.00</Text>
      <Text style={styles.summarySubtext}>Total pending settlements</Text>
    </View>

    {/* Quick Actions */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>New Split</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Settle Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Recent Contacts */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Contacts</Text>
      <View style={styles.contactsCard}>
        <View style={styles.emptyContactsState}>
          <Text style={styles.emptyStateTitle}>No contacts yet</Text>
          <Text style={styles.emptyStateText}>
            Add friends to start splitting expenses
          </Text>
        </View>
      </View>
    </View>

    {/* Settlement Suggestions */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settlement Suggestions</Text>
      <View style={styles.settlementCard}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>All settled up!</Text>
          <Text style={styles.emptyStateText}>
            No pending settlements at the moment
          </Text>
        </View>
      </View>
    </View>

    {/* Recent Activity */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No recent activity</Text>
          <Text style={styles.emptyStateText}>
            Split history will appear here
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
  summaryCard: {
    ...AppStyles.darkCard,
    alignItems: "center",
    marginBottom: AppStyles.spacing.lg,
  },
  summaryTitle: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.inverse,
    opacity: 0.8,
    marginBottom: AppStyles.spacing.xs,
  },
  summaryAmount: {
    ...AppStyles.typography.h1,
    color: AppStyles.colors.text.inverse,
    marginBottom: AppStyles.spacing.xs,
  },
  summarySubtext: {
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    ...AppStyles.button.primary,
    flex: 1,
    marginRight: AppStyles.spacing.sm,
  },
  secondaryButton: {
    ...AppStyles.button.secondary,
    marginRight: 0,
    marginLeft: AppStyles.spacing.sm,
  },
  actionButtonText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.inverse,
  },
  secondaryButtonText: {
    color: AppStyles.colors.text.primary,
  },
  contactsCard: {
    ...AppStyles.card,
    minHeight: 120,
    justifyContent: "center",
  },
  emptyContactsState: {
    alignItems: "center",
    paddingVertical: AppStyles.spacing.lg,
  },
  settlementCard: {
    ...AppStyles.card,
    minHeight: 100,
    justifyContent: "center",
  },
  activityCard: {
    ...AppStyles.card,
    minHeight: 120,
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

export default SplitScreen;
