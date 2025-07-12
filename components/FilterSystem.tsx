import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { 
  Filter, 
  MapPin,       // For 'Filter by State'
  GraduationCap, // For 'My University'
  Globe,        // For 'All'
  Search, 
  X, 
  Check, 
  RotateCcw,
  Bookmark,     // For 'My Heritage'
  Users,        // For 'Public/Private'
  Lock,         // For 'Private'
  BookOpen      // For 'By Major'
} from 'lucide-react-native'; 
import { theme, spacing, typography, borderRadius } from './theme';
// Removed heritageOptions and languageOptions as heritage and categories filters are removed
// Removed SearchableSelector as categories filter is removed

interface FilterOptions {
  location: {
    country: string;
    state: string;
    city: string;
  };
  university: string;
  filterBy: 'all' | 'public' | 'private' | 'my-university' | 'my-heritage' | 'filter-by-state';
  ethnicity: string[];
  selectedUniversity: string;
}

interface FilterSystemProps {
  onFiltersChange: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
  contentType: 'events' | 'groups' | 'users';
  showPresets?: boolean;
}

// Country: Only United States
const countries = [
  'United States'
];

const usStates = [
  'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania',
  'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia',
  'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri',
  'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama'
];

const universities = [
  'Stanford University', 'Harvard University', 'MIT', 'University of California, Berkeley',
  'UCLA', 'Columbia University', 'University of Chicago', 'Yale University',
  'Princeton University', 'University of Pennsylvania', 'Northwestern University',
  'Duke University', 'Johns Hopkins University', 'Cornell University', 'Brown University',
  'University of Michigan', 'University of Toronto', 'Oxford University', 'Cambridge University'
];

// Ethnicity options for groups
const ethnicityOptions = [
  'South Asian', 'East Asian', 'Hispanic/Latino', 'African American', 'Middle Eastern',
  'European', 'Pacific Islander', 'Native American', 'Mixed Heritage', 'International'
];

// categoryOptions array removed as categories filter is removed

// Define user-specific filter options
const filterByUserOptions = [
  { id: 'all', label: 'All People', icon: Globe, description: 'Show all people everywhere' },
  { id: 'my-university', label: 'My University', icon: GraduationCap, description: 'People from your university only' },
  { id: 'my-heritage', label: 'My Heritage', icon: Bookmark, description: 'People who share your heritage (from profile)' },
  { id: 'filter-by-state', label: 'By State', icon: MapPin, description: 'Filter by specific state and city' },
  { id: 'by-major', label: 'By Major', icon: BookOpen, description: 'Filter by major/field of study' },
  { id: 'by-language', label: 'By Language', icon: Globe, description: 'Filter by spoken language' },
];

const filterByOptions = [
  { id: 'all', label: 'All Groups', icon: Globe, description: 'Show all groups everywhere' },
  { id: 'public', label: 'Public Only', icon: Users, description: 'Show only public groups' },
  { id: 'private', label: 'Private Only', icon: Lock, description: 'Show only private groups' },
  { id: 'my-university', label: 'My University', icon: GraduationCap, description: 'Groups from your university only' },
  { id: 'my-heritage', label: 'My Heritage', icon: Bookmark, description: 'Groups related to your heritage (from profile)' },
  { id: 'filter-by-state', label: 'Filter by State', icon: MapPin, description: 'Filter by specific state and city' },
];

const filterByEventOptions = [
  { id: 'all', label: 'All Events', icon: Globe, description: 'Show all events everywhere' },
  { id: 'my-university', label: 'My University', icon: GraduationCap, description: 'Events from your university only' },
  { id: 'my-heritage', label: 'My Heritage', icon: Bookmark, description: 'Events related to your heritage (from profile)' },
  { id: 'filter-by-state', label: 'Filter by State', icon: MapPin, description: 'Filter by specific state and city' },
];

