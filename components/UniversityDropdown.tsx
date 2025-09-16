'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface University {
  id: string;
  name: string;
}

interface UniversityDropdownProps {
  universities: University[] | undefined;
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder: string;
  isValid?: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  loading?: boolean;
}

const UniversityDropdown: React.FC<UniversityDropdownProps> = ({
  universities = [],
  value,
  onValueChange,
  label,
  placeholder,
  isValid,
  isFocused,
  onFocus,
  onBlur,
  loading = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState(value);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  
  const dropdownHeight = useSharedValue(0);
  const dropdownOpacity = useSharedValue(0);
  const rotateAnimation = useSharedValue(0);
  
  const inputRef = useRef<TextInput>(null);
  const dropdownRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (universities && universities.length > 0) {
      if (searchText.trim() === '') {
        setFilteredUniversities(universities);
      } else {
        const filtered = universities.filter((university) =>
          university.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredUniversities(filtered);
      }
    }
  }, [searchText, universities]);

  useEffect(() => {
    setSearchText(value);
  }, [value]);

  const toggleDropdown = () => {
    const newState = !isDropdownOpen;
    setIsDropdownOpen(newState);
    
    if (newState) {
      onFocus();
      dropdownHeight.value = withSpring(Math.min(filteredUniversities.length * 50, 200), {
        damping: 15,
        stiffness: 100,
      });
      dropdownOpacity.value = withTiming(1, { duration: 200 });
      rotateAnimation.value = withTiming(180, { duration: 200 });
    } else {
      dropdownHeight.value = withTiming(0, { duration: 200 });
      dropdownOpacity.value = withTiming(0, { duration: 200 });
      rotateAnimation.value = withTiming(0, { duration: 200 });
      runOnJS(() => {
        onBlur();
      })();
    }
  };

  const selectUniversity = (university: University) => {
    onValueChange(university.name);
    setSearchText(university.name);
    setIsDropdownOpen(false);
    
    dropdownHeight.value = withTiming(0, { duration: 200 });
    dropdownOpacity.value = withTiming(0, { duration: 200 });
    rotateAnimation.value = withTiming(0, { duration: 200 });
    
    setTimeout(() => {
      onBlur();
    }, 100);
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    onValueChange(text);
    
    if (!isDropdownOpen && text.length > 0) {
      setIsDropdownOpen(true);
      onFocus();
      dropdownHeight.value = withSpring(Math.min(filteredUniversities.length * 50, 200), {
        damping: 15,
        stiffness: 100,
      });
      dropdownOpacity.value = withTiming(1, { duration: 200 });
      rotateAnimation.value = withTiming(180, { duration: 200 });
    }
  };

  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    height: dropdownHeight.value,
    opacity: dropdownOpacity.value,
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnimation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>{label}</Text>
      
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          isValid === true && styles.inputWrapperValid,
          isValid === false && value && styles.inputWrapperInvalid,
        ]}
      >
        <View style={styles.inputIcon}>
          <GraduationCap
            size={20}
            color={
              isFocused
                ? '#6366F1'
                : isValid === true
                ? '#10B981'
                : isValid === false && value
                ? '#EF4444'
                : '#9CA3AF'
            }
          />
        </View>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          value={searchText}
          onChangeText={handleTextChange}
          onFocus={() => {
            onFocus();
            if (universities && universities.length > 0 && !isDropdownOpen) {
              toggleDropdown();
            }
          }}
          onBlur={() => {
            // Delay blur to allow for dropdown selection
            setTimeout(() => {
              if (!isDropdownOpen) {
                onBlur();
              }
            }, 150);
          }}
          editable={!loading}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
        />

        <TouchableOpacity
          onPress={toggleDropdown}
          style={styles.dropdownButton}
          disabled={loading}
        >
          <Animated.View style={chevronAnimatedStyle}>
            <ChevronDown size={20} color="#9CA3AF" />
          </Animated.View>
        </TouchableOpacity>

        {isValid === true && value && (
          <View style={styles.validIcon}>
            <CheckCircle size={16} color="#10B981" />
          </View>
        )}

        {isValid === false && value && (
          <View style={styles.validIcon}>
            <AlertCircle size={16} color="#EF4444" />
          </View>
        )}
      </View>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <View style={styles.dropdownWrapper}>
          <Animated.View style={[styles.dropdownContainer, dropdownAnimatedStyle]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 1)', 'rgba(248, 250, 252, 1)']}
              style={styles.dropdownGradient}
            >
              <ScrollView
                ref={dropdownRef}
                style={styles.dropdown}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
            {filteredUniversities.length > 0 ? (
              <>
                {/* Search suggestion if typing manually */}
                {searchText && 
                 !filteredUniversities.find(u => u.name.toLowerCase() === searchText.toLowerCase()) && (
                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.manualEntryItem]}
                    onPress={() => selectUniversity({ id: 'manual', name: searchText })}
                  >
                    <View style={styles.dropdownItemContent}>
                      <Search size={16} color="#6366F1" />
                      <Text style={[styles.dropdownItemText, styles.manualEntryText]}>
                        Use "{searchText}"
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                
                {/* University options */}
                {filteredUniversities.map((university) => (
                  <TouchableOpacity
                    key={university.id}
                    style={[
                      styles.dropdownItem,
                      searchText === university.name && styles.dropdownItemSelected,
                    ]}
                    onPress={() => selectUniversity(university)}
                  >
                    <View style={styles.dropdownItemContent}>
                      <GraduationCap size={16} color="#6366F1" />
                      <Text
                        style={[
                          styles.dropdownItemText,
                          searchText === university.name && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {university.name}
                      </Text>
                    </View>
                    {searchText === university.name && (
                      <CheckCircle size={16} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.noResultsContainer}>
                <Search size={20} color="#9CA3AF" />
                <Text style={styles.noResultsText}>No universities found</Text>
                {searchText && (
                  <TouchableOpacity
                    style={styles.manualEntryButton}
                    onPress={() => selectUniversity({ id: 'manual', name: searchText })}
                  >
                    <Text style={styles.manualEntryButtonText}>
                      Use "{searchText}" anyway
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </View>
      )}

      {isValid === false && value && (
        <Text style={styles.validationText}>
          Please enter a valid university name
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    zIndex: 1001,
    position: 'relative',
    overflow: 'visible',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputWrapperFocused: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputWrapperValid: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  inputWrapperInvalid: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  dropdownButton: {
    padding: 8,
    marginLeft: 8,
  },
  validIcon: {
    marginLeft: 8,
  },
  validationText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  dropdownWrapper: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    elevation: 25,
    pointerEvents: 'box-none',
  },
  dropdownContainer: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  dropdownGradient: {
    flex: 1,
    borderRadius: 16,
  },
  dropdown: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 12,
  },
  dropdownItemTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  manualEntryItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(99, 102, 241, 0.2)',
  },
  manualEntryText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    minHeight:100
  },
  noResultsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontWeight: '500',
  },
  manualEntryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  manualEntryButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
});

export default UniversityDropdown;
