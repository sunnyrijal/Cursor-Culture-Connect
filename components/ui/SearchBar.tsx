import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../theme';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  onSearch?: (text: string) => void;
  style?: ViewStyle;
}

export default function SearchBar({ 
  placeholder = "Search...", 
  value: propValue, 
  onChangeText,
  onSubmitEditing,
  onSearch,
  style
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  
  // Use either the controlled value from props or the internal state
  const value = propValue !== undefined ? propValue : internalValue;
  
  const handleChangeText = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    }
    // Update internal state if we're not using a controlled component
    if (propValue === undefined) {
      setInternalValue(text);
    }
  };
  
  const handleSubmitEditing = () => {
    if (onSubmitEditing) {
      onSubmitEditing();
    }
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Search size={20} color={theme.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmitEditing}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
});