// Create this as a new file: components/GroupFilterModal.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getUniversities } from '@/contexts/university.api';
import Checkbox from 'expo-checkbox';

const theme = {
  primary: '#667EEA',
  textPrimary: '#2D3748',
  textSecondary: '#4A5568',
};

interface GroupFilters {
  myUniversity?: boolean;
  privacy?: 'private' | 'public';
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  universityId?: string;
}

interface GroupFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: GroupFilters;
  onFiltersChange: (filters: GroupFilters) => void;
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

  const selectedOption = options.find((option) => option.id === selectedValue);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownTitle}>{title}</Text>

      <TouchableOpacity
        style={[styles.dropdownButton, isOpen && styles.dropdownButtonOpen]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            !selectedOption && styles.dropdownPlaceholder,
          ]}
        >
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
                  selectedValue === option.id && styles.selectedOption,
                ]}
                onPress={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedValue === option.id && styles.selectedOptionText,
                  ]}
                >
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

export const GroupFilterModal: React.FC<GroupFilterModalProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
  onApply,
}) => {
  const [tempFilters, setTempFilters] = React.useState<GroupFilters>(filters);

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: getUniversities,
  });

  const universityOptions = React.useMemo(() => {
    if (!universities?.data) return [];
    return universities.data.map((uni: any) => ({
      id: uni.id,
      name: uni.name,
    }));
  }, [universities]);

  React.useEffect(() => {
    // When the modal is opened, sync the temp state with the external state
    if (visible) {
      setTempFilters(filters);
    }
  }, [visible, filters]);

  const updateFilter = (key: keyof GroupFilters, value: any) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter Groups</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* University Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Source</Text>
            
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

          {/* Privacy Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempFilters.privacy === 'public' && styles.activeOption
              ]}
              onPress={() => updateFilter('privacy', 
                tempFilters.privacy === 'public' ? undefined : 'public'
              )}
            >
              <Text style={[
                styles.optionText,
                tempFilters.privacy === 'public' && styles.activeOptionText
              ]}>
                Public Groups Only
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                tempFilters.privacy === 'private' && styles.activeOption
              ]}
              onPress={() => updateFilter('privacy', 
                tempFilters.privacy === 'private' ? undefined : 'private'
              )}
            >
              <Text style={[
                styles.optionText,
                tempFilters.privacy === 'private' && styles.activeOptionText
              ]}>
                Private Groups Only
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
                  Created Date
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
      </View>
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
});