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
  const [filteredUniversities, setFilteredUniversities] = useState<
    University[]
  >([]);

  const dropdownHeight = useSharedValue(0);
  const dropdownOpacity = useSharedValue(0);
  const rotateAnimation = useSharedValue(0);

  const inputRef = useRef<TextInput>(null);
  const dropdownRef = useRef<ScrollView>(null);

  // Fixed maximum height for dropdown - this ensures consistent scrolling
  const MAX_DROPDOWN_HEIGHT = 280; // About 5 items

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
      // Use fixed height for consistent scrolling behavior
      dropdownHeight.value = withSpring(MAX_DROPDOWN_HEIGHT, {
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

    if (!isDropdownOpen && text.length > 0 && universities.length > 0) {
      setIsDropdownOpen(true);
      onFocus();

      // Use fixed height for consistent behavior
      dropdownHeight.value = withSpring(MAX_DROPDOWN_HEIGHT, {
        damping: 15,
        stiffness: 100,
      });
      dropdownOpacity.value = withTiming(1, { duration: 200 });
      rotateAnimation.value = withTiming(180, { duration: 200 });
    }
  };

  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    height: dropdownHeight.value, // Use fixed height instead of maxHeight
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
          activeOpacity={0.7}
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
        <Animated.View
          style={[styles.dropdownContainer, dropdownAnimatedStyle]}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 1)', 'rgba(248, 250, 252, 1)']}
            style={styles.dropdownGradient}
          >
            <ScrollView
              ref={dropdownRef}
              style={styles.dropdown}
              contentContainerStyle={styles.dropdownContentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              bounces={true}
              overScrollMode="always"
              // Add these props for better scrolling
              scrollEventThrottle={16}
              decelerationRate="normal"
            >
              {filteredUniversities.length > 0 ? (
                <>
                  {/* Search suggestion if typing manually */}
                  {searchText &&
                    !filteredUniversities.find(
                      (u) => u.name.toLowerCase() === searchText.toLowerCase()
                    ) && (
                      <TouchableOpacity
                        style={[styles.dropdownItem, styles.manualEntryItem]}
                        onPress={() =>
                          selectUniversity({ id: 'manual', name: searchText })
                        }
                        activeOpacity={0.8}
                      >
                        <View style={styles.dropdownItemContent}>
                          <Search size={16} color="#6366F1" />
                          <Text
                            style={[
                              styles.dropdownItemText,
                              styles.manualEntryText,
                            ]}
                          >
                            Use "{searchText}"
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                  {/* University options */}
                  {filteredUniversities.map((university, index) => (
                    <TouchableOpacity
                      key={university.id}
                      style={[
                        styles.dropdownItem,
                        searchText === university.name &&
                          styles.dropdownItemSelected,
                        // Remove border from last item for cleaner look
                        index === filteredUniversities.length - 1 && 
                          styles.lastDropdownItem,
                      ]}
                      onPress={() => selectUniversity(university)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.dropdownItemContent}>
                        <GraduationCap size={16} color="#6366F1" />
                        <Text
                          style={[
                            styles.dropdownItemText,
                            searchText === university.name &&
                              styles.dropdownItemTextSelected,
                          ]}
                          numberOfLines={2} // Allow 2 lines for long university names
                          ellipsizeMode="tail"
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
                  <Text style={styles.noResultsText}>
                    No universities found
                  </Text>
                  {searchText && (
                    <TouchableOpacity
                      style={styles.manualEntryButton}
                      onPress={() =>
                        selectUniversity({ id: 'manual', name: searchText })
                      }
                      activeOpacity={0.8}
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
      )}

      {isValid === false && value && (
        <Text style={styles.validationText}>
          Please enter a valid university name
        </Text>
      )}
    </View>
  );
};

export default UniversityDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    zIndex: 1001,
    position: 'relative',
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
  dropdownContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 9999,
    borderRadius: 16,
    overflow: 'hidden',
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
    flex: 1,
  },
  dropdownContentContainer: {
    // Remove flexGrow: 1 to allow proper scrolling
    paddingBottom: 8, // Add some padding at bottom
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14, // Slightly reduced for more items to fit
    minHeight: 52, // Slightly smaller min height
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
  },
  lastDropdownItem: {
    borderBottomWidth: 0, // Remove border from last item
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20, // Better line height for multi-line text
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
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    height: 240, // Fixed height to fill the dropdown space
  },
  noResultsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  manualEntryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  manualEntryButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    textAlign: 'center',
  },
});