export function FilterSystem({ 
  onFiltersChange, 
  initialFilters = {}, 
  contentType,
  showPresets = true 
}: FilterSystemProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: {
      country: '',
      state: '',
      city: ''
    },
    university: '',
    filterBy: 'all',
    ethnicity: [],
    selectedUniversity: '',
    ...initialFilters
  });

  const [searchQueries, setSearchQueries] = useState({
    university: '',
    city: '',
    ethnicity: '',
    major: '', // Added for 'By Major'
    language: '' // Added for 'By Language'
  });

  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [savedPresets, setSavedPresets] = useState<{ name: string; filters: FilterOptions }[]>(() => {
    if (contentType === 'events') {
      return [
        {
          name: 'My University Events',
          filters: {
            location: { country: '', state: '', city: '' },
            university: 'Stanford University',
            filterBy: 'my-university',
            ethnicity: [],
            selectedUniversity: ''
          }
        },
        {
          name: 'Cultural Events',
          filters: {
            location: { country: '', state: '', city: '' },
            university: '',
            filterBy: 'all',
            ethnicity: ['Cultural'],
            selectedUniversity: ''
          }
        },
        {
          name: 'Local Events',
          filters: {
            location: { country: 'United States', state: 'California', city: '' },
            university: '',
            filterBy: 'filter-by-state',
            ethnicity: [],
            selectedUniversity: ''
          }
        }
      ];
    } else {
      return [
        {
          name: 'My University',
          filters: {
            location: { country: '', state: '', city: '' },
            university: 'Stanford University',
            filterBy: 'my-university',
            ethnicity: [],
            selectedUniversity: ''
          }
        },
        {
          name: 'Public Groups',
          filters: {
            location: { country: '', state: '', city: '' },
            university: '',
            filterBy: 'all',
            ethnicity: [],
            selectedUniversity: ''
          }
        },
        {
          name: 'South Asian Groups',
          filters: {
            location: { country: '', state: '', city: '' },
            university: '',
            filterBy: 'all',
            ethnicity: ['South Asian'],
            selectedUniversity: ''
          }
        }
      ];
    }
  });

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.location.country && filters.filterBy === 'filter-by-state') count++;
    if (filters.location.state && filters.filterBy === 'filter-by-state') count++;
    if (filters.location.city && filters.filterBy === 'filter-by-state') count++;
    if (filters.university && filters.filterBy === 'my-university') count++;
    if (filters.filterBy !== 'all') count++;
    if (filters.ethnicity.length > 0) count++;
    if (filters.selectedUniversity) count++;
    
    setActiveFilterCount(count);
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...updates,
      location: updates.location ? { ...prev.location, ...updates.location } : prev.location
    }));
  };

  const resetFilters = () => {
    const resetFilters: FilterOptions = {
      location: { country: '', state: '', city: '' },
      university: '',
      filterBy: 'all',
      ethnicity: [],
      selectedUniversity: ''
    };
    setFilters(resetFilters);
    setSearchQueries({ university: '', city: '', ethnicity: '', major: '', language: '' });
  };

  const applyPreset = (preset: { name: string; filters: FilterOptions }) => {
    setFilters(preset.filters);
    setIsModalVisible(false);
  };

  const saveCurrentAsPreset = () => {
    const presetName = `Custom ${savedPresets.length + 1}`;
    setSavedPresets(prev => [...prev, { name: presetName, filters }]);
  };

  const toggleArrayFilter = (array: string[], value: string): string[] => {
    if (array.includes(value)) {
      return array.filter(item => item !== value);
    } else {
      return [...array, value];
    }
  };

  const getFilteredOptions = (options: string[], searchQuery: string) => {
    return options.filter(option =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getActiveFiltersText = () => {
    const activeFilters = [];
    if (filters.filterBy === 'my-university') activeFilters.push('My University');
    else if (filters.filterBy === 'my-heritage') activeFilters.push('My Heritage');
    else if (filters.filterBy === 'filter-by-state') {
      activeFilters.push('Filter by State');
      if (filters.location.state) activeFilters.push(filters.location.state);
      if (filters.location.city) activeFilters.push(filters.location.city);
    } else if (filters.filterBy === 'all') activeFilters.push('All');
    
    if (filters.ethnicity.length > 0) {
      if (filters.ethnicity.length === 1) {
        activeFilters.push(filters.ethnicity[0]);
      } else {
        activeFilters.push(`${filters.ethnicity.length} ethnicities`);
      }
    }
    
    if (filters.selectedUniversity) {
      activeFilters.push(filters.selectedUniversity);
    }
    
    if (activeFilters.length === 0) return 'All Content';
    if (activeFilters.length === 1) return activeFilters[0];
    return `${activeFilters.length} filters active`;
  };

  return (
    <View style={styles.container}>
      {/* Filter Trigger Button */}
      <TouchableOpacity
        style={[styles.filterTrigger, activeFilterCount > 0 && styles.filterTriggerActive]}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Filter size={18} color={activeFilterCount > 0 ? theme.white : theme.primary} />
        <Text style={[
          styles.filterTriggerText,
          activeFilterCount > 0 && styles.filterTriggerTextActive
        ]}>
          {getActiveFiltersText()}
        </Text>
        {activeFilterCount > 0 && (
          <View style={styles.filterCount}>
            <Text style={styles.filterCountText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Quick Reset Button */}
      {activeFilterCount > 0 && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetFilters}
          activeOpacity={0.7}
        >
          <RotateCcw size={16} color={theme.gray500} />
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter {contentType}</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color={theme.gray500} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Saved Presets */}
            {showPresets && contentType !== 'users' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Filters</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.presetsContainer}>
                    {savedPresets.map((preset, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.presetChip}
                        onPress={() => applyPreset(preset)}
                        activeOpacity={0.7}
                      >
                        <Bookmark size={14} color={theme.primary} />
                        <Text style={styles.presetChipText}>{preset.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Filter By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter By</Text>
              <View style={styles.filterByOptions}>
                {(contentType === 'users' ? filterByUserOptions : 
                  contentType === 'events' ? filterByEventOptions : filterByOptions).map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterByOption,
                      filters.filterBy === option.id && styles.filterByOptionActive
                    ]}
                    onPress={() => {
                      setFilters(prev => ({
                        ...prev,
                        filterBy: option.id as any,
                        // Reset location if not filter-by-state
                        location: option.id !== 'filter-by-state' ? { country: '', state: '', city: '' } : prev.location,
                        // Reset university if not my-university
                        university: option.id !== 'my-university' ? '' : prev.university,
                      }));
                    }}
                    activeOpacity={0.7}
                  >
                    <option.icon size={20} color={filters.filterBy === option.id ? theme.white : theme.primary} />
                    <View style={styles.filterByOptionContent}>
                      <Text style={[
                        styles.filterByOptionTitle,
                        filters.filterBy === option.id && styles.filterByOptionTitleActive
                      ]}>{option.label}</Text>
                      <Text style={[
                        styles.filterByOptionDesc,
                        filters.filterBy === option.id && styles.filterByOptionDescActive
                      ]}>{option.description}</Text>
                    </View>
                    {filters.filterBy === option.id && (
                      <Check size={16} color={theme.white} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* University Filter - Only for groups and events, skip for users */}
            {(contentType === 'groups' || contentType === 'events') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>University</Text>
                <View style={styles.searchContainer}>
                  <Search size={16} color={theme.gray400} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search universities..."
                    value={searchQueries.university}
                    onChangeText={(text) => setSearchQueries(prev => ({ ...prev, university: text }))}
                    placeholderTextColor={theme.gray400}
                  />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.optionsContainer}>
                    {getFilteredOptions(universities, searchQueries.university).map((university) => (
                      <TouchableOpacity
                        key={university}
                        style={[
                          styles.optionChip,
                          filters.selectedUniversity === university && styles.optionChipActive
                        ]}
                        onPress={() => updateFilters({
                          selectedUniversity: filters.selectedUniversity === university ? '' : university
                        })}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.optionChipText,
                          filters.selectedUniversity === university && styles.optionChipTextActive
                        ]}>
                          {university}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Location Filters - Only visible if 'Filter by State' is selected */}
            {filters.filterBy === 'filter-by-state' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location Details</Text>
                
                {/* Country */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Country</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.optionsContainer}>
                      {countries.map((country) => (
                        <TouchableOpacity
                          key={country}
                          style={[
                            styles.optionChip,
                            filters.location.country === country && styles.optionChipActive
                          ]}
                          onPress={() => updateFilters({
                            location: { 
                              country: filters.location.country === country ? '' : country,
                              state: '',
                              city: ''
                            }
                          })}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.optionChipText,
                            filters.location.country === country && styles.optionChipTextActive
                          ]}>
                            {country}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* State (US only) */}
                {filters.location.country === 'United States' && (
                  <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>State</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.optionsContainer}>
                        {usStates.map((state) => (
                          <TouchableOpacity
                            key={state}
                            style={[
                              styles.optionChip,
                              filters.location.state === state && styles.optionChipActive
                            ]}
                            onPress={() => updateFilters({
                              location: { 
                                ...filters.location,
                                state: filters.location.state === state ? '' : state,
                                city: ''
                              }
                            })}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.optionChipText,
                              filters.location.state === state && styles.optionChipTextActive
                            ]}>
                              {state}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* City */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>City</Text>
                  <View style={styles.searchContainer}>
                    <Search size={16} color={theme.gray400} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Enter city name"
                      value={filters.location.city}
                      onChangeText={(text) => updateFilters({
                        location: { ...filters.location, city: text }
                      })}
                      placeholderTextColor={theme.gray400}
                    />
                    {filters.location.city ? (
                      <TouchableOpacity
                        onPress={() => updateFilters({
                          location: { ...filters.location, city: '' }
                        })}
                      >
                        <X size={16} color={theme.gray400} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>
            )}

            {/* By Major - Only for users */}
            {contentType === 'users' && filters.filterBy === 'by-major' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Major/Field of Study</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.optionsContainer}>
                    {['Computer Science','Business','Engineering','Medicine','Law','Education','Psychology','Biology','Economics','Political Science','Art','History','Mathematics','Physics','Chemistry','Sociology','Philosophy','Other'].map((major) => (
                      <TouchableOpacity
                        key={major}
                        style={[
                          styles.optionChip,
                          (filters.major === major) && styles.optionChipActive
                        ]}
                        onPress={() => updateFilters({ major: filters.major === major ? '' : major })}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.optionChipText,
                          (filters.major === major) && styles.optionChipTextActive
                        ]}>{major}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* By Language - Only for users */}
            {contentType === 'users' && filters.filterBy === 'by-language' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Language</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.optionsContainer}>
                    {['English','Mandarin','Spanish','Hindi','Arabic','French','German','Japanese','Korean','Russian','Portuguese','Vietnamese','Other'].map((lang) => (
                      <TouchableOpacity
                        key={lang}
                        style={[
                          styles.optionChip,
                          (filters.language === lang) && styles.optionChipActive
                        ]}
                        onPress={() => updateFilters({ language: filters.language === lang ? '' : lang })}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.optionChipText,
                          (filters.language === lang) && styles.optionChipTextActive
                        ]}>{lang}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.savePresetButton}
              onPress={saveCurrentAsPreset}
              activeOpacity={0.7}
            >
              <Bookmark size={16} color={theme.primary} />
              <Text style={styles.savePresetButtonText}>Save as Preset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.savePresetButton, { backgroundColor: theme.primary }]}
              onPress={() => setIsModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.savePresetButtonText, { color: theme.white }]}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
    flex: 1,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTriggerActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterTriggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    flex: 1,
  },
  filterTriggerTextActive: {
    color: theme.white,
  },
  filterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    flex: 1,
    backgroundColor: theme.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  presetsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.gray50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  presetChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.textPrimary,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  optionChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  optionChipTextActive: {
    color: theme.white,
  },
  visibilityOptions: {
    gap: 12,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  visibilityOptionActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  visibilityOptionContent: {
    flex: 1,
  },
  visibilityOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  visibilityOptionTitleActive: {
    color: theme.white,
  },
  visibilityOptionDesc: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  visibilityOptionDescActive: {
    color: theme.white,
  },
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  multiSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  multiSelectChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  multiSelectChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  multiSelectChipTextActive: {
    color: theme.white,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 12,
  },
  savePresetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: theme.gray50,
    borderRadius: 12,
    gap: 8,
  },
  savePresetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.info,
  },
  groupTypeOptions: {
    gap: 12,
  },
  groupTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  groupTypeOptionActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  groupTypeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  groupTypeOptionTextActive: {
    color: theme.white,
  },
  filterByOptions: {
    gap: 12,
  },
  filterByOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  filterByOptionActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterByOptionContent: {
    flex: 1,
  },
  filterByOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  filterByOptionTitleActive: {
    color: theme.white,
  },
  filterByOptionDesc: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  filterByOptionDescActive: {
    color: theme.white,
  },
});
