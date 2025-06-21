import StatsScreen from "@/components/StatsScreen";
import { AppStyles } from "@/constants/AppStyles";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function StatsTab() {
  return (
    <View style={styles.container}>
      <StatsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.colors.surface,
  },
});
