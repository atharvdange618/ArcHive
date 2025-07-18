import React from "react";
import { View } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";

interface ContentCardProps {
  children: React.ReactNode;
}

const ContentCard: React.FC<ContentCardProps> = ({ children }) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          padding: 16,
          marginBottom: 12,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        { backgroundColor: colors.card, borderColor: colors.subtleBorder },
      ]}
    >
      {children}
    </View>
  );
};

export default ContentCard;
