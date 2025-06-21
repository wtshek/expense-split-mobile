import SplitScreen from "@/components/SplitScreen";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SplitTab() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expense Splitter</Text>
      </View>
      <SplitScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e4e8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1d1d1f",
    textAlign: "center",
  },
});
