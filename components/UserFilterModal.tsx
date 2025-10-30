import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Filter, ChevronDown } from 'lucide-react-native';
import Checkbox from 'expo-checkbox';
import { useQuery } from '@tanstack/react-query';
import DropDownPicker from 'react-native-dropdown-picker';
import { getUniversities } from '@/contexts/university.api';
import { getMajors } from '@/contexts/major.api';
import statesData from '../data/US_States_list.json';
import citiesData from '../data/US_Cities.json';

const theme = {
  primary: '#667EEA',
  textPrimary: '#2D3748',
  textSecondary: '#4A5568',
};

export const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "Mandarin",
  "Hindi",
  "French",
  "Arabic",
  "Bengali",
  "Russian",
  "Portuguese",
  "Indonesian",
  "Urdu",
  "German",
  "Japanese",
  "Swahili",
  "Marathi",
  "Telugu",
  "Turkish",
  "Korean",
  "Vietnamese",
  "Tamil",
];

export interface FriendFilters {
  myUniversity?: boolean;
  major?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  universityId?: string;
  state?: string;
  language?: string;
  country?: string;
  city?: string;
}

interface FriendFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FriendFilters;
  onFiltersChange: (filters: FriendFilters) => void;
  onApply: () => void;
}

interface DropdownProps {
  title: string;
  selectedValue?: string;
  options: Array<{ id: string; name: string }>;
  onSelect: (value: string | undefined) => void;
  placeholder: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  selectedValue,
  options,
  onSelect,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const selectedOption = options.find(option => option.id === selectedValue);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownTitle}>{title}</Text>
      
      <TouchableOpacity
        style={[styles.dropdownButton, isOpen && styles.dropdownButtonOpen]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[
          styles.dropdownButtonText,
          !selectedOption && styles.dropdownPlaceholder
        ]}>
          {selectedOption ? selectedOption.name : placeholder}
        </Text>
        <ChevronDown 
          size={20} 
          color={theme.textSecondary} 
          style={[styles.chevron, isOpen && styles.chevronRotated]}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          <TouchableOpacity
            style={styles.dropdownOption}
            onPress={() => {
              onSelect(undefined);
              setIsOpen(false);
            }}
          >
            <Text style={[styles.dropdownOptionText, styles.clearOptionText]}>
              Clear Selection
            </Text>
          </TouchableOpacity>
          
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dropdownOption,
                  selectedValue === option.id && styles.selectedOption
                ]}
                onPress={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  selectedValue === option.id && styles.selectedOptionText
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export const FriendFilterModal: React.FC<FriendFilterModalProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
  onApply,
}) => {
  const [tempFilters, setTempFilters] = React.useState<FriendFilters>(filters);
  
  // State and City dropdown states
  const [stateOpen, setStateOpen] = React.useState(false);
  const [cityOpen, setCityOpen] = React.useState(false);
  const [stateItems, setStateItems] = React.useState<Array<{label: string; value: string}>>([]);
  const [locationExpanded, setLocationExpanded] = React.useState(false);
  const [cityItems, setCityItems] = React.useState<Array<{label: string; value: string}>>([]);

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: getUniversities,
  });

  const { data: majorsResponse } = useQuery({
    queryKey: ['majors'],
    queryFn: () => getMajors(),
  });

  const universityOptions = React.useMemo(() => {
    if (!universities?.data) return [];
    return universities.data.map((uni: any) => ({
      id: uni.id,
      name: uni.name,
    }));
  }, [universities]);

  const majorOptions = React.useMemo(() => {
    if (!majorsResponse?.data) return [];
    return majorsResponse.data.map((major: any) => ({
      id: major.name, // Using name as ID for filter state
      name: major.name,
    }));
  }, [majorsResponse]);

  const languageOptions = React.useMemo(() => {
    return LANGUAGE_OPTIONS.map(lang => ({
      id: lang,
      name: lang,
    }));
  }, []);

  // Initialize state items
  React.useEffect(() => {
    const states = Object.values(statesData).map((stateName) => ({
      label: stateName,
      value: stateName,
    }));
    setStateItems(states);
  }, []);

  // Update city items when state changes
  React.useEffect(() => {
    if (tempFilters.state) {
      const citiesForState = (citiesData as any)[tempFilters.state] || [];
      const cities = citiesForState.map((cityName: string) => ({
        label: cityName,
        value: cityName,
      }));
      setCityItems(cities);
    } else {
      setCityItems([]);
    }
  }, [tempFilters.state]);

  React.useEffect(() => {
    if (visible) {
      setTempFilters(filters);
    }
  }, [visible, filters]);

