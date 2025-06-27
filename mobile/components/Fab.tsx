import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "../constants/useColorScheme";

interface FabProps {
  onPress?: () => void;
}

const Fab: React.FC<FabProps> = ({ onPress }) => {
  const colors = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);
  const textTranslateY = useSharedValue(0);
  const linkTranslateY = useSharedValue(0);
  const codeTranslateY = useSharedValue(0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    rotation.value = withTiming(isOpen ? 0 : 45, { duration: 200 });
    textTranslateY.value = withSpring(isOpen ? 0 : -70);
    linkTranslateY.value = withSpring(isOpen ? 0 : -130);
    codeTranslateY.value = withSpring(isOpen ? 0 : -190);
  };

  const animatedFabStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: textTranslateY.value }],
      opacity: withTiming(isOpen ? 1 : 0, {
        duration: 200,
        easing: Easing.ease,
      }),
    };
  });

  const animatedLinkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: linkTranslateY.value }],
      opacity: withTiming(isOpen ? 1 : 0, {
        duration: 200,
        easing: Easing.ease,
      }),
    };
  });

  const animatedCodeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: codeTranslateY.value }],
      opacity: withTiming(isOpen ? 1 : 0, {
        duration: 200,
        easing: Easing.ease,
      }),
    };
  });

  const navigateToCreate = (type: "text" | "link" | "code") => {
    toggleMenu();
    router.push(`/create/${type}`);
  };

  return (
    <View style={styles.container}>
      {isOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}

      <Animated.View
        style={[
          styles.subFab,
          { backgroundColor: colors.tint },
          animatedCodeStyle,
        ]}
      >
        <TouchableOpacity onPress={() => navigateToCreate("code")}>
          <FontAwesome name="code" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.subFab,
          { backgroundColor: colors.tint },
          animatedLinkStyle,
        ]}
      >
        <TouchableOpacity onPress={() => navigateToCreate("link")}>
          <FontAwesome name="link" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.subFab,
          { backgroundColor: colors.tint },
          animatedTextStyle,
        ]}
      >
        <TouchableOpacity onPress={() => navigateToCreate("text")}>
          <FontAwesome name="file-text-o" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[styles.fab, { backgroundColor: colors.tint }, animatedFabStyle]}
      >
        <TouchableOpacity onPress={toggleMenu}>
          <FontAwesome name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: "rgba(0,0,0,0.0)",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  subFab: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9,
  },
});

export default Fab;
