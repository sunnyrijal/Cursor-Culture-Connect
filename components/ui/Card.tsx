import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme, spacing, borderRadius } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  elevated?: boolean;
}

export function Card({ children, style, padding = 'md', elevated = true }: CardProps) {
  return (
    <View style={[
      styles.card,
      { padding: spacing[padding] },
      elevated && styles.elevated,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  elevated: {
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});