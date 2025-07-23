import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Platform,
  Switch,
} from 'react-native';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  GraduationCap,
  ChevronDown,
  Check,
  CircleAlert as AlertCircle,
  Globe,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { Button } from './ui/Button';
import { theme, spacing, typography, borderRadius } from './theme';
import { useLocalSearchParams } from 'expo-router';
import { Group } from '../types/group';
import { Event } from '../types/event';

interface CreateEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<Event>) => void;
  userGroups: Group[];
}

const categories = [
  'Cultural Celebration', 'Food & Culture', 'Workshop', 'Performance', 'Academic', 'Social',
  'Religious', 'Arts', 'Music', 'Dance', 'Language Exchange', 'Networking', 'Sports', 'Community Service'
];

export function CreateEventModal({ isVisible, onClose, onSubmit, userGroups = [] }: CreateEventModalProps) {
  const params = useLocalSearchParams();
  const groupIdFromParams = params.groupId as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    location: '',
    category: [] as string[],
    maxAttendees: '',
    price: '',
    isPublic: true,
    universityOnly: false,
    allowedUniversity: '',
    groupId: null as string | null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (groupIdFromParams) {
      setFormData(prev => ({ ...prev, groupId: groupIdFromParams }));
    }
  }, [groupIdFromParams]);

  useEffect(() => {
    // Log if userGroups is available when the modal opens
    if (isVisible) {
      console.log("CreateEventModal opened with userGroups:", userGroups);
    }
  }, [isVisible, userGroups]);

  const hasPermission = useMemo(() => {
    if (!formData.groupId) return true; // No group selected yet
    const group = userGroups.find(g => String(g.id) === String(formData.groupId));
    if (!group) return false;
    // Assuming a simple check for now. Replace with actual logic.
    // For example, check if currentUser.id is in group.admins or is group.president
    return true; 
  }, [formData.groupId, userGroups]);

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.groupId) {
      Alert.alert("Validation Error", "Please fill in the title, description, and select a group.");
      return;
    }
    if (!hasPermission) {
      Alert.alert("Permission Denied", "You are not authorized to create an event for this group. Your submission will be sent for approval.");
      // You might want to handle a submission for approval flow here
    }
    setIsSubmitting(true);
    try {
      // Make sure we're passing the right data structure expected by the API
      const eventToSubmit: Partial<Event> = {
        ...formData,
        date: formData.date.toISOString(),
        // Convert string values to numbers where needed
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees, 10) : undefined,
        price: formData.price ? formData.price : undefined, // Keep price as string
        // Make sure groupId is sent as a string (for UUID compatibility)
        groupId: formData.groupId
      };
      
      console.log("Submitting event data:", eventToSubmit);
      await onSubmit(eventToSubmit);
    } catch (error) {
      console.error("Error submitting event:", error);
      Alert.alert("Submission Error", "Could not create the event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCalendar = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
    const monthName = new Date(displayYear, displayMonth).toLocaleString('default', { month: 'long' });

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = formData.date.getDate() === day && formData.date.getMonth() === displayMonth && formData.date.getFullYear() === displayYear;
      calendarDays.push(
        <TouchableOpacity
          key={day}
          style={[styles.calendarDay, isSelected && styles.selectedDay]}
          onPress={() => {
            setFormData({ ...formData, date: new Date(displayYear, displayMonth, day) });
            setShowDatePicker(false);
          }}
        >
          <Text style={isSelected ? styles.selectedDayText : styles.dayText}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => setDisplayMonth(displayMonth - 1)}>
            <ChevronLeft size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.calendarMonthYear}>{monthName} {displayYear}</Text>
          <TouchableOpacity onPress={() => setDisplayMonth(displayMonth + 1)}>
            <ChevronRight size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.calendarWeekDays}>
          {days.map(day => <Text key={day} style={styles.weekDayText}>{day}</Text>)}
        </View>
        <View style={styles.calendarGrid}>
          {calendarDays}
        </View>
      </View>
    );
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Event</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.gray500} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput style={styles.input} value={formData.title} onChangeText={text => setFormData({ ...formData, title: text })} placeholder="Enter event title" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={text => setFormData({ ...formData, description: text })} placeholder="Describe your event" multiline />
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Associated Group *</Text>
            <TouchableOpacity onPress={() => setShowGroupPicker(true)}>
              <View style={styles.inputWithIcon}>
                <Users size={16} color={theme.gray500} />
                <Text style={[styles.inputText, !formData.groupId && { color: theme.gray400 }]}>
                  {formData.groupId && Array.isArray(userGroups) && userGroups.length > 0 ? 
                    userGroups.find(g => String(g.id) === String(formData.groupId))?.name || "Group not found" : 
                    "Select a group"}
                </Text>
                <ChevronDown size={16} color={theme.gray500} />
              </View>
            </TouchableOpacity>
            {formData.groupId && !hasPermission && (
              <Text style={styles.permissionWarning}>You are not an admin of this group. The event will be sent for approval.</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View style={styles.inputWithIcon}>
                  <Calendar size={16} color={theme.gray500} />
                  <Text style={styles.inputText}>{formData.date.toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Time</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={16} color={theme.gray500} />
                <TextInput style={styles.inputText} value={formData.time} onChangeText={text => setFormData({ ...formData, time: text })} placeholder="e.g., 7:00 PM" />
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={16} color={theme.gray500} />
              <TextInput style={styles.inputText} value={formData.location} onChangeText={text => setFormData({ ...formData, location: text })} placeholder="e.g., Student Union" />
            </View>
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryPicker(true)}>
              <View style={styles.inputWithIcon}>
                <Text style={[styles.inputText, formData.category.length === 0 && { color: theme.gray400 }]}>
                  {formData.category.length > 0 ? `${formData.category.length} selected` : "Select categories"}
                </Text>
                <ChevronDown size={16} color={theme.gray500} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Max Attendees</Text>
              <View style={styles.inputWithIcon}>
                <Users size={16} color={theme.gray500} />
                <TextInput style={styles.inputText} value={formData.maxAttendees} onChangeText={text => setFormData({ ...formData, maxAttendees: text })} placeholder="e.g., 50" keyboardType="number-pad" />
              </View>
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Price</Text>
              <View style={styles.inputWithIcon}>
                <DollarSign size={16} color={theme.gray500} />
                <TextInput style={styles.inputText} value={formData.price} onChangeText={text => setFormData({ ...formData, price: text })} placeholder="e.g., 5.00 or Free" keyboardType="decimal-pad" />
              </View>
            </View>
          </View>

          <View style={styles.switchRow}>
            <Globe size={24} color={formData.isPublic ? theme.primary : theme.gray400} />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Public Event</Text>
              <Text style={styles.switchDescription}>Visible to everyone on the platform.</Text>
            </View>
            <Switch value={formData.isPublic} onValueChange={value => setFormData({ ...formData, isPublic: value })} />
          </View>

          <View style={styles.switchRow}>
            <Lock size={24} color={!formData.isPublic ? theme.primary : theme.gray400} />
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Private Event</Text>
              <Text style={styles.switchDescription}>Only visible to group members.</Text>
            </View>
            <Switch value={!formData.isPublic} onValueChange={value => setFormData({ ...formData, isPublic: !value })} />
          </View>
          
        </ScrollView>
        <View style={styles.actions}>
          <Button title="Cancel" variant="outline" onPress={onClose} style={styles.actionButton} disabled={isSubmitting} />
          <Button title={isSubmitting ? "Creating..." : "Create Event"} onPress={handleSubmit} style={styles.actionButton} disabled={isSubmitting} />
        </View>

        <Modal visible={showDatePicker} transparent animationType="fade">
          <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowDatePicker(false)} activeOpacity={1}>
            <View style={styles.pickerContainer}>
              {renderCalendar()}
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showGroupPicker} transparent animationType="fade">
          <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowGroupPicker(false)} activeOpacity={1}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerHeaderText}>Select Your Group</Text>
              <ScrollView>
                {Array.isArray(userGroups) && userGroups.length > 0 ? (
                  userGroups.map(group => (
                    <TouchableOpacity key={String(group.id)} style={styles.pickerItem} onPress={() => {
                      setFormData({ ...formData, groupId: String(group.id) });
                      setShowGroupPicker(false);
                    }}>
                      <Text style={styles.pickerItemText}>{group.name}</Text>
                      {formData.groupId && String(group.id) === String(formData.groupId) && <Check size={20} color={theme.primary} />}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.pickerItem}>
                    <Text style={styles.pickerItemText}>No groups to display.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
        
        <Modal visible={showCategoryPicker} transparent animationType="fade">
          <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowCategoryPicker(false)} activeOpacity={1}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerHeaderText}>Select Categories</Text>
              <ScrollView>
                {categories.map(category => (
                  <TouchableOpacity key={category} style={styles.pickerItem} onPress={() => handleCategoryToggle(category)}>
                    <Text style={styles.pickerItemText}>{category}</Text>
                    {formData.category.includes(category) && <Check size={20} color={theme.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: theme.text,
    backgroundColor: theme.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: theme.white,
  },
  inputText: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: typography.fontSize.base,
    color: theme.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  permissionWarning: {
    color: theme.warning,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  switchTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  switchLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.text,
  },
  switchDescription: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: theme.white,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxHeight: '70%',
    padding: spacing.lg,
  },
  pickerHeaderText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pickerItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calendarMonthYear: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  calendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  weekDayText: {
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: typography.fontSize.base,
  },
  selectedDay: {
    backgroundColor: theme.primary,
    borderRadius: borderRadius.full,
  },
  selectedDayText: {
    color: theme.white,
    fontFamily: typography.fontFamily.bold,
  },
});
