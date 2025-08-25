import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Canvas, RoundedRect, Shadow, Group, Paint } from "@shopify/react-native-skia";

interface NeumorphicButtonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  children: React.ReactNode;
  backgroundColor?: string;
  pressed?: boolean;
  onPress?: () => void;
}

const NeumorphicButton = ({
  width = 48,
  height = 48,
  borderRadius = 16,
  children,
  backgroundColor = "#F0F3F7",
  pressed = false,
  onPress,
}: NeumorphicButtonProps) => {
  const distance = pressed ? 2 : 4;
  const blur = pressed ? 4 : 8;

  return (
    <Pressable onPress={onPress}>
      <Canvas style={{ width, height }}>
        <Group>
          {/* Dark shadow */}
          <Shadow
            dx={distance}
            dy={distance}
            blur={blur}
            color="rgba(163, 177, 198, 0.15)"
          />
          {/* Light shadow */}
          <Shadow
            dx={-distance}
            dy={-distance}
            blur={blur}
            color="rgba(255, 255, 255, 0.7)"
          />
          <RoundedRect
            x={0}
            y={0}
            width={width}
            height={height}
            r={borderRadius}
            color={backgroundColor}
          />
        </Group>
      </Canvas>
      <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
        {children}
      </View>
    </Pressable>
  );
};

export default NeumorphicButton;
