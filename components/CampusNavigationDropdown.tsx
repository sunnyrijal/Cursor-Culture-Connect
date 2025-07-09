import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { 
  ChevronDown, 
  Calendar, 
  Users, 
  Building, 
  Gift, 
  Star,
  GraduationCap,
  MapPin,
  Clock,
  Award
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#FAFAFA',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray900: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

interface NavigationItem {
  id: string;
  title: string;
  icon: any;
  color: string;
  subcategories?: {
    id: string;
    title: string;
    description: string;
    badge?: string;
  }[];
}

interface CampusNavigationDropdownProps {
  onItemPress?: (itemId: string, subcategoryId?: string) => void;
  onContentChange?: (contentType: string) => void;
}

export function CampusNavigationDropdown({ onItemPress, onContentChange }: CampusNavigationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;

  const navigationItems: NavigationItem[] = [
    {
      id: 'campus-events',
      title: 'Campus Events',
      icon: Calendar,
      color: theme.primary,
      subcategories: [
        {
          id: 'upcoming-events',
          title: 'Upcoming Events',
          description: 'Events happening in the next 2 weeks',
          badge: '12'
        },
        {
          id: 'active-clubs',
          title: 'Active Clubs',
          description: 'Student organizations and clubs',
          badge: '45+'
        },
        {
          id: 'student-organizations',
          title: 'Student Organizations',
          description: 'Official university organizations'
        }
      ]
    },
    {
      id: 'campus-perks',
      title: 'Campus Partners',
      icon: Award,
      color: theme.accent,
      subcategories: [
        {
          id: 'student-discounts',
          title: 'Student Discounts',
          description: 'Exclusive discounts for students',
          badge: 'New'
        },
        {
          id: 'special-offers',
          title: 'Special Offers',
          description: 'Limited time offers and deals'
        },
        {
          id: 'exclusive-deals',
          title: 'Exclusive Deals',
          description: 'Partner discounts and benefits'
        }
      ]
    }
  ];

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(animatedRotation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setExpandedSection(null);
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleItemPress = (itemId: string, subcategoryId?: string) => {
    onItemPress?.(itemId, subcategoryId);
    
    if (subcategoryId) {
      // If it's a subcategory, set the selected content and close dropdown
      setSelectedContent(subcategoryId);
      onContentChange?.(subcategoryId);
      setIsOpen(false);
    } else {
      // If it's a main category, toggle expansion or set content
      if (expandedSection === itemId) {
        // If already expanded, set as selected content
        setSelectedContent(itemId);
        onContentChange?.(itemId);
        setIsOpen(false);
      } else {
        // Otherwise, expand the section
        toggleSection(itemId);
      }
    }
  };

  const rotateInterpolate = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  const getDisplayTitle = () => {
    if (selectedContent) {
      // Find the selected item
      for (const item of navigationItems) {
        if (item.id === selectedContent) {
          return item.title;
        }
        if (item.subcategories) {
          const subcategory = item.subcategories.find(sub => sub.id === selectedContent);
          if (subcategory) {
            return subcategory.title;
          }
        }
      }
    }
    return 'Your Campus';
  };

  return (
    <View style={styles.container}>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={[styles.trigger, isOpen && styles.triggerActive]}
        onPress={toggleDropdown}
        activeOpacity={0.8}
      >
        <Building size={20} color={isOpen ? theme.white : theme.primary} />
        <Text style={[styles.triggerText, isOpen && styles.triggerTextActive]}>
          {getDisplayTitle()}
        </Text>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <ChevronDown size={16} color={isOpen ? theme.white : theme.gray500} />
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown Menu */}
      <Animated.View
        style={[
          styles.dropdown,
          {
            maxHeight,
            opacity: animatedOpacity,
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <View style={styles.dropdownContent}>
          {/* Reset to All Content */}
          {selectedContent && (
            <TouchableOpacity
              style={styles.resetOption}
              onPress={() => {
                setSelectedContent(null);
                onContentChange?.('all');
                setIsOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.resetText}>← Show All Content</Text>
            </TouchableOpacity>
          )}

          {navigationItems.map((item) => (
            <View key={item.id} style={styles.menuSection}>
              {/* Main Category */}
              <TouchableOpacity
                style={[
                  styles.mainCategory,
                  expandedSection === item.id && styles.mainCategoryExpanded,
                  selectedContent === item.id && styles.mainCategorySelected
                ]}
                onPress={() => handleItemPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryLeft}>
                  <View style={[
                    styles.categoryIcon, 
                    { backgroundColor: expandedSection === item.id || selectedContent === item.id ? 'rgba(255,255,255,0.2)' : `${item.color}15` }
                  ]}>
                    <item.icon 
                      size={18} 
                      color={expandedSection === item.id || selectedContent === item.id ? theme.white : item.color} 
                    />
                  </View>
                  <Text style={[
                    styles.categoryTitle,
                    (expandedSection === item.id || selectedContent === item.id) && styles.categoryTitleExpanded
                  ]}>
                    {item.title}
                  </Text>
                </View>
                <ChevronDown 
                  size={14} 
                  color={(expandedSection === item.id || selectedContent === item.id) ? theme.white : theme.gray400}
                  style={{
                    transform: [{ 
                      rotate: expandedSection === item.id ? '180deg' : '0deg' 
                    }]
                  }}
                />
              </TouchableOpacity>

              {/* Subcategories */}
              {expandedSection === item.id && item.subcategories && (
                <View style={styles.subcategoriesContainer}>
                  {item.subcategories.map((subcategory, index) => (
                    <TouchableOpacity
                      key={subcategory.id}
                      style={[
                        styles.subcategory,
                        selectedContent === subcategory.id && styles.subcategorySelected,
                        index === item.subcategories!.length - 1 && styles.lastSubcategory
                      ]}
                      onPress={() => handleItemPress(item.id, subcategory.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.subcategoryContent}>
                        <View style={styles.subcategoryHeader}>
                          <Text style={[
                            styles.subcategoryTitle,
                            selectedContent === subcategory.id && styles.subcategoryTitleSelected
                          ]}>
                            {subcategory.title}
                          </Text>
                          {subcategory.badge && (
                            <View style={[
                              styles.badge,
                              { backgroundColor: subcategory.badge === 'New' ? theme.accent : item.color }
                            ]}>
                              <Text style={styles.badgeText}>{subcategory.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[
                          styles.subcategoryDescription,
                          selectedContent === subcategory.id && styles.subcategoryDescriptionSelected
                        ]}>
                          {subcategory.description}
                        </Text>
                      </View>
                      <View style={[
                        styles.subcategoryIndicator,
                        selectedContent === subcategory.id && styles.subcategoryIndicatorSelected
                      ]} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Clock size={14} color={theme.info} />
              <Text style={styles.statText}>12 events this week</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={14} color={theme.success} />
              <Text style={styles.statText}>45+ active clubs</Text>
            </View>
            <View style={styles.statItem}>
              <Star size={14} color={theme.warning} />
              <Text style={styles.statText}>New perks available</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  triggerActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    flex: 1,
  },
  triggerTextActive: {
    color: theme.white,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: theme.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  dropdownContent: {
    padding: 8,
  },
  resetOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: theme.gray50,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
  },
  menuSection: {
    marginBottom: 4,
  },
  mainCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.gray50,
  },
  mainCategoryExpanded: {
    backgroundColor: theme.primary,
  },
  mainCategorySelected: {
    backgroundColor: theme.primary,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  categoryTitleExpanded: {
    color: theme.white,
  },
  subcategoriesContainer: {
    marginTop: 8,
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: theme.border,
    paddingLeft: 16,
  },
  subcategory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
  },
  subcategorySelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  lastSubcategory: {
    marginBottom: 0,
  },
  subcategoryContent: {
    flex: 1,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subcategoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  subcategoryTitleSelected: {
    color: theme.white,
  },
  subcategoryDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  subcategoryDescriptionSelected: {
    color: theme.white,
  },
  subcategoryIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.primary,
    marginLeft: 12,
  },
  subcategoryIndicatorSelected: {
    backgroundColor: theme.white,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.white,
  },
  quickStats: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  statText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: -width,
    right: -width,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
});