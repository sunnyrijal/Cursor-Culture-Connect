import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { 
  Calendar, 
  Users, 
  MapPin,
  Zap,
} from 'lucide-react-native';
import { theme, spacing, typography } from '../theme';
import { CreateEventModal } from '../CreateEventModal';
import { CreateGroupModal } from '../CreateGroupModal';
import { CreateQuickEventModal } from '../CreateQuickEventModal';


const QuickActions = () => {
  const router = useRouter()
  
  // Modal states
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showCreateQuickEventModal, setShowCreateQuickEventModal] = useState(false)

  // Handle modal actions
  const handleCreateEvent = (eventData:any) => {
    // Handle event creation logic here
    console.log('Creating event:', eventData)
    setShowCreateEventModal(false)
  }

  const handleCreateQuickEvent = (eventData:any) => {
    // Handle quick event creation logic here
    console.log('Creating quick event:', eventData)
    setShowCreateQuickEventModal(false)
  }

  const handleCreateGroup = (groupData:any) => {
    // Handle group creation logic here
    console.log('Creating group:', groupData)
    setShowCreateGroupModal(false)
  }

  const quickActionsData = [
    {
      id: 'createEvent',
      title: 'Create Event',
      description: 'Host cultural events',
      icon: Calendar,
      iconColor: '#1d4ed8',
      backgroundColor: '#dbeafe',
      action: () => setShowCreateEventModal(true)
    },
    {
      id: 'createQuickEvent',
      title: 'Quick Event',
      description: 'Fast event setup',
      icon: Zap,
      iconColor: '#7c3aed',
      backgroundColor: '#e9d5ff',
      action: () => setShowCreateQuickEventModal(true),
    },
    {
      id: 'createGroup', 
      title: 'Create Group',
      description: 'Start new community',
      icon: Users,
      iconColor: '#15803d',
      backgroundColor: '#dcfce7',
      action: () => setShowCreateGroupModal(true)
    },
    {
      id: 'myUniversity',
      title: 'My University', 
      description: 'Campus resources',
      icon: MapPin,
      iconColor: '#c2410c',
      backgroundColor: '#fed7aa',
      action: () => router.push('/my-university')
    }
  ]

  const QuickActionCard = ({ item }:{item:any}) => {
    const IconComponent = item.icon
    
    return (
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: item.backgroundColor }]}
        onPress={item.action}
        activeOpacity={0.7}
        delayPressIn={0}
        delayPressOut={0}
        delayLongPress={0}
      >
        <View style={styles.actionIcon}>
          <IconComponent size={24} color={item.iconColor} />
        </View>
        <Text style={[styles.actionTitle, { color: item.iconColor }]}>{item.title}</Text>
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

      {/* Integrated Modals */}
      <CreateEventModal
        visible={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onSubmit={handleCreateEvent}
      />

      <CreateQuickEventModal
        visible={showCreateQuickEventModal}
        onClose={() => setShowCreateQuickEventModal(false)}
        onSubmit={handleCreateQuickEvent}
      />
      
      <CreateGroupModal
        visible={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSubmit={handleCreateGroup}
      />
    </View>
  )
}

export default QuickActions

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },

  quickActions: {
    // Add any container styles here
  },

  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '700',
    color: '#1E293B',
  },

  actionButton: {
    width: '23%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    minHeight: 90,
    // Simplified shadow/elevation for better touch response
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },

  actionTitle: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: typography?.fontFamily?.bold || 'System',
    fontWeight: '600',
  },
})