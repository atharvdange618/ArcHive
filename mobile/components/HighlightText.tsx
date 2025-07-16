import React from "react";
import { Text } from "react-native";
import { useThemeColors } from "../constants/useColorScheme";

interface HighlightTextProps {
  text: string;
  highlight: string;
  style?: any;
}

const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  style,
}) => {
  const colors = useThemeColors();

  if (!highlight.trim()) {
    return <Text style={style}>{text}</Text>;
  }

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <Text key={index} style={{ backgroundColor: colors.primaryLighter }}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
};

export default HighlightText;
