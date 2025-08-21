import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { 
  Plus, 
  Users, 
  Building2,
} from 'lucide-react-native';
import { theme, spacing, typography, neomorphColors } from '../theme';

const QuickActions = ({ setShowCreateEventModal, setShowCreateGroupModal }: {
    setShowCreateEventModal: (value: boolean) => void;
    setShowCreateGroupModal: (value: boolean) => void
}) => {
  const router = useRouter()
  const [pressedButton, setPressedButton] = useState<string | null>(null)

  const handlePressIn = (buttonId: string) => {
    setPressedButton(buttonId)
  }

  const handlePressOut = () => {
    setPressedButton(null)
  }

  const getButtonStyle = (buttonId: string) => {
    return pressedButton === buttonId ? styles.actionButtonPressed : styles.actionButton
  }

  return (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionButtons}>
        
        {/* Create Event */}
        <TouchableOpacity
          style={getButtonStyle('createEvent')}
          onPress={() => setShowCreateEventModal(true)}
          onPressIn={() => handlePressIn('createEvent')}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.primary }]}>
            <Plus size={16} color={theme.white} />
          </View>
          <Text style={styles.actionText}>Create Event</Text>
        </TouchableOpacity>

        {/* Create Group */}
        <TouchableOpacity
          style={getButtonStyle('createGroup')}
          onPress={() => setShowCreateGroupModal(true)}
          onPressIn={() => handlePressIn('createGroup')}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.accent }]}>
            <Users size={16} color={theme.white} />
          </View>
          <Text style={styles.actionText}>Create Group</Text>
        </TouchableOpacity>

        {/* My University */}
        <TouchableOpacity
          style={getButtonStyle('myUniversity')}
          onPress={() => router.push('/my-university')}
          onPressIn={() => handlePressIn('myUniversity')}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.info }]}>
            <Building2 size={16} color={theme.white} />
          </View>
          <Text style={styles.actionText}>My University</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default QuickActions

const styles = StyleSheet.create({
  quickActions: {
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.bold,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },

  // Neumorphic button style - normal state with cross-platform shadows
  actionButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: neomorphColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minHeight: 90,
    // Add subtle border for light shadow effect
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
    // Cross-platform shadows
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // Neumorphic button style - pressed state with cross-platform shadows
  actionButtonPressed: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: neomorphColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    minHeight: 90,
    // Add subtle border for light shadow effect
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
    // Reduced shadows for pressed effect
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    // Cross-platform shadows for icons
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textPrimary,
    textAlign: 'center',
    fontFamily: typography.fontFamily.medium,
    lineHeight: 13,
  },
})