const updateFilter = (key: keyof FriendFilters, value: any) => {
    setTempFilters((prev) => {
      const newFilters = { ...prev };
      newFilters[key] = value || undefined;
      if (key === 'state' && value !== prev.state) {
        newFilters.city = undefined;
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setTempFilters({});
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    onApply();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter Friends</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* University Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>University</Text>
            
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateFilter('myUniversity', !tempFilters.myUniversity)}
            >
              <Checkbox
                style={styles.checkbox}
                value={tempFilters.myUniversity || false}
                onValueChange={(value) => updateFilter('myUniversity', value)}
                color={tempFilters.myUniversity ? theme.primary : undefined}
              />
              <Text style={styles.checkboxLabel}>My University Only</Text>
            </TouchableOpacity>

            <Dropdown
              title="Select Specific University"
              selectedValue={tempFilters.universityId}
              options={universityOptions}
              onSelect={(value) => updateFilter('universityId', value)}
              placeholder="All Universities"
            />
          </View>

          {/* Location Filter */}
          <View style={styles.section}>
            <TouchableOpacity onPress={() => setLocationExpanded(!locationExpanded)} style={[styles.expandableHeader, !locationExpanded && { marginBottom: 0 }]}>
              <Text style={[styles.sectionTitle, !locationExpanded && { marginBottom: 0 }]}>Location</Text>
              <ChevronDown size={20} color={theme.textSecondary} style={{ transform: [{ rotate: locationExpanded ? '180deg' : '0deg' }] }} />
            </TouchableOpacity>

            {locationExpanded && (
              <View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Country (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., United States"
                    value={tempFilters.country || ''}
                    onChangeText={(text) => updateFilter('country', text)}
                    placeholderTextColor="#A0AEC0"
                  />
                </View>

                {/* State Dropdown */}
                <View style={[styles.inputContainer, { zIndex: 2000 }]}>
                  <Text style={styles.inputLabel}>State (Optional)</Text>
                  <DropDownPicker
                    open={stateOpen}
                    value={tempFilters.state || null}
                    items={stateItems}
                    setOpen={setStateOpen}
                    setValue={(callback) => {
                      const newValue = typeof callback === 'function' ? callback(tempFilters.state || null) : callback;
                      updateFilter('state', newValue);
                    }}
                    setItems={setStateItems}
                    placeholder="Select state"
                    searchable={true}
                    searchPlaceholder="Search states..."
                    listMode="MODAL"
                    zIndexInverse={5000}
                    modalProps={{
                      animationType: 'slide',
                    }}
                    style={styles.pickerStyle}
                    dropDownContainerStyle={styles.pickerDropDownContainerStyle}
                    textStyle={styles.pickerTextStyle}
                    placeholderStyle={styles.pickerPlaceholderStyle}
                    searchTextInputStyle={styles.pickerSearchStyle}
                    ArrowDownIconComponent={() => <ChevronDown size={20} color="#9CA3AF" />}
                    ArrowUpIconComponent={() => <ChevronDown size={20} color="#9CA3AF" style={{ transform: [{ rotate: '180deg' }] }} />} zIndex={3000}
                  />
                </View>

                {/* City Dropdown */}
                <View style={[styles.inputContainer, { zIndex: 1000 }]}>
                  <Text style={styles.inputLabel}>City (Optional)</Text>
                  <DropDownPicker
                    open={cityOpen}
                    value={tempFilters.city || null}
                    items={cityItems}
                    setOpen={setCityOpen}
                    setValue={(callback) => {
                      const newValue = typeof callback === 'function' ? callback(tempFilters.city || null) : callback;
                      updateFilter('city', newValue);
                    }}
                    setItems={setCityItems}
                    placeholder={tempFilters.state ? 'Select city' : 'Select a state first'}
                    disabled={!tempFilters.state}
                    searchable={true}
                    searchPlaceholder="Search cities..."
                    listMode="MODAL"
                    zIndexInverse={4000}
                    modalProps={{
                      animationType: 'slide',
                    }}
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                    style={[styles.pickerStyle, !tempFilters.state && styles.pickerDisabled]}
                    dropDownContainerStyle={styles.pickerDropDownContainerStyle}
                    textStyle={styles.pickerTextStyle}
                    placeholderStyle={styles.pickerPlaceholderStyle}
                    searchTextInputStyle={styles.pickerSearchStyle}
                    ArrowDownIconComponent={() => <ChevronDown size={20} color="#9CA3AF" />}
                    ArrowUpIconComponent={() => <ChevronDown size={20} color="#9CA3AF" style={{ transform: [{ rotate: '180deg' }] }} />} zIndex={2000}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Major Filter */}
          <View style={styles.section}>
            <Dropdown
              title="Major"
              selectedValue={tempFilters.major}
              options={majorOptions}
              onSelect={(value) => updateFilter('major', value)}
              placeholder="All Majors"
            />
          </View>

          {/* Language Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Spanish, Hindi"
              value={tempFilters.language || ''}
              onChangeText={(text) => updateFilter('language', text)}
              placeholderTextColor="#A0AEC0"
            />
            <View style={styles.suggestionContainer}>
              {LANGUAGE_OPTIONS.slice(0, 5).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.suggestionChip,
                    tempFilters.language === lang && styles.activeSuggestionChip,
                  ]}
                  onPress={() => updateFilter('language', lang === tempFilters.language ? undefined : lang)}
                >
                  <Text style={[styles.suggestionChipText, tempFilters.language === lang && styles.activeSuggestionChipText]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            
            <View style={styles.sortRow}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  tempFilters.sortBy === 'name' && styles.activeSortButton
                ]}
                onPress={() => updateFilter('sortBy', 
                  tempFilters.sortBy === 'name' ? undefined : 'name'
                )}
              >
                <Text style={[
                  styles.sortButtonText,
                  tempFilters.sortBy === 'name' && styles.activeSortButtonText
                ]}>
                  Name
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortButton,
                  tempFilters.sortBy === 'createdAt' && styles.activeSortButton
                ]}
                onPress={() => updateFilter('sortBy', 
                  tempFilters.sortBy === 'createdAt' ? undefined : 'createdAt'
                )}
              >
                <Text style={[
                  styles.sortButtonText,
                  tempFilters.sortBy === 'createdAt' && styles.activeSortButtonText
                ]}>
                  Joined Date
                </Text>
              </TouchableOpacity>
            </View>

            {tempFilters.sortBy && (
              <View style={styles.sortRow}>
                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    tempFilters.sortOrder === 'asc' && styles.activeSortButton
                  ]}
                  onPress={() => updateFilter('sortOrder', 'asc')}
                >
                  <Text style={[
                    styles.sortButtonText,
                    tempFilters.sortOrder === 'asc' && styles.activeSortButtonText
                  ]}>
                    Ascending
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    tempFilters.sortOrder === 'desc' && styles.activeSortButton
                  ]}
                  onPress={() => updateFilter('sortOrder', 'desc')}
                >
                  <Text style={[
                    styles.sortButtonText,
                    tempFilters.sortOrder === 'desc' && styles.activeSortButtonText
                  ]}>
                    Descending
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {Object.keys(tempFilters).length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.applyButton, { flex: Object.keys(tempFilters).length > 0 ? 2 : 1 }]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
const styles = StyleSheet.create({

  
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 48,
  },
  dropdownButtonOpen: {
    borderColor: theme.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textPrimary,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: theme.textSecondary,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownList: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.primary,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScroll: {
    maxHeight: 160,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedOption: {
    backgroundColor: '#EEF2FF',
  },
  dropdownOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  selectedOptionText: {
    color: theme.primary,
    fontWeight: '600',
  },
  clearOptionText: {
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  activeSortButton: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  activeSortButtonText: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    color: theme.textPrimary,
    minHeight: 48,
  },
  suggestionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeSuggestionChip: {
    backgroundColor: '#EEF2FF',
    borderColor: theme.primary,
  },
  suggestionChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeSuggestionChipText: {
    color: theme.primary,
    fontWeight: '600',
  },
  pickerStyle: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
  },
  pickerDropDownContainerStyle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  pickerPlaceholderStyle: {
    color: '#4A5568',
    fontWeight: '500',
  },
  pickerDisabled: {
    backgroundColor: '#F1F5F9',
  },
  pickerTextStyle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  pickerSearchStyle: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 },
});