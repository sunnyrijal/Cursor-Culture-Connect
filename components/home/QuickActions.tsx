import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { 
  Calendar, 
  Users, 
  MapPin,
} from 'lucide-react-native';
import { theme, spacing, typography } from '../theme';

const QuickActions = ({ setShowCreateEventModal, setShowCreateGroupModal }:any) => {
  const router = useRouter()
  const [pressedButton, setPressedButton] = useState(null)

  const handlePressIn = (buttonId:any) => {
    setPressedButton(buttonId)
  }

  const handlePressOut = () => {
    setPressedButton(null)
  }

  const quickActionsData = [
    {
      id: 'createEvent',
      title: 'Create Event',
      description: 'Host cultural events',
      icon: Calendar,
      iconColor: '#1d4ed8', // blue-700
      backgroundColor: '#dbeafe', // blue-100
      gradientColors: ['#dbeafe', '#e9d5ff'], // blue-200 to purple-200
      action: () => setShowCreateEventModal(true)
    },
    {
      id: 'createGroup', 
      title: 'Create Group',
      description: 'Start new community',
      icon: Users,
      iconColor: '#15803d', // green-700
      backgroundColor: '#dcfce7', // green-100
      gradientColors: ['#dcfce7', '#dbeafe'], // green-200 to blue-200
      action: () => setShowCreateGroupModal(true)
    },
    {
      id: 'myUniversity',
      title: 'My University', 
      description: 'Campus resources',
      icon: MapPin,
      iconColor: '#c2410c', // orange-700
      backgroundColor: '#fed7aa', // orange-100
      gradientColors: ['#fed7aa', '#fecaca'], // orange-200 to pink-200
      action: () => router.push('/my-university')
    }
  ]

  const getButtonStyle = (buttonId:string) => {
    const baseStyle = styles.actionButton
    const pressedStyle = styles.actionButtonPressed
    return pressedButton === buttonId ? pressedStyle : baseStyle
  }

  const QuickActionCard = ({ item }:any) => {
    const IconComponent = item.icon
    
    return (
      <TouchableOpacity
        style={[getButtonStyle(item.id), { backgroundColor: item.backgroundColor }]}
        onPress={item.action}
        onPressIn={() => handlePressIn(item.id)}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 255, 255, 0.8)' }]}>
          <IconComponent size={24} color={item.iconColor} />
        </View>
        <Text style={[styles.actionTitle, { color: item.iconColor }]}>{item.title}</Text>
        {/* <Text style={styles.actionDescription}>{item.description}</Text> */}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionButtons}>
        {quickActionsData.map((item) => (
          <QuickActionCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  )
}

export default QuickActions

const styles = StyleSheet.create({
  quickActions: {
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937', 
    marginBottom: spacing.md,
    fontFamily: typography?.fontFamily?.bold || 'System',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  // Clay shadow effect - normal state
  actionButton: {
    flex: 1,
    borderRadius: 24, // rounded-3xl equivalent
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    minHeight: 120,
    // Clay shadow effect
    ...Platform.select({
      ios: {
        shadowColor: '#a3b1c6',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
        shadowColor: '#a3b1c6',
      },
    }),
    // Additional light shadow for clay effect
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },

  // Clay shadow effect - pressed state
  actionButtonPressed: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
 paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    // Pressed clay shadow effect (inset-like)
    ...Platform.select({
      ios: {
        shadowColor: '#a3b1c6',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
        shadowColor: '#a3b1c6',
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(163, 177, 198, 0.15)',
    // transform: [{ scale: 0.98 }], 
  },

  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  actionTitle: {
    fontSize: 12,
    // fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: typography?.fontFamily?.bold || 'System',
    marginBottom: 2,
  },

  actionDescription: {
    fontSize: 12,
    color: '#6b7280', // gray-500
    textAlign: 'center',
    fontFamily: typography?.fontFamily?.regular || 'System',
    lineHeight: 14,
  },
})