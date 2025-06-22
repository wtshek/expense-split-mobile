import { AppStyles } from "@/constants/AppStyles";
import { Category, Profile } from "@/types/database";
import {
  addExpenseWithSplit,
  fetchCategories,
  fetchProfiles,
  getCurrentUserProfile,
  initializeDatabase,
} from "@/utils/database";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SplitType = "equal" | "percentage" | "custom";

interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
  date: string;
  isGroupExpense: boolean;
  paidBy: string;
  splitType: SplitType;
  myPercentage: string;
  myCustomAmount: string;
  notes: string;
}

const AddExpenseFormScreen = () => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: "",
    amount: "",
    category: "",
    date: new Date().toLocaleDateString(),
    isGroupExpense: false,
    paidBy: "",
    splitType: "equal",
    myPercentage: "50",
    myCustomAmount: "",
    notes: "",
  });

  // API state
  const [categories, setCategories] = useState<Category[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const splitOptions = [
    { label: "Equal Split (50/50)", value: "equal" },
    { label: "Percentage Split", value: "percentage" },
    { label: "Custom Amount", value: "custom" },
  ];

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);

      // Initialize database if needed
      const initResult = await initializeDatabase();
      if (!initResult.success) {
        Alert.alert(
          "Error",
          "Failed to initialize database: " + initResult.error?.message
        );
        return;
      }

      // Fetch all required data
      const [categoriesResult, profilesResult, currentProfileResult] =
        await Promise.all([
          fetchCategories(),
          fetchProfiles(),
          getCurrentUserProfile(),
        ]);

      if (categoriesResult.error) {
        Alert.alert(
          "Error",
          "Failed to load categories: " + categoriesResult.error.message
        );
        return;
      }

      if (profilesResult.error) {
        Alert.alert(
          "Error",
          "Failed to load profiles: " + profilesResult.error.message
        );
        return;
      }

      if (currentProfileResult.error) {
        Alert.alert(
          "Error",
          "Failed to load your profile: " + currentProfileResult.error.message
        );
        return;
      }

      setCategories(categoriesResult.data || []);
      setProfiles(profilesResult.data || []);
      setCurrentProfile(currentProfileResult.data);

      // Set default values
      if (categoriesResult.data && categoriesResult.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          category: categoriesResult.data![0].id,
        }));
      }

      if (currentProfileResult.data) {
        setFormData((prev) => ({
          ...prev,
          paidBy: currentProfileResult.data!.id,
        }));
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ExpenseFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateSplit = () => {
    const totalAmount = parseFloat(formData.amount) || 0;

    switch (formData.splitType) {
      case "equal":
        return {
          myAmount: totalAmount / 2,
          partnerAmount: totalAmount / 2,
        };
      case "percentage":
        const myPerc = parseFloat(formData.myPercentage) || 50;
        const partnerPerc = 100 - myPerc;
        return {
          myAmount: (totalAmount * myPerc) / 100,
          partnerAmount: (totalAmount * partnerPerc) / 100,
        };
      case "custom":
        const myCustom = parseFloat(formData.myCustomAmount) || 0;
        return {
          myAmount: myCustom,
          partnerAmount: totalAmount - myCustom,
        };
      default:
        return { myAmount: 0, partnerAmount: 0 };
    }
  };

  const handleAddExpense = async () => {
    if (submitting) return;

    // Basic validation
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }
    if (!formData.amount.trim() || isNaN(Number(formData.amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!currentProfile) {
      Alert.alert("Error", "User profile not loaded");
      return;
    }

    const totalAmount = parseFloat(formData.amount);

    // Additional validation for group expenses
    if (formData.isGroupExpense) {
      if (formData.splitType === "percentage") {
        const myPerc = parseFloat(formData.myPercentage);
        if (isNaN(myPerc) || myPerc < 0 || myPerc > 100) {
          Alert.alert("Error", "Please enter a valid percentage (0-100)");
          return;
        }
      }

      if (formData.splitType === "custom") {
        const myCustom = parseFloat(formData.myCustomAmount);
        if (isNaN(myCustom) || myCustom < 0 || myCustom > totalAmount) {
          Alert.alert("Error", "Please enter a valid custom amount");
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      // Find the partner profile (assuming it's the other profile that's not current user)
      const partnerProfile = profiles.find((p) => p.id !== currentProfile.id);
      if (formData.isGroupExpense && !partnerProfile) {
        Alert.alert("Error", "Partner profile not found");
        return;
      }

      // Prepare expense data
      const involvedProfiles = formData.isGroupExpense
        ? [currentProfile.id, partnerProfile!.id]
        : [currentProfile.id];

      const expenseData = {
        description: formData.description.trim(),
        amount: totalAmount,
        category_id: formData.category,
        expense_date: new Date().toISOString(),
        is_group_expense: formData.isGroupExpense,
        group_id: null, // For now, not using groups
        paid_by_profile_id: formData.paidBy,
        involved_profile_ids: involvedProfiles,
        notes: formData.notes.trim() || undefined,
      };

      let result;

      if (formData.isGroupExpense) {
        // Create expense with split
        let splitConfig;

        if (formData.splitType === "percentage") {
          const myPercentage = parseFloat(formData.myPercentage);
          splitConfig = {
            percentages: [
              { profile_id: currentProfile.id, percentage: myPercentage },
              {
                profile_id: partnerProfile!.id,
                percentage: 100 - myPercentage,
              },
            ],
          };
        } else if (formData.splitType === "custom") {
          const myAmount = parseFloat(formData.myCustomAmount);
          splitConfig = {
            customAmounts: [
              { profile_id: currentProfile.id, amount: myAmount },
              {
                profile_id: partnerProfile!.id,
                amount: totalAmount - myAmount,
              },
            ],
          };
        }

        result = await addExpenseWithSplit(
          expenseData,
          formData.splitType,
          splitConfig
        );
      } else {
        // Personal expense (equal split with just one person)
        result = await addExpenseWithSplit(expenseData, "equal");
      }

      if (result.error) {
        Alert.alert("Error", "Failed to add expense: " + result.error.message);
        return;
      }

      // Success!
      Alert.alert(
        "Success",
        `Expense "${formData.description}" has been added successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setFormData({
                description: "",
                amount: "",
                category: categories.length > 0 ? categories[0].id : "",
                date: new Date().toLocaleDateString(),
                isGroupExpense: false,
                paidBy: currentProfile.id,
                splitType: "equal",
                myPercentage: "50",
                myCustomAmount: "",
                notes: "",
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error adding expense:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDatePress = () => {
    // Simple date input for now - could be enhanced with a proper date picker
    Alert.alert("Date Selection", "Date picker integration coming soon!", [
      { text: "OK" },
    ]);
  };

  const split = formData.isGroupExpense ? calculateSplit() : null;

  // Show loading screen while initializing
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={AppStyles.colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.title}>Add New Expense</Text>
        <Text style={styles.subtitle}>Track your spending</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter expense description"
            value={formData.description}
            onChangeText={(value) => handleInputChange("description", value)}
            maxLength={100}
          />
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            value={formData.amount}
            onChangeText={(value) => handleInputChange("amount", value)}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
              style={styles.picker}
            >
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={`${category.icon || ""} ${category.name}`}
                  value={category.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.dateInput} onPress={handleDatePress}>
            <Text style={styles.dateText}>{formData.date}</Text>
          </TouchableOpacity>
        </View>

        {/* Group Expense Toggle */}
        <View style={styles.inputGroup}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabels}>
              <Text style={styles.label}>Group Expense</Text>
              <Text style={styles.switchSubtext}>
                {formData.isGroupExpense
                  ? "Split with others"
                  : "Personal expense"}
              </Text>
            </View>
            <Switch
              value={formData.isGroupExpense}
              onValueChange={(value) =>
                handleInputChange("isGroupExpense", value)
              }
              trackColor={{
                false: AppStyles.colors.border,
                true: AppStyles.colors.accent,
              }}
              thumbColor={
                formData.isGroupExpense
                  ? AppStyles.colors.background
                  : AppStyles.colors.text.tertiary
              }
            />
          </View>
        </View>

        {/* Conditional: Paid By (only for group expenses) */}
        {formData.isGroupExpense && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Paid By</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.paidBy}
                onValueChange={(value) => handleInputChange("paidBy", value)}
                style={styles.picker}
              >
                {profiles.map((profile) => (
                  <Picker.Item
                    key={profile.id}
                    label={profile.name}
                    value={profile.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Conditional: Split Configuration (only for group expenses) */}
        {formData.isGroupExpense && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Split Configuration</Text>

            {/* Split Type Picker */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.splitType}
                onValueChange={(value) =>
                  handleInputChange("splitType", value as SplitType)
                }
                style={styles.picker}
              >
                {splitOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Percentage Input (only for percentage split) */}
            {formData.splitType === "percentage" && (
              <View style={styles.splitInputContainer}>
                <Text style={styles.splitLabel}>My Percentage</Text>
                <View style={styles.percentageRow}>
                  <TextInput
                    style={[styles.textInput, styles.percentageInput]}
                    placeholder="50"
                    value={formData.myPercentage}
                    onChangeText={(value) =>
                      handleInputChange("myPercentage", value)
                    }
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
              </View>
            )}

            {/* Custom Amount Input (only for custom split) */}
            {formData.splitType === "custom" && (
              <View style={styles.splitInputContainer}>
                <Text style={styles.splitLabel}>My Amount</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00"
                  value={formData.myCustomAmount}
                  onChangeText={(value) =>
                    handleInputChange("myCustomAmount", value)
                  }
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            )}

            {/* Split Preview */}
            {split && formData.amount && (
              <View style={styles.splitPreview}>
                <Text style={styles.splitPreviewTitle}>Split Preview:</Text>
                <View style={styles.splitPreviewRow}>
                  <Text style={styles.splitPreviewLabel}>
                    {currentProfile?.name || "Me"}:
                  </Text>
                  <Text style={styles.splitPreviewAmount}>
                    {split.myAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.splitPreviewRow}>
                  <Text style={styles.splitPreviewLabel}>
                    {profiles.find((p) => p.id !== currentProfile?.id)?.name ||
                      "Partner"}
                    :
                  </Text>
                  <Text style={styles.splitPreviewAmount}>
                    {split.partnerAmount.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Add any additional notes..."
            value={formData.notes}
            onChangeText={(value) => handleInputChange("notes", value)}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Add Expense Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleAddExpense}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={AppStyles.colors.text.inverse} />
          ) : (
            <Text style={styles.submitButtonText}>Add Expense</Text>
          )}
        </TouchableOpacity>
      </View>
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
  form: {
    gap: AppStyles.spacing.lg,
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
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: AppStyles.colors.surface,
    borderRadius: AppStyles.borderRadius.sm,
    borderWidth: 1,
    borderColor: AppStyles.colors.border,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    backgroundColor: "transparent",
  },
  dateInput: {
    ...AppStyles.inputField,
    justifyContent: "center",
    minHeight: 48,
  },
  dateText: {
    ...AppStyles.typography.body,
    color: AppStyles.colors.text.primary,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabels: {
    flex: 1,
  },
  switchSubtext: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.text.tertiary,
    marginTop: 2,
  },
  splitInputContainer: {
    marginTop: AppStyles.spacing.sm,
  },
  splitLabel: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.secondary,
    marginBottom: AppStyles.spacing.xs,
  },
  percentageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  percentageInput: {
    flex: 1,
    marginRight: AppStyles.spacing.sm,
  },
  percentSymbol: {
    ...AppStyles.typography.body,
    color: AppStyles.colors.text.secondary,
    fontWeight: "500",
  },
  splitPreview: {
    backgroundColor: AppStyles.colors.background,
    padding: AppStyles.spacing.md,
    borderRadius: AppStyles.borderRadius.sm,
    marginTop: AppStyles.spacing.sm,
    borderWidth: 1,
    borderColor: AppStyles.colors.border,
  },
  splitPreviewTitle: {
    ...AppStyles.typography.captionMedium,
    color: AppStyles.colors.text.primary,
    marginBottom: AppStyles.spacing.sm,
  },
  splitPreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: AppStyles.spacing.xs,
  },
  splitPreviewLabel: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.secondary,
  },
  splitPreviewAmount: {
    ...AppStyles.typography.captionMedium,
    color: AppStyles.colors.text.primary,
  },
  submitButton: {
    backgroundColor: AppStyles.colors.text.primary,
    borderRadius: AppStyles.borderRadius.sm,
    paddingVertical: AppStyles.spacing.md,
    paddingHorizontal: AppStyles.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: AppStyles.spacing.md,
    minHeight: 48,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.inverse,
  },
});

export default AddExpenseFormScreen;
