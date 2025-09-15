import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { 
  Calendar, 
  Users, 
  MapPin,
  Zap, // Added for quick event icon
} from 'lucide-react-native';
import { theme, spacing, typography } from '../theme';

const QuickActions = ({ setShowCreateEventModal, setShowCreateGroupModal, setShowCreateQuickEventModal }:any) => {
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
      id: 'createQuickEvent',
      title: 'Quick Event',
      description: 'Fast event setup',
      icon: Zap,
      iconColor: '#7c3aed', // violet-700
      backgroundColor: '#e9d5ff', // violet-100
      gradientColors: ['#e9d5ff', '#fecaca'], // violet-200 to pink-200
      action: () => setShowCreateQuickEventModal(true)
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
        <View style={[styles.actionIcon, ]}>
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
        {quickActionsData.map((item, index) => (
          <QuickActionCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  )
}

export default QuickActions

const styles = StyleSheet.create({
actionButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  flexWrap: 'nowrap', // single line only
},

quickActions:{

},
sectionTitle: {
  fontSize: 18,
  marginBottom:10,
  fontWeight: '700',
  color: '#1E293B',
},

actionButton: {
  width: '23%', // four per row
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.xs,
  minHeight: 90, // smaller height
  ...Platform.select({
    ios: {
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
      shadowColor: '#a3b1c6',
    },
  }),
  borderWidth: 0.5,
  borderColor: 'rgba(255, 255, 255, 0.7)',
},

actionButtonPressed: {
  width: '23%',
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.xs,
  minHeight: 90,
  ...Platform.select({
    ios: {
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
      shadowColor: '#a3b1c6',
    },
  }),
  borderWidth: 0.5,
  borderColor: 'rgba(163, 177, 198, 0.15)',
},

actionIcon: {
  width: 40, // smaller icon box
  height: 40,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: spacing.xs,
  // ...Platform.select({
  //   ios: {
  //     shadowColor: '#000',
  //     shadowOffset: { width: 1, height: 1 },
  //     shadowOpacity: 0.1,
  //     shadowRadius: 2,
  //   },
   
  // }),
},

actionTitle: {
  fontSize: 11, // slightly smaller text
  textAlign: 'center',
  fontFamily: typography?.fontFamily?.bold || 'System',
},

})