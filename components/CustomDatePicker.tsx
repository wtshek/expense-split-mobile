import { AppStyles } from "@/constants/AppStyles";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  title?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  onClose,
  selectedDate,
  onDateChange,
  title = "Select Date",
}) => {
  const [tempDate, setTempDate] = useState(selectedDate);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleDateConfirm = () => {
    onDateChange(tempDate);
    onClose();
  };

  const handleDateCancel = () => {
    setTempDate(selectedDate);
    onClose();
  };

  const updateDate = (year?: number, month?: number, day?: number) => {
    const newDate = new Date(tempDate);
    if (year !== undefined) newDate.setFullYear(year);
    if (month !== undefined) newDate.setMonth(month);
    if (day !== undefined) newDate.setDate(day);

    // Ensure the day is valid for the selected month/year
    const daysInMonth = getDaysInMonth(
      newDate.getFullYear(),
      newDate.getMonth()
    );
    if (newDate.getDate() > daysInMonth) {
      newDate.setDate(daysInMonth);
    }

    setTempDate(newDate);
  };

  const renderScrollPicker = (
    items: (string | number)[],
    selectedValue: string | number,
    onValueChange: (value: any) => void,
    labelKey?: string
  ) => (
    <ScrollView
      style={styles.scrollPicker}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollPickerContent}
    >
      {items.map((item, index) => {
        const isSelected = item === selectedValue;
        const displayText =
          labelKey && typeof item === "object"
            ? (item as any)[labelKey]
            : item.toString();

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.scrollPickerItem,
              isSelected && styles.scrollPickerItemSelected,
            ]}
            onPress={() => onValueChange(item)}
          >
            <Text
              style={[
                styles.scrollPickerItemText,
                isSelected && styles.scrollPickerItemTextSelected,
              ]}
            >
              {displayText}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const daysInCurrentMonth = getDaysInMonth(
    tempDate.getFullYear(),
    tempDate.getMonth()
  );
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleDateCancel}
    >
      <Pressable style={styles.modalOverlay} onPress={handleDateCancel}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleDateCancel}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={handleDateConfirm}
              style={styles.modalButton}
            >
              <Text style={[styles.modalButtonText, styles.modalConfirmText]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectedDateDisplay}>
            <Text style={styles.selectedDateText}>
              {tempDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          <View style={styles.pickersContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Month</Text>
              {renderScrollPicker(
                months,
                months[tempDate.getMonth()],
                (month: string) => {
                  const monthIndex = months.indexOf(month);
                  updateDate(undefined, monthIndex);
                }
              )}
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Day</Text>
              {renderScrollPicker(days, tempDate.getDate(), (day: number) =>
                updateDate(undefined, undefined, day)
              )}
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Year</Text>
              {renderScrollPicker(
                years,
                tempDate.getFullYear(),
                (year: number) => updateDate(year)
              )}
            </View>
          </View>

          <View style={styles.todayButtonContainer}>
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => setTempDate(new Date())}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: AppStyles.colors.background,
    borderTopLeftRadius: AppStyles.borderRadius.lg,
    borderTopRightRadius: AppStyles.borderRadius.lg,
    paddingBottom: AppStyles.spacing.md,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: AppStyles.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppStyles.colors.border,
  },
  modalTitle: {
    ...AppStyles.typography.h3,
    color: AppStyles.colors.text.primary,
  },
  modalButton: {
    padding: AppStyles.spacing.xs,
  },
  modalButtonText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.secondary,
  },
  modalConfirmText: {
    color: AppStyles.colors.accent,
  },
  selectedDateDisplay: {
    alignItems: "center",
    padding: AppStyles.spacing.lg,
    backgroundColor: AppStyles.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AppStyles.colors.border,
  },
  selectedDateText: {
    ...AppStyles.typography.bodyMedium,
    color: AppStyles.colors.text.primary,
    textAlign: "center",
  },
  pickersContainer: {
    flexDirection: "row",
    paddingHorizontal: AppStyles.spacing.md,
    paddingTop: AppStyles.spacing.md,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: AppStyles.spacing.xs,
  },
  pickerLabel: {
    ...AppStyles.typography.captionMedium,
    color: AppStyles.colors.text.secondary,
    textAlign: "center",
    marginBottom: AppStyles.spacing.sm,
  },
  scrollPicker: {
    height: 180,
    backgroundColor: AppStyles.colors.surface,
    borderRadius: AppStyles.borderRadius.sm,
    borderWidth: 1,
    borderColor: AppStyles.colors.border,
  },
  scrollPickerContent: {
    paddingVertical: AppStyles.spacing.sm,
  },
  scrollPickerItem: {
    paddingVertical: AppStyles.spacing.sm,
    paddingHorizontal: AppStyles.spacing.md,
    alignItems: "center",
  },
  scrollPickerItemSelected: {
    backgroundColor: AppStyles.colors.accent + "15", // 15% opacity
  },
  scrollPickerItemText: {
    ...AppStyles.typography.caption,
    color: AppStyles.colors.text.secondary,
  },
  scrollPickerItemTextSelected: {
    ...AppStyles.typography.captionMedium,
    color: AppStyles.colors.accent,
  },
  todayButtonContainer: {
    alignItems: "center",
    paddingTop: AppStyles.spacing.md,
  },
  todayButton: {
    backgroundColor: AppStyles.colors.surface,
    borderRadius: AppStyles.borderRadius.sm,
    borderWidth: 1,
    borderColor: AppStyles.colors.border,
    paddingVertical: AppStyles.spacing.sm,
    paddingHorizontal: AppStyles.spacing.lg,
  },
  todayButtonText: {
    ...AppStyles.typography.captionMedium,
    color: AppStyles.colors.accent,
  },
});

export default CustomDatePicker;
