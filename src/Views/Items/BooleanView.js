import React from "react";
import { StyleSheet, Text, View } from "react-native";

const BooleanType = props => {
  const checkBox = "placeholder for the checkbox";
  return (
    <View style={styles.container}>
      <Text>{checkBox}</Text>
    </View>
  );
};

export default BooleanType;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
