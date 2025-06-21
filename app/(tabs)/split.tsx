import SplitScreen from "@/components/SplitScreen";
import { AppStyles } from "@/constants/AppStyles";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function SplitTab() {
  return (
    <View style={styles.container}>
      <SplitScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.colors.surface,
  },
});
