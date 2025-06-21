import { AppStyles } from "@/constants/AppStyles";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
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
    category: "Food",
    date: new Date().toLocaleDateString(),
    isGroupExpense: false,
    paidBy: "Me",
    splitType: "equal",
    myPercentage: "50",
    myCustomAmount: "",
    notes: "",
  });

  const categories = ["Food", "Transport", "Home", "Entertainment", "Other"];
  const participants = ["Me", "My Girlfriend"];
  const splitOptions = [
    { label: "Equal Split (50/50)", value: "equal" },
    { label: "Percentage Split", value: "percentage" },
    { label: "Custom Amount", value: "custom" },
  ];

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

  const handleAddExpense = () => {
    // Basic validation
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }
    if (!formData.amount.trim() || isNaN(Number(formData.amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    // Additional validation for group expenses
    if (formData.isGroupExpense) {
      const totalAmount = parseFloat(formData.amount);
      const split = calculateSplit();

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

    // Log the form state to console
    const expenseData = {
      ...formData,
      split: formData.isGroupExpense ? calculateSplit() : null,
    };
    console.log("Expense Form Data:", expenseData);

    // Show success message
    Alert.alert(
      "Expense Added",
      `${formData.description} - €${formData.amount}`,
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setFormData({
              description: "",
              amount: "",
              category: "Food",
              date: new Date().toLocaleDateString(),
              isGroupExpense: false,
              paidBy: "Me",
              splitType: "equal",
              myPercentage: "50",
              myCustomAmount: "",
              notes: "",
            });
          },
        },
      ]
    );
  };

  const handleDatePress = () => {
    // Simple date input for now - could be enhanced with a proper date picker
    Alert.alert("Date Selection", "Date picker integration coming soon!", [
      { text: "OK" },
    ]);
  };

  const split = formData.isGroupExpense ? calculateSplit() : null;

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
          <Text style={styles.label}>Amount (€) *</Text>
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
                <Picker.Item key={category} label={category} value={category} />
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
                  ? "Split with My Girlfriend"
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
                {participants.map((participant) => (
                  <Picker.Item
                    key={participant}
                    label={participant}
                    value={participant}
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
                  <Text style={styles.splitPreviewLabel}>Me:</Text>
                  <Text style={styles.splitPreviewAmount}>
                    €{split.myAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.splitPreviewRow}>
                  <Text style={styles.splitPreviewLabel}>My Girlfriend:</Text>
                  <Text style={styles.splitPreviewAmount}>
                    €{split.partnerAmount.toFixed(2)}
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
          style={styles.submitButton}
          onPress={handleAddExpense}
        >
          <Text style={styles.submitButtonText}>Add Expense</Text>
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
    paddingVertical: AppStyles.spacing.sm,
  },
  switchLabels: {
    flex: 1,
  },
  switchSubtext: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.text.secondary,
    marginTop: 2,
  },
  splitInputContainer: {
    marginTop: AppStyles.spacing.sm,
    gap: AppStyles.spacing.xs,
  },
  splitLabel: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.secondary,
  },
  percentageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppStyles.spacing.sm,
  },
  percentageInput: {
    flex: 1,
    maxWidth: 80,
  },
  percentSymbol: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.secondary,
  },
  splitPreview: {
    ...AppStyles.card,
    backgroundColor: AppStyles.colors.surface,
    marginTop: AppStyles.spacing.sm,
    padding: AppStyles.spacing.md,
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
    paddingVertical: AppStyles.spacing.xs,
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
    ...AppStyles.button.primary,
    marginTop: AppStyles.spacing.md,
    minHeight: 56,
  },
  submitButtonText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.inverse,
  },
});

export default AddExpenseFormScreen;
