// components/EventFilterModal.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronDown } from 'lucide-react-native';
import Checkbox from 'expo-checkbox';
import { useQuery } from '@tanstack/react-query';
import DropDownPicker from 'react-native-dropdown-picker';
import { theme } from '@/components/theme';
import { EventFilters } from '@/contexts/event.api';
import { getUniversities } from '@/contexts/university.api';
import statesData from '../data/US_States_list.json';
import citiesData from '../data/US_Cities.json';


interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onApply: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
  onApply,
}) => {
  const [tempFilters, setTempFilters] = React.useState<EventFilters>(filters);
  
  // Dropdown states
  const [universityOpen, setUniversityOpen] = React.useState(false);
  const [stateOpen, setStateOpen] = React.useState(false);
  const [cityOpen, setCityOpen] = React.useState(false);
  const [locationExpanded, setLocationExpanded] = React.useState(false);
  
  const [universityItems, setUniversityItems] = React.useState<Array<{label: string; value: string}>>([]);
  const [stateItems, setStateItems] = React.useState<Array<{label: string; value: string}>>([]);
  const [cityItems, setCityItems] = React.useState<Array<{label: string; value: string}>>([]);

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: getUniversities,
  });

  React.useEffect(() => {
    if (universities?.data) {
      const uniItems = universities.data.map((uni: any) => ({
        label: uni.name,
        value: uni.id,
      }));
      setUniversityItems(uniItems);
    }
  }, [universities]);

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

  const updateFilter = (key: keyof EventFilters, value: any) => {
    setTempFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
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
          <Text style={styles.title}>Filter Events</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* University and Groups Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Source</Text>
            
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateFilter('ofMyUniversity', !tempFilters.ofMyUniversity)}
            >
              <Checkbox
                style={styles.checkbox}
                value={tempFilters.ofMyUniversity || false}
                onValueChange={(value) => updateFilter('ofMyUniversity', value)}
                color={tempFilters.ofMyUniversity ? theme.primary : undefined}
              />
              <Text style={styles.checkboxLabel}>My University Only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateFilter('myGroups', !tempFilters.myGroups)}
            >
              <Checkbox
                style={styles.checkbox}
                value={tempFilters.myGroups || false}
                onValueChange={(value) => updateFilter('myGroups', value)}
                color={tempFilters.myGroups ? theme.primary : undefined}
              />
              <Text style={styles.checkboxLabel}>My Groups Only</Text>
            </TouchableOpacity>
          </View>

          {/* University Filter */}
          <View style={[styles.section, { zIndex: 3000 }]}>
            <Text style={styles.sectionTitle}>University</Text>
            <DropDownPicker
              open={universityOpen}
              value={tempFilters.universityId || null}
              items={universityItems}
              setOpen={setUniversityOpen}
              setValue={(callback) => {
                const newValue = typeof callback === 'function' ? callback(tempFilters.universityId || null) : callback;
                updateFilter('universityId', newValue);
              }}
              setItems={setUniversityItems}
              placeholder="Select a university"
              searchable={true}
              searchPlaceholder="Search universities..."
              listMode="MODAL"
              modalProps={{ animationType: 'slide' }}
              style={styles.pickerStyle}
              dropDownContainerStyle={styles.pickerDropDownContainerStyle}
              textStyle={styles.pickerTextStyle}
              placeholderStyle={styles.pickerPlaceholderStyle}
              searchTextInputStyle={styles.pickerSearchStyle}
              ArrowDownIconComponent={() => <ChevronDown size={20} color="#9CA3AF" />}
              ArrowUpIconComponent={() => <ChevronDown size={20} color="#9CA3AF" style={{ transform: [{ rotate: '180deg' }] }} />}
              zIndex={3000}
              zIndexInverse={1000}
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
                    modalProps={{ animationType: 'slide' }}
                    style={styles.pickerStyle}
                    dropDownContainerStyle={styles.pickerDropDownContainerStyle}
                    textStyle={styles.pickerTextStyle}
                    placeholderStyle={styles.pickerPlaceholderStyle}
                    searchTextInputStyle={styles.pickerSearchStyle}
                    ArrowDownIconComponent={() => <ChevronDown size={20} color="#9CA3AF" />}
                    ArrowUpIconComponent={() => <ChevronDown size={20} color="#9CA3AF" style={{ transform: [{ rotate: '180deg' }] }} />}
                    zIndex={2000}
                    zIndexInverse={2000}
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
                    modalProps={{ animationType: 'slide' }}
                    style={[styles.pickerStyle, !tempFilters.state && styles.pickerDisabled]}
                    dropDownContainerStyle={styles.pickerDropDownContainerStyle}
                    textStyle={styles.pickerTextStyle}
                    placeholderStyle={styles.pickerPlaceholderStyle}
                    searchTextInputStyle={styles.pickerSearchStyle}
                    ArrowDownIconComponent={() => <ChevronDown size={20} color="#9CA3AF" />}
                    ArrowUpIconComponent={() => <ChevronDown size={20} color="#9CA3AF" style={{ transform: [{ rotate: '180deg' }] }} />}
                    zIndex={1000}
                    zIndexInverse={3000}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Time Frame Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time Frame</Text>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempFilters.timeFrame === 'thisWeek' && styles.activeOption
              ]}
              onPress={() => updateFilter('timeFrame', 
                tempFilters.timeFrame === 'thisWeek' ? undefined : 'thisWeek'
              )}
            >
              <Text style={[
                styles.optionText,
                tempFilters.timeFrame === 'thisWeek' && styles.activeOptionText
              ]}>
                This Week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                tempFilters.timeFrame === 'thisMonth' && styles.activeOption
              ]}
              onPress={() => updateFilter('timeFrame', 
                tempFilters.timeFrame === 'thisMonth' ? undefined : 'thisMonth'
              )}
            >
              <Text style={[
                styles.optionText,
                tempFilters.timeFrame === 'thisMonth' && styles.activeOptionText
              ]}>
                This Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            
            <View style={styles.sortRow}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  tempFilters.sortBy === 'date' && styles.activeSortButton
                ]}
                onPress={() => updateFilter('sortBy', 
                  tempFilters.sortBy === 'date' ? undefined : 'date'
                )}
              >
                <Text style={[
                  styles.sortButtonText,
                  tempFilters.sortBy === 'date' && styles.activeSortButtonText
                ]}>
                  Date
                </Text>
              </TouchableOpacity>

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
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeOption: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  activeOptionText: {
    color: 'white',
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
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
});