import AddExpenseFormScreen from "@/components/AddExpenseFormScreen";
import { AppStyles } from "@/constants/AppStyles";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function InputScreen() {
  return (
    <View style={styles.container}>
      <AddExpenseFormScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.colors.surface,
  },
});
