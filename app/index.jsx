import { View, Text, StyleSheet, StatusBar, Image } from "react-native";
import React from "react";
import { hp, wp } from "../helpers/common";

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require("../assets/images/welcome.png")}
        style={styles.bgImage}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgImage: {
    width: wp(100),
    height: hp(100),
    position: "absolute",
  },
});

export default WelcomeScreen;
