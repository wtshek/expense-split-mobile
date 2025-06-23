import { AppStyles } from "@/constants/AppStyles";
import { Category, Group, Profile } from "@/types/database";
import {
  addExpenseWithSplit,
  fetchCategories,
  fetchGroupMembers,
  fetchGroups,
  getCurrentUserProfile,
} from "@/utils/database";
// DateTimePicker removed to fix NativeEventEmitter issue
// Using simple text input for date instead
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
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
  selectedGroup: string;
  paidBy: string;
  splitType: SplitType;
  myPercentage: string;
  myCustomAmount: string;
  notes: string;
}

interface ErrorState {
  description?: string;
  amount?: string;
  category?: string;
  paidBy?: string;
  myPercentage?: string;
  myCustomAmount?: string;
  general?: string;
}

interface NotificationState {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
}

const AddExpenseFormScreen = () => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: "",
    amount: "",
    category: "",
    date: new Date().toLocaleDateString(),
    isGroupExpense: false,
    selectedGroup: "",
    paidBy: "",
    splitType: "equal",
    myPercentage: "50",
    myCustomAmount: "",
    notes: "",
  });

  // API state
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Date picker state removed - using simple text input now

  // Error handling
  const [errors, setErrors] = useState<ErrorState>({});
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    type: "info",
    visible: false,
  });

  // Animation for notification
  const notificationOpacity = useState(new Animated.Value(0))[0];

  // Modal states for iOS picker
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [showPaidByPicker, setShowPaidByPicker] = useState(false);
  const [showSplitTypePicker, setShowSplitTypePicker] = useState(false);

  const splitOptions = [
    { label: "Equal Split (50/50)", value: "equal" },
    { label: "Percentage Split", value: "percentage" },
    { label: "Custom Amount", value: "custom" },
  ];

  // Helper functions to get display text
  const getCategoryDisplayText = () => {
    const category = categories.find((cat) => cat.id === formData.category);
    return category
      ? `${category.icon || ""} ${category.name}`.trim()
      : "Select category";
  };

  const getGroupDisplayText = () => {
    const group = groups.find((g) => g.id === formData.selectedGroup);
    return group?.name || "Select group";
  };

  const getPaidByDisplayText = () => {
    const member = groupMembers.find((m) => m.id === formData.paidBy);
    return member?.name || "Select who paid";
  };

  const getSplitTypeDisplayText = () => {
    const option = splitOptions.find((opt) => opt.value === formData.splitType);
    return option?.label || "Equal Split (50/50)";
  };

  // iOS Picker Modal Component
  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    selectedValue: string,
    onValueChange: (value: string) => void,
    items: { label: string; value: string }[],
    title: string
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalDoneButton}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.modalPicker}
          >
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      </Pressable>
    </Modal>
  );

  // Initialize data on component mount
  useEffect(() => {
    // Add a small delay to ensure auth is initialized
    const timer = setTimeout(() => {
      initializeData();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Initialize date on component mount
  useEffect(() => {
    const currentDate = new Date();
    setFormData((prev) => ({
      ...prev,
      date: currentDate.toLocaleDateString(),
    }));
  }, []);

  // Handle notification animation
  useEffect(() => {
    if (notification.visible) {
      Animated.sequence([
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
      });
    }
  }, [notification.visible]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setNotification({ message, type, visible: true });
  };

  const clearErrors = () => {
    setErrors({});
  };

  const setFieldError = (field: keyof ErrorState, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const loadGroupMembers = async (groupId: string) => {
    try {
      const result = await fetchGroupMembers(groupId);
      if (result.error) {
        console.error("Failed to load group members:", result.error);
        setGroupMembers([]);
        return;
      }

      setGroupMembers(result.data || []);

      // Update paidBy to current user if they're a member of the group
      const currentUserIsMember = result.data?.some(
        (member: Profile) => member.id === currentProfile?.id
      );
      if (currentUserIsMember && currentProfile) {
        setFormData((prev) => ({
          ...prev,
          paidBy: currentProfile.id,
        }));
      } else if (result.data && result.data.length > 0) {
        // Default to first member if current user is not in the group
        setFormData((prev) => ({
          ...prev,
          paidBy: result.data![0].id,
        }));
      }
    } catch (error) {
      console.error("Error loading group members:", error);
      setGroupMembers([]);
    }
  };

  const initializeData = async () => {
    try {
      setLoading(true);
      clearErrors();

      // First get current user profile with error handling for auth session
      const currentProfileResult = await getCurrentUserProfile();
      if (currentProfileResult.error) {
        console.warn(
          "Failed to load user profile:",
          currentProfileResult.error
        );
        setErrors({
          general: "Authentication required. Please sign in to continue.",
        });
        setLoading(false);
        return;
      }

      setCurrentProfile(currentProfileResult.data);

      // Then fetch categories and groups
      const [categoriesResult, groupsResult] = await Promise.all([
        fetchCategories(),
        fetchGroups(currentProfileResult.data!.id),
      ]);

      if (categoriesResult.error) {
        setErrors({
          general: "Failed to load categories. Please check your connection.",
        });
        return;
      }

      if (groupsResult.error) {
        setErrors({
          general: "Failed to load groups. Please check your connection.",
        });
        return;
      }

      setCategories(categoriesResult.data || []);
      setGroups(groupsResult.data || []);

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

      // Set default group if groups exist
      if (groupsResult.data && groupsResult.data.length > 0) {
        const firstGroup = groupsResult.data[0];
        setFormData((prev) => ({
          ...prev,
          selectedGroup: firstGroup.id,
        }));
        // Load members for the first group
        loadGroupMembers(firstGroup.id);
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      setErrors({
        general:
          "Failed to load data. Please check your connection and try again.",
      });
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

    // Clear field-specific error when user starts typing
    if (errors[field as keyof ErrorState]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Handle group selection change
    if (field === "selectedGroup" && typeof value === "string") {
      loadGroupMembers(value);
    }
  };

  const calculateSplit = () => {
    const totalAmount = parseFloat(formData.amount) || 0;

    if (!formData.isGroupExpense || groupMembers.length === 0) {
      return { myAmount: totalAmount, partnerAmount: 0 };
    }

    switch (formData.splitType) {
      case "equal":
        const equalAmount = totalAmount / groupMembers.length;
        return {
          myAmount: equalAmount,
          partnerAmount: equalAmount,
        };
      case "percentage":
        const myPerc = parseFloat(formData.myPercentage) || 50;
        const othersPerc = (100 - myPerc) / (groupMembers.length - 1);
        return {
          myAmount: (totalAmount * myPerc) / 100,
          partnerAmount: (totalAmount * othersPerc) / 100,
        };
      case "custom":
        const myCustom = parseFloat(formData.myCustomAmount) || 0;
        const othersAmount =
          (totalAmount - myCustom) / (groupMembers.length - 1);
        return {
          myAmount: myCustom,
          partnerAmount: othersAmount,
        };
      default:
        return { myAmount: 0, partnerAmount: 0 };
    }
  };

  const validateForm = (): boolean => {
    clearErrors();
    let isValid = true;

    // Basic validation
    if (!formData.description.trim()) {
      setFieldError("description", "Please enter a description");
      isValid = false;
    }

    if (!formData.amount.trim() || isNaN(Number(formData.amount))) {
      setFieldError("amount", "Please enter a valid amount");
      isValid = false;
    }

    if (!currentProfile) {
      setErrors({
        general: "User profile not loaded. Please refresh the app.",
      });
      isValid = false;
    }

    const totalAmount = parseFloat(formData.amount);

    // Additional validation for group expenses
    if (formData.isGroupExpense) {
      if (formData.splitType === "percentage") {
        const myPerc = parseFloat(formData.myPercentage);
        if (isNaN(myPerc) || myPerc < 0 || myPerc > 100) {
          setFieldError(
            "myPercentage",
            "Please enter a valid percentage (0-100)"
          );
          isValid = false;
        }
      }

      if (formData.splitType === "custom") {
        const myCustom = parseFloat(formData.myCustomAmount);
        if (isNaN(myCustom) || myCustom < 0 || myCustom > totalAmount) {
          setFieldError("myCustomAmount", "Please enter a valid custom amount");
          isValid = false;
        }
      }
    }

    return isValid;
  };

  const handleAddExpense = async () => {
    if (submitting) return;

    if (!validateForm()) {
      return;
    }

    const totalAmount = parseFloat(formData.amount);

    try {
      setSubmitting(true);

      // Validate group members for group expenses
      if (formData.isGroupExpense && groupMembers.length < 2) {
        setErrors({
          general:
            "Group must have at least 2 members to create a group expense.",
        });
        return;
      }

      if (formData.isGroupExpense && !formData.selectedGroup) {
        setErrors({
          general: "Please select a group for group expenses.",
        });
        return;
      }

      // Prepare expense data
      const involvedProfiles = formData.isGroupExpense
        ? groupMembers.map((member) => member.id)
        : [currentProfile!.id];

      const expenseData = {
        description: formData.description.trim(),
        amount: totalAmount,
        category_id: formData.category,
        expense_date: new Date().toISOString(),
        is_group_expense: formData.isGroupExpense,
        group_id: formData.isGroupExpense ? formData.selectedGroup : null,
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
          const otherMembersPercentage =
            (100 - myPercentage) / (groupMembers.length - 1);
          splitConfig = {
            percentages: groupMembers.map((member) => ({
              profile_id: member.id,
              percentage:
                member.id === currentProfile!.id
                  ? myPercentage
                  : otherMembersPercentage,
            })),
          };
        } else if (formData.splitType === "custom") {
          const myAmount = parseFloat(formData.myCustomAmount);
          const remainingAmount = totalAmount - myAmount;
          const otherMembersAmount =
            remainingAmount / (groupMembers.length - 1);
          splitConfig = {
            customAmounts: groupMembers.map((member) => ({
              profile_id: member.id,
              amount:
                member.id === currentProfile!.id
                  ? myAmount
                  : otherMembersAmount,
            })),
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
        setErrors({
          general: `Failed to add expense: ${result.error.message}`,
        });
        return;
      }

      // Success!
      showNotification(
        `Expense "${formData.description}" has been added successfully!`,
        "success"
      );

      // Reset form
      const defaultGroup = groups.length > 0 ? groups[0].id : "";
      setFormData({
        description: "",
        amount: "",
        category: categories.length > 0 ? categories[0].id : "",
        date: new Date().toLocaleDateString(),
        isGroupExpense: false,
        selectedGroup: defaultGroup,
        paidBy: currentProfile!.id,
        splitType: "equal",
        myPercentage: "50",
        myCustomAmount: "",
        notes: "",
      });

      // Reset group members
      setGroupMembers([]);

      // Load members for default group if it exists
      if (defaultGroup) {
        loadGroupMembers(defaultGroup);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // Date picker functions removed - using simple text input now

  const split = formData.isGroupExpense ? calculateSplit() : null;

  // Show loading screen while initializing
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={AppStyles.colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={initializeData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Notification */}
      {notification.visible && (
        <Animated.View
          style={[
            styles.notification,
            notification.type === "success" && styles.notificationSuccess,
            notification.type === "error" && styles.notificationError,
            notification.type === "info" && styles.notificationInfo,
            { opacity: notificationOpacity },
          ]}
        >
          <Text style={styles.notificationText}>{notification.message}</Text>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add New Expense</Text>
          <Text style={styles.subtitle}>Track your spending</Text>
        </View>

        {/* General Error */}
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.description && styles.textInputError,
              ]}
              placeholder="Enter expense description"
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              maxLength={100}
            />
            {errors.description && (
              <Text style={styles.fieldErrorText}>{errors.description}</Text>
            )}
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={[styles.textInput, errors.amount && styles.textInputError]}
              placeholder="0.00"
              value={formData.amount}
              onChangeText={(value) => handleInputChange("amount", value)}
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.amount && (
              <Text style={styles.fieldErrorText}>{errors.amount}</Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text
                style={[
                  formData.category
                    ? styles.pickerButtonText
                    : styles.pickerButtonPlaceholder,
                ]}
              >
                {getCategoryDisplayText()}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="MM/DD/YYYY"
              value={formData.date}
              onChangeText={(value) => handleInputChange("date", value)}
              maxLength={10}
            />
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

          {/* Conditional: Group Selection (only for group expenses) */}
          {formData.isGroupExpense && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Group</Text>
              {groups.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    No groups available. You need to create a group first to add
                    group expenses.
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowGroupPicker(true)}
                >
                  <Text
                    style={[
                      formData.selectedGroup
                        ? styles.pickerButtonText
                        : styles.pickerButtonPlaceholder,
                    ]}
                  >
                    {getGroupDisplayText()}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Conditional: Paid By (only for group expenses) */}
          {formData.isGroupExpense && groupMembers.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Paid By</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowPaidByPicker(true)}
              >
                <Text
                  style={[
                    formData.paidBy
                      ? styles.pickerButtonText
                      : styles.pickerButtonPlaceholder,
                  ]}
                >
                  {getPaidByDisplayText()}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Conditional: Split Configuration (only for group expenses) */}
          {formData.isGroupExpense && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Split Configuration</Text>

              {/* Split Type Picker */}
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowSplitTypePicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {getSplitTypeDisplayText()}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>

              {/* Percentage Input (only for percentage split) */}
              {formData.splitType === "percentage" && (
                <View style={styles.splitInputContainer}>
                  <Text style={styles.splitLabel}>My Percentage</Text>
                  <View style={styles.percentageRow}>
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.percentageInput,
                        errors.myPercentage && styles.textInputError,
                      ]}
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
                  {errors.myPercentage && (
                    <Text style={styles.fieldErrorText}>
                      {errors.myPercentage}
                    </Text>
                  )}
                </View>
              )}

              {/* Custom Amount Input (only for custom split) */}
              {formData.splitType === "custom" && (
                <View style={styles.splitInputContainer}>
                  <Text style={styles.splitLabel}>My Amount</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.myCustomAmount && styles.textInputError,
                    ]}
                    placeholder="0.00"
                    value={formData.myCustomAmount}
                    onChangeText={(value) =>
                      handleInputChange("myCustomAmount", value)
                    }
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {errors.myCustomAmount && (
                    <Text style={styles.fieldErrorText}>
                      {errors.myCustomAmount}
                    </Text>
                  )}
                </View>
              )}

              {/* Split Preview */}
              {split && formData.amount && groupMembers.length > 0 && (
                <View style={styles.splitPreview}>
                  <Text style={styles.splitPreviewTitle}>Split Preview:</Text>
                  {groupMembers.map((member) => {
                    const isCurrentUser = member.id === currentProfile?.id;
                    let amount = 0;

                    if (formData.splitType === "equal") {
                      amount =
                        parseFloat(formData.amount) / groupMembers.length;
                    } else if (formData.splitType === "percentage") {
                      const percentage = isCurrentUser
                        ? parseFloat(formData.myPercentage)
                        : (100 - parseFloat(formData.myPercentage)) /
                          (groupMembers.length - 1);
                      amount = (parseFloat(formData.amount) * percentage) / 100;
                    } else if (formData.splitType === "custom") {
                      amount = isCurrentUser
                        ? parseFloat(formData.myCustomAmount) || 0
                        : (parseFloat(formData.amount) -
                            (parseFloat(formData.myCustomAmount) || 0)) /
                          (groupMembers.length - 1);
                    }

                    return (
                      <View key={member.id} style={styles.splitPreviewRow}>
                        <Text style={styles.splitPreviewLabel}>
                          {member.name}
                          {isCurrentUser ? " (You)" : ""}:
                        </Text>
                        <Text style={styles.splitPreviewAmount}>
                          {amount.toFixed(2)}
                        </Text>
                      </View>
                    );
                  })}
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

      {/* Date picker removed to fix NativeEventEmitter issue */}

      {/* Category Picker Modal */}
      {renderPickerModal(
        showCategoryPicker,
        () => setShowCategoryPicker(false),
        formData.category,
        (value) => handleInputChange("category", value),
        categories.map((cat) => ({
          label: `${cat.icon || ""} ${cat.name}`.trim(),
          value: cat.id,
        })),
        "Select Category"
      )}

      {/* Group Picker Modal */}
      {renderPickerModal(
        showGroupPicker,
        () => setShowGroupPicker(false),
        formData.selectedGroup,
        (value) => handleInputChange("selectedGroup", value),
        groups.map((group) => ({
          label: group.name,
          value: group.id,
        })),
        "Select Group"
      )}

      {/* Paid By Picker Modal */}
      {renderPickerModal(
        showPaidByPicker,
        () => setShowPaidByPicker(false),
        formData.paidBy,
        (value) => handleInputChange("paidBy", value),
        groupMembers.map((member) => ({
          label: member.name,
          value: member.id,
        })),
        "Select Who Paid"
      )}

      {/* Split Type Picker Modal */}
      {renderPickerModal(
        showSplitTypePicker,
        () => setShowSplitTypePicker(false),
        formData.splitType,
        (value) => handleInputChange("splitType", value as SplitType),
        splitOptions,
        "Select Split Type"
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.colors.surface,
  },
  scrollView: {
    flex: 1,
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
  textInputError: {
    borderColor: AppStyles.colors.error,
    borderWidth: 1,
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
    overflow: "visible", // Changed from "hidden" to allow iOS picker interaction
    minHeight: 160, // Ensure consistent height for iOS picker visibility
  },
  picker: {
    height: 160, // Increased height for iOS - iOS Picker needs more height to display properly
    backgroundColor: "transparent",
    color: "#000000", // Ensure text is visible on iOS
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
  // Error styles
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: AppStyles.borderRadius.sm,
    padding: AppStyles.spacing.md,
    marginBottom: AppStyles.spacing.md,
  },
  errorText: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.error,
    textAlign: "center",
  },
  fieldErrorText: {
    ...AppStyles.typography.small,
    color: AppStyles.colors.error,
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: AppStyles.colors.error,
    borderRadius: AppStyles.borderRadius.sm,
    paddingVertical: AppStyles.spacing.sm,
    paddingHorizontal: AppStyles.spacing.md,
    alignItems: "center",
    marginTop: AppStyles.spacing.sm,
  },
  retryButtonText: {
    ...AppStyles.typography.captionMedium,
    color: AppStyles.colors.text.inverse,
  },
  // Notification styles
  notification: {
    position: "absolute",
    top: 60,
    left: AppStyles.spacing.md,
    right: AppStyles.spacing.md,
    padding: AppStyles.spacing.md,
    borderRadius: AppStyles.borderRadius.md,
    zIndex: 1000,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  notificationSuccess: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  notificationError: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  notificationInfo: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  notificationText: {
    ...AppStyles.typography.caption,
    textAlign: "center",
  },

  // Empty state styles
  emptyStateContainer: {
    backgroundColor: AppStyles.colors.surface,
    borderRadius: AppStyles.borderRadius.sm,
    padding: AppStyles.spacing.md,
    borderWidth: 1,
    borderColor: AppStyles.colors.border,
    alignItems: "center",
  },
  emptyStateText: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.secondary,
    textAlign: "center",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: AppStyles.colors.background,
    borderTopLeftRadius: AppStyles.borderRadius.lg,
    borderTopRightRadius: AppStyles.borderRadius.lg,
    paddingBottom: AppStyles.spacing.sm,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: AppStyles.spacing.md,
    paddingBottom: AppStyles.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppStyles.colors.border,
  },
  modalTitle: {
    ...AppStyles.typography.h3,
    color: AppStyles.colors.text.primary,
  },
  modalDoneButton: {
    padding: AppStyles.spacing.sm,
  },
  modalDoneText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.accent,
  },
  modalPicker: {
    height: 180,
    backgroundColor: "transparent",
    marginTop: -AppStyles.spacing.sm,
  },
  pickerButton: {
    backgroundColor: AppStyles.colors.surface,
    borderRadius: AppStyles.borderRadius.sm,
    borderWidth: 1,
    borderColor: AppStyles.colors.border,
    padding: AppStyles.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.primary,
  },
  pickerButtonPlaceholder: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.tertiary,
  },
  pickerArrow: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.tertiary,
  },
});

export default AddExpenseFormScreen;
