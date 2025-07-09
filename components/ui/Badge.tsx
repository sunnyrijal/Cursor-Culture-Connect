import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme, spacing, borderRadius, typography } from '../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ 
  label, 
  variant = 'primary', 
  size = 'md',
  style,
  textStyle 
}: BadgeProps) {
  return (
    <View style={[
      styles.badge,
      styles[variant],
      styles[size],
      style,
    ]}>
      <Text style={[
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        textStyle,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  
  // Variants
  primary: {
    backgroundColor: theme.primary,
  },
  secondary: {
    backgroundColor: theme.accent,
  },
  success: {
    backgroundColor: theme.success,
  },
  warning: {
    backgroundColor: theme.warning,
  },
  info: {
    backgroundColor: theme.info,
  },
  
  // Sizes
  sm: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    minHeight: 18,
  },
  md: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    minHeight: 22,
  },
  
  // Text styles
  text: {
    fontFamily: typography.fontFamily.medium,
    color: theme.white,
  },
  primaryText: {
    color: theme.white,
  },
  secondaryText: {
    color: theme.white,
  },
  successText: {
    color: theme.white,
  },
  warningText: {
    color: theme.white,
  },
  infoText: {
    color: theme.white,
  },
  
  // Text sizes
  smText: {
    fontSize: typography.fontSize.xs,
  },
  mdText: {
    fontSize: typography.fontSize.sm,
  },
});