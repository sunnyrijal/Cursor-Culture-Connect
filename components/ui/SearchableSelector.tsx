import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { Search, Plus, X, Check } from 'lucide-react-native';

interface SearchableSelectorProps {
  title: string;
  placeholder: string;
  selectedItems: string[];
  availableItems: string[];
  maxItems: number;
  onItemsChange: (items: string[]) => void;
  variant?: 'primary' | 'secondary';
}

export function SearchableSelector({
  title,
  placeholder,
  selectedItems,
  availableItems,
  maxItems,
  onItemsChange,
  variant = 'primary'
}: SearchableSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEntry, setCustomEntry] = useState('');

  // Enhanced search with fuzzy matching and common misspellings
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    
    // Common misspellings and variations map
    const commonVariations: Record<string, string[]> = {
      'chinese': ['chineese', 'chinease', 'chines'],
      'japanese': ['japaneese', 'japanease', 'japanes'],
      'korean': ['corean', 'koreean'],
      'vietnamese': ['vietnameese', 'viet'],
      'filipino': ['philipino', 'phillipino', 'pilipino'],
      'indian': ['indain', 'hindustani'],
      'pakistani': ['pakastani', 'pakistaani'],
      'bangladeshi': ['bengali', 'bangla'],
      'mexican': ['mejican', 'mexicano'],
      'spanish': ['espanol', 'hispanic'],
      'portuguese': ['portugese', 'brazilian'],
      'italian': ['italiano', 'italain'],
      'german': ['deutsch', 'germain'],
      'french': ['francais', 'frensh'],
      'russian': ['rusian', 'rossian'],
      'arabic': ['arab', 'arabian'],
      'hebrew': ['jewish', 'israeli'],
      'swahili': ['kiswahili', 'swahilli'],
      'mandarin': ['chinese mandarin', 'putonghua'],
      'cantonese': ['chinese cantonese', 'guangdong'],
      'hindi': ['hindustani', 'devanagari'],
      'urdu': ['hindustani urdu'],
      'punjabi': ['panjabi', 'gurmukhi'],
      'bengali': ['bangla', 'bangladeshi'],
      'tamil': ['tamizh'],
      'telugu': ['andhra'],
      'gujarati': ['gujrati'],
      'marathi': ['maharashtrian']
    };

    // Create reverse mapping for variations
    const variationMap: Record<string, string> = {};
    Object.entries(commonVariations).forEach(([correct, variations]) => {
      variations.forEach(variation => {
        variationMap[variation] = correct;
      });
    });

    // Normalize query (handle common misspellings)
    const normalizedQuery = variationMap[query] || query;

    const results = availableItems.filter(item => {
      const itemLower = item.toLowerCase();
      
      // Exact match
      if (itemLower === normalizedQuery) return true;
      
      // Starts with match
      if (itemLower.startsWith(normalizedQuery)) return true;
      
      // Contains match
      if (itemLower.includes(normalizedQuery)) return true;
      
      // Word boundary match
      const words = itemLower.split(/[\s-_]/);
      if (words.some(word => word.startsWith(normalizedQuery))) return true;
      
      // Check if any variations match
      const variations = commonVariations[itemLower] || [];
      if (variations.some(variation => 
        variation.includes(normalizedQuery) || normalizedQuery.includes(variation)
      )) return true;
      
      // Fuzzy match for typos (simple Levenshtein-like)
      if (normalizedQuery.length > 2 && itemLower.length > 2) {
        const similarity = calculateSimilarity(normalizedQuery, itemLower);
        if (similarity > 0.7) return true;
      }
      
      return false;
    });

    // Sort results by relevance
    return results.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Exact matches first
      if (aLower === normalizedQuery && bLower !== normalizedQuery) return -1;
      if (bLower === normalizedQuery && aLower !== normalizedQuery) return 1;
      
      // Starts with matches next
      const aStarts = aLower.startsWith(normalizedQuery);
      const bStarts = bLower.startsWith(normalizedQuery);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;
      
      // Then by length (shorter first)
      return a.length - b.length;
    }).slice(0, 8); // Limit to 8 results
  }, [searchQuery, availableItems]);

  // Simple similarity calculation
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleAddItem = (item: string) => {
    if (selectedItems.length >= maxItems) {
      Alert.alert('Limit Reached', `You can only select up to ${maxItems} items.`);
      return;
    }
    
    if (!selectedItems.includes(item)) {
      onItemsChange([...selectedItems, item]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveItem = (item: string) => {
    onItemsChange(selectedItems.filter(i => i !== item));
  };

  const handleAddCustom = () => {
    const trimmedEntry = customEntry.trim();
    
    if (!trimmedEntry) {
      Alert.alert('Error', 'Please enter a valid entry.');
      return;
    }
    
    if (selectedItems.length >= maxItems) {
      Alert.alert('Limit Reached', `You can only select up to ${maxItems} items.`);
      return;
    }
    
    if (selectedItems.includes(trimmedEntry)) {
      Alert.alert('Already Added', 'This item is already in your list.');
      return;
    }
    
    // Check if it's similar to existing options
    const similarItem = availableItems.find(item => 
      item.toLowerCase() === trimmedEntry.toLowerCase()
    );
    
    if (similarItem) {
      Alert.alert(
        'Similar Item Found',
        `Did you mean "${similarItem}"? This is already available in our list.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: `Use "${similarItem}"`, 
            onPress: () => {
              handleAddItem(similarItem);
              setCustomEntry('');
              setShowCustomForm(false);
            }
          },
          { 
            text: 'Add Custom Anyway', 
            onPress: () => {
              onItemsChange([...selectedItems, `${trimmedEntry} (Custom)`]);
              setCustomEntry('');
              setShowCustomForm(false);
              Alert.alert(
                'Custom Entry Added',
                'Your custom entry has been added for personal use only. It will not be visible to other users in search filters.'
              );
            }
          }
        ]
      );
      return;
    }
    
    // Add custom entry
    onItemsChange([...selectedItems, `${trimmedEntry} (Custom)`]);
    setCustomEntry('');
    setShowCustomForm(false);
    
    Alert.alert(
      'Custom Entry Added',
      'Your custom entry has been added for personal use only. It will not be visible to other users in search filters.'
    );
  };

  const hasResults = searchResults.length > 0;
  const noResults = searchQuery.trim().length > 0 && !hasResults;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{title} * (Max {maxItems})</Text>
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={16} color={theme.gray400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={theme.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowDropdown(true)}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setShowDropdown(false);
              }}
              style={styles.clearButton}
            >
              <X size={16} color={theme.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Dropdown */}
      {showDropdown && (searchQuery.length > 0 || hasResults) && (
        <Card style={styles.dropdown}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
            {hasResults ? (
              <>
                <Text style={styles.dropdownHeader}>Suggestions</Text>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.dropdownOption,
                      selectedItems.includes(item) && styles.dropdownOptionSelected
                    ]}
                    onPress={() => handleAddItem(item)}
                    disabled={selectedItems.includes(item)}
                  >
                    <Text style={[
                      styles.dropdownOptionText,
                      selectedItems.includes(item) && styles.dropdownOptionTextSelected
                    ]}>
                      {item}
                    </Text>
                    {selectedItems.includes(item) && (
                      <Check size={16} color={theme.success} />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            ) : noResults ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsTitle}>No results found</Text>
                <Text style={styles.noResultsText}>
                  We couldn't find "{searchQuery}" in our database.
                </Text>
                <Button
                  title="Add Custom"
                  variant="outline"
                  onPress={() => {
                    setCustomEntry(searchQuery);
                    setShowCustomForm(true);
                    setShowDropdown(false);
                  }}
                  size="sm"
                  style={styles.addCustomButton}
                />
              </View>
            ) : null}
          </ScrollView>
        </Card>
      )}

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>Selected ({selectedItems.length}/{maxItems})</Text>
          <View style={styles.selectedItems}>
            {selectedItems.map((item, index) => (
              <View key={index} style={styles.selectedItem}>
                <Badge 
                  label={item}
                  variant={variant}
                  size="sm"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item)}
                  style={styles.removeButton}
                >
                  <X size={12} color={theme.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Custom Entry Form */}
      {showCustomForm && (
        <Card style={styles.customForm}>
          <Text style={styles.customFormTitle}>Add Custom Entry</Text>
          <Text style={styles.customFormSubtitle}>
            Add your own {title.toLowerCase()} if it's not in our list
          </Text>
          
          <TextInput
            style={styles.customInput}
            placeholder={`Enter custom ${title.toLowerCase().slice(0, -1)}`}
            value={customEntry}
            onChangeText={setCustomEntry}
            autoCapitalize="words"
            autoFocus
          />
          
          <Text style={styles.customFormNote}>
            Note: Custom entries are for personal use only and won't appear in public search filters.
          </Text>
          
          <View style={styles.customFormActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                setShowCustomForm(false);
                setCustomEntry('');
              }}
              style={styles.customFormButton}
              size="sm"
            />
            <Button
              title="Add Custom"
              onPress={handleAddCustom}
              style={styles.customFormButton}
              size="sm"
            />
          </View>
        </Card>
      )}

      {/* Quick Add Button */}
      {!showDropdown && !showCustomForm && selectedItems.length < maxItems && (
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => setShowDropdown(true)}
        >
          <Plus size={16} color={theme.primary} />
          <Text style={styles.quickAddText}>
            Add {title.slice(0, -1)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.sm,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.md,
    backgroundColor: theme.white,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textPrimary,
  },
  clearButton: {
    padding: spacing.xs,
  },
  dropdown: {
    marginTop: spacing.sm,
    maxHeight: 250,
    zIndex: 1000,
  },
  dropdownScroll: {
    maxHeight: 230,
  },
  dropdownHeader: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  dropdownOptionSelected: {
    backgroundColor: theme.gray50,
  },
  dropdownOptionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textPrimary,
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: theme.success,
    fontFamily: typography.fontFamily.medium,
  },
  noResults: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  noResultsText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  addCustomButton: {
    alignSelf: 'center',
  },
  selectedContainer: {
    marginTop: spacing.md,
  },
  selectedLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.textSecondary,
    marginBottom: spacing.sm,
  },
  selectedItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  selectedItem: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customForm: {
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  customFormTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  customFormSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    marginBottom: spacing.md,
  },
  customInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textPrimary,
    backgroundColor: theme.white,
    marginBottom: spacing.md,
  },
  customFormNote: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: theme.warning,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  customFormActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  customFormButton: {
    flex: 1,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: theme.primary,
    borderStyle: 'dashed',
    backgroundColor: theme.white,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  quickAddText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.primary,
  },
});