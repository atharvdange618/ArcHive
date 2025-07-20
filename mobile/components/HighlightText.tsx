import React from "react";
import { Text } from "react-native";

interface HighlightTextProps {
  text: string;
  highlight?: string | null;
  style?: any;
}

const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  style,
}) => {
  const highlightString = highlight || "";

  if (!highlightString) {
    return <Text style={style}>{text}</Text>;
  }

  const regex = new RegExp(`(${highlightString})`, "gi");
  const parts = text.split(regex);

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        regex.test(part) ? <Text key={index}>{part}</Text> : part
      )}
    </Text>
  );
};

export default HighlightText;
