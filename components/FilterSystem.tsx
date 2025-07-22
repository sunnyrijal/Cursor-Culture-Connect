import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from './theme';

export interface FilterOptions {
  location: {
    country: string;
    state: string;
    city: string;
  };
  university: string;
  visibility: 'all' | 'my-university' | 'my-heritage' | 'filter-by-state';
  ethnicity: string[];
  groupType: 'all' | 'public' | 'private';
  selectedUniversity: string;
  filterBy: string;
}

interface FilterSystemProps {
  // Original API
  onFiltersChange?: (filters: FilterOptions) => void;
  contentType?: 'events' | 'groups';
  showPresets?: boolean;
  groupCount?: number;
  filterLabel?: string;
  
  // New simplified API
  categories?: string[];
  activeFilters?: string[];
  setActiveFilters?: (filters: string[]) => void;
}

const DEFAULT_FILTERS: FilterOptions = {
  location: { country: '', state: '', city: '' },
  university: '',
  visibility: 'all',
  ethnicity: [],
  groupType: 'all',
  selectedUniversity: '',
  filterBy: 'all'
};

export function FilterSystem({ 
  onFiltersChange, 
  contentType = 'groups', 
  showPresets = true,
  groupCount,
  filterLabel = 'All',
  // New props
  categories = [],
  activeFilters = [],
  setActiveFilters
}: FilterSystemProps) {
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // For the original filter system
  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.location.state) count++;
    if (filters.location.city) count++;
    if (filters.university) count++;
    if (filters.visibility !== 'all') count++;
    if (filters.ethnicity.length > 0) count++;
    if (filters.groupType !== 'all') count++;
    if (filters.selectedUniversity) count++;
    if (filters.filterBy !== 'all') count++;
    
    setActiveFilterCount(count);
    
    // Only call onFiltersChange if it exists
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    setFilters(current => ({ ...current, ...updates }));
  };
  
  // For the new, simpler filter system
  const handleFilterToggle = useCallback((filter: string) => {
    if (!setActiveFilters) return;
    
    if (filter === 'All') {
      // If "All" is selected, clear all other filters
      setActiveFilters(['All']);
    } else {
      // If any other filter is selected, remove "All" and toggle the filter
      setActiveFilters(prevFilters => {
        const withoutAll = prevFilters.filter(f => f !== 'All');
        
        if (withoutAll.includes(filter)) {
          // If no filters would remain, add back "All"
          const withoutFilter = withoutAll.filter(f => f !== filter);
          return withoutFilter.length ? withoutFilter : ['All'];
        } else {
          return [...withoutAll, filter];
        }
      });
    }
  }, [setActiveFilters]);

  // Simplified filter system when categories are provided
  if (categories.length > 0 && setActiveFilters) {
    return (
      <View style={styles.container}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filtersContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                activeFilters.includes(category) && styles.activeFilter
              ]}
              onPress={() => handleFilterToggle(category)}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  activeFilters.includes(category) && styles.activeFilterText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Original, more complex filter system
  return (
    <View style={styles.container}>
      <View style={styles.filterInfo}>
        <Text style={styles.groupCountText}>
          {filterLabel}{groupCount !== undefined && ` (${groupCount})`}
        </Text>
        <Text style={styles.activeFilterText}>
          {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active` : ''}
        </Text>
      </View>

      {showPresets && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filtersContainer}
        >
          <TouchableOpacity 
            style={[styles.filterChip, filters.filterBy === 'all' && styles.activeFilter]} 
            onPress={() => updateFilters({ filterBy: 'all' })}>
            <Text style={styles.filterChipText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filters.filterBy === 'my-university' && styles.activeFilter]} 
            onPress={() => updateFilters({ filterBy: 'my-university' })}>
            <Text style={styles.filterChipText}>My University</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filters.filterBy === 'my-heritage' && styles.activeFilter]} 
            onPress={() => updateFilters({ filterBy: 'my-heritage' })}>
            <Text style={styles.filterChipText}>My Heritage</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filters.filterBy === 'public' && styles.activeFilter]} 
            onPress={() => updateFilters({ filterBy: 'public' })}>
            <Text style={styles.filterChipText}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filters.filterBy === 'private' && styles.activeFilter]} 
            onPress={() => updateFilters({ filterBy: 'private' })}>
            <Text style={styles.filterChipText}>Private</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  filterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16
  },
  groupCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  activeFilterText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeFilter: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeFilterText: {
    color: 'white',
  },
});
