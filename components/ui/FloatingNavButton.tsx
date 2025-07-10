import React from 'react';
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { Menu } from 'lucide-react-native';

export default function FloatingNavButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityLabel="Show navigation bar"
        accessibilityRole="button"
      >
        <Menu size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 28 : 16,
    right: Platform.OS === 'web' ? 28 : 16,
    zIndex: 100,
    pointerEvents: 'box-none',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EC4899', // More noticeable accent color
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
}); 