import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SplitScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Split Details</Text>
    <Text style={styles.subtitle}>Expense splitting details will go here</Text>
    <View style={styles.placeholderBox}>
      <Text style={styles.placeholderText}>
        • Who owes what{"\n"}• Split calculations{"\n"}• Payment tracking{"\n"}•
        Settlement suggestions
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1d1d1f",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 30,
  },
  placeholderBox: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    minWidth: 250,
  },
  placeholderText: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
  },
});

export default SplitScreen;
