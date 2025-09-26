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
import { X, Filter } from 'lucide-react-native';
import Checkbox from 'expo-checkbox';
import { theme } from '@/components/theme';
import { EventFilters } from '@/contexts/event.api';



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

  React.useEffect(() => {
    // When the modal is opened, sync the temp state with the external state
    if (visible) {
      setTempFilters(filters);
    }
  }, [visible, filters]);

  const updateFilter = (key: keyof EventFilters, value: any) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setTempFilters({});
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    onApply();
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
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
              onPress={() => updateFilter('ofMyUniversity', !filters.ofMyUniversity)}
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
              onPress={() => updateFilter('myGroups', !filters.myGroups)}
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
});