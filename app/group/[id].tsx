"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Platform,
  Share,
} from "react-native"
import { ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { theme, spacing, typography, borderRadius } from "@/components/theme"
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Edit3,
  Calendar,
  Star,
  LogOut,
  Trash2,
  Shield,
  MapPin,
  Info,
  Settings,
  MessageSquare,
  Clock,
  Share2,
} from "lucide-react-native"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getGroup,
  removeMember,
  updateMemberRoleApi,
  joinGroup,
  leaveGroup,
  addMultipleMembers,
  updateGroup,
  deleteGroup,
} from "@/contexts/group.api"
import { getUsers } from "@/contexts/user.api"
import getDecodedToken from "@/utils/getMyData"
import { EditGroupModal } from "@/components/UpdateGroupModal"
import { GroupRole } from "@/types/group.types"

// Neomorphic color palette
const neomorphColors = {
  background: "#f0f0f3",
  lightShadow: "#ffffff",
  darkShadow: "#d1d9e6",
  cardBackground: "#ffffff",
  accent: "#667eea",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
}

const extendedTheme = {
  ...theme,
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
}

interface User {
  id: string
  email: string
  name: string
  phone?: string
}

interface Member {
  id: string
  groupId: string
  userId: string
  role: GroupRole
  joinedAt: string
  user: User
}

interface GroupResponse {
  id: string
  name: string
  description: string
  imageUrl: string | null
  isPrivate: boolean
  createdAt: string
  updatedAt: string
  creatorId: string
  creator: User
  members: Member[]
  meetingDetails?: string
  chatId?: string
  meetingLocation?: string
  meetingDate?: string
  meetingTime?: string
}

export default function GroupDetailEnhanced() {
  const { id } = useLocalSearchParams()
  // const myData = getDecodedToken()

  const { data: myData } = useQuery({
    queryKey: ["myData", id],
    queryFn: () => getDecodedToken(),
  })

  // Modal states
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [showKickModal, setShowKickModal] = useState(false)
  const [showUpdateRoleModal, setShowUpdateRoleModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showMembersList, setShowMembersList] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showEditGroupModal, setShowEditGroupModal] = useState(false)
  const [memberToKick, setMemberToKick] = useState<Member | null>(null)
  const [memberToUpdate, setMemberToUpdate] = useState<Member | null>(null)
  const [selectedRole, setSelectedRole] = useState<GroupRole | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [searchEmail, setSearchEmail] = useState("")
  const queryClient = useQueryClient()
  
  const {
    data: groupResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup((id as string) || ""),
  })
  const { data: usersResponse } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  })

  const group = groupResponse?.group
  const currentUserMembership = groupResponse?.group?.members?.find((member: any) => member.userId === myData?.userId)
  const isCurrentUserMember = !!currentUserMembership;
  const isCurrentUserAdmin = currentUserMembership?.role === "ADMIN"

  const canShowSettings =
    isCurrentUserAdmin || isCurrentUserMember || group?.creatorId === myData?.userId

  const canJoinGroup = !isCurrentUserMember && !group?.isPrivate

  const availableUsers =
    usersResponse?.users?.filter((user: User) => {
      const isMember = group?.members?.some((member: any) => member.userId === user.id)
      const matchesSearch = user.email.toLowerCase().includes(searchEmail.toLowerCase())
      return !isMember && matchesSearch
    }) || []

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleKickMember = (member: Member) => {
    setMemberToKick(member)
    setShowKickModal(true)
  }

  const handleUpdateRole = (member: Member) => {
    setMemberToUpdate(member)
    setSelectedRole(member.role)
    setShowUpdateRoleModal(true)
  }

  const handleJoinGroup = () => {
    setShowJoinModal(true)
  }

  const { mutate: deleteGroupMutation, isPending: isDeletingGroup } = useMutation({
    mutationFn: (groupIdToDelete: string) => deleteGroup(groupIdToDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["chats"] })

      router.back()
      Alert.alert("Success", "Group deleted successfully.")
    },
    onError: (err) => {
      console.error("Error deleting group:", err)
      Alert.alert("Error", "Failed to delete group. Please try again.")
    },
  })

  const handleDeleteGroup = () => {
    if (!id) {
      Alert.alert("Error", "Group ID is missing.")
      return
    }
    Alert.alert("Confirm Deletion", `Are you sure you want to delete "${group?.name}"? This action cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteGroupMutation(id as string) },
    ])
  }

  const handleShareGroup = async () => {
    if (!group) return
    try {
      const groupUrl = `https://cultureconnect.app/group/${group.id}`
      await Share.share({
        message: `Check out the "${group.name}" group on Culture Connect! Let's join and connect: ${groupUrl}`,
        url: groupUrl,
        title: `Join the ${group.name} group on Culture Connect`,
      })
    } catch (error) {
      console.error("Error sharing group:", error)
      // @ts-ignore
      Alert.alert("Error", error.message || "Unable to share this group at this time.")
    }
  }

  const { mutate: updateGroupMutation, isPending: isUpdatingGroup } = useMutation({
    mutationFn: (data: { isPrivate: boolean }) => updateGroup(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      Alert.alert("Success", "Group visibility updated.")
    },
    onError: (err) => {
      console.error("Error updating group:", err)
      Alert.alert("Error", "Failed to update group visibility.")
    },
  })

  const { mutate: kickMembersMutate, isPending: kickMemberPending } = useMutation({
    mutationFn: (userId: string) => removeMember(id as string, userId),
    onSuccess: (data) => {
      setShowKickModal(false)
      refetch()
    },
    onError: (error) => {
      console.error("❌ Error kicking members:", error)
    },
  })

  const { mutate: updateRoleMutate, isPending: updateRolePending } = useMutation({
    mutationFn: ({
      userId,
      newRole,
    }: {
      userId: string
      newRole: GroupRole
    }) => {
      return updateMemberRoleApi(id as string, userId, newRole)
    },
    onSuccess: (data) => {
      console.log("✅ Role updated:", data)
      setShowUpdateRoleModal(false)
      setMemberToUpdate(null)
      setSelectedRole(null)
      refetch()
    },
    onError: (error) => {
      console.error("❌ Error updating role:", error)
    },
  })

  const { mutate: joinGroupMutate } = useMutation({
    mutationFn: () => joinGroup(id as string),
    onSuccess: (data) => {
      console.log("✅ Joined group:", data)
      setShowJoinModal(false)
      refetch()
    },
    onError: (error) => {
      console.error("❌ Error joining group:", error)
      Alert.alert("Error", "Failed to join group. Please try again.")
    },
  })

  const kickMember = (userId: string) => {
    kickMembersMutate(userId)
    setShowKickModal(false)
    setMemberToKick(null)
  }

  const updateMemberRole = (newRole: GroupRole) => {
    if (memberToUpdate) {
      updateRoleMutate({ userId: memberToUpdate.userId, newRole })
    }
  }

  const confirmJoinGroup = () => {
    joinGroupMutate()
  }

  const { mutate: leaveGroupMutate } = useMutation({
    mutationFn: () => leaveGroup(id as string),
    onSuccess: (data) => {
      console.log("✅ Group Leaved", data)
      queryClient.invalidateQueries({ queryKey: ["groups"] })

      router.replace("/(tabs)/groups")
      refetch()
    },
    onError: (error) => {
      console.error("❌ Error leaving Group", error)
    },
  })

  const handleLeaveGroup = () => {
    Alert.alert("Leave Group", `Are you sure you want to leave "${group?.name}"? You won't be able to access group content anymore.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Leave", style: "destructive", onPress: () => leaveGroupMutate() },
    ])
  }

  const confirmLeaveGroup = () => {
    leaveGroupMutate()
    console.log("leave group")
  }

  const { mutate: addMembers, isPending: isAddMemberPending } = useMutation({
    mutationFn: () => addMultipleMembers(id as string, selectedUserIds),
    onSuccess: (data) => {
      console.log("✅ Members Added to the Group", data)
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["group"] })
      setShowAddMembersModal(false)
      setSelectedUserIds([])
      setSearchEmail("")
      refetch()
    },
    onError: (error) => {
      console.error("❌ Error Adding Memmbers to the Group Group", error)
    },
  })

  const handleModalOverlayPress = (modalSetter: (value: boolean) => void) => {
    modalSetter(false)
    setSelectedUserIds([])
    setSearchEmail("")
    setMemberToKick(null)
    setMemberToUpdate(null)
    setSelectedRole(null)
  }

  const handleAddMembers = async () => {
    console.log(selectedUserIds)
    addMembers()
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading group details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  console.log(error || !group)

  if (error || !group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Group not found</Text>
            <Text style={styles.errorSubtext}>The group you're looking for doesn't exist or has been removed.</Text>
            <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
              <Text style={styles.backLinkText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          {group.imageUrl ? (
            <Image source={{ uri: group.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: neomorphColors.accent }]}>
              <Users size={64} color="white" />
            </View>
          )}

          <View style={styles.heroOverlay} />

          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={20} color={theme.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerRight}>
              {isCurrentUserMember && !group.isPrivate && (
                <TouchableOpacity onPress={handleShareGroup} style={styles.headerButton}>
                  <Share2 size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              )}
              {isCurrentUserAdmin && (
                <TouchableOpacity onPress={() => setShowAddMembersModal(true)} style={styles.headerButton}>
                  <UserPlus size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              )}
              {canShowSettings && (
                <View>
                  <TouchableOpacity onPress={() => setShowSettingsDropdown(!showSettingsDropdown)} style={styles.headerButton}>
                    <Settings size={20} color={theme.primary} />
                  </TouchableOpacity>
                  {showSettingsDropdown && (
                    <View style={styles.dropdownMenu}>
                      {isCurrentUserAdmin && (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            setShowEditGroupModal(true)
                            setShowSettingsDropdown(false)
                          }}
                        >
                          <Edit3 size={16} color={theme.textPrimary} style={styles.dropdownIcon} />
                          <Text style={styles.dropdownText}>Edit Group</Text>
                        </TouchableOpacity>
                      )}
                      {isCurrentUserMember && (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            handleLeaveGroup()
                            setShowSettingsDropdown(false)
                          }}
                        >
                          <LogOut size={16} color={theme.error} style={styles.dropdownIcon} />
                          <Text style={[styles.dropdownText, { color: theme.error }]}>Leave Group</Text>
                        </TouchableOpacity>
                      )}
                      {group?.creatorId === myData?.userId && (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            handleDeleteGroup()
                            setShowSettingsDropdown(false)
                          }}
                        >
                          <Trash2 size={16} color={theme.error} style={styles.dropdownIcon} />
                          <Text style={[styles.dropdownText, { color: theme.error }]}>Delete Group</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
                )}
            </View>
          </View>

          {/* Event Badge */}
          {showSettingsDropdown && (
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowSettingsDropdown(false)} />
          )}
          <View style={styles.eventBadge}>
            <Users size={16} color="white" />
            <Text style={styles.eventBadgeText}>{group.isPrivate ? "Private Group" : "Public Group"}</Text>
          </View>

          {/* Hero Bottom Info */}
          <View style={styles.heroBottomInfo}>
            {/* <View style={styles.heroTitleContainer}>
              <Text style={styles.heroTitle}>{group.name}</Text>
              <View style={styles.heroRating}>
                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.heroRatingText}>4.8</Text>
              </View>
            </View> */}

            <View style={styles.heroMetaContainer}>
              <Text style={styles.heroSubtitle}>Created by {group.creator.name}</Text>
              <View style={styles.heroStatusBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.heroStatusText}>{group.members.length} members</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Tags Section */}
          <View style={styles.tagsSection}>
            <View style={styles.tagsContainer}>
              {isCurrentUserMember && (
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{isCurrentUserAdmin ? "Admin" : "Joined"}</Text>
                </View>
              )}
            </View>
            {isCurrentUserMember && group?.chatId && (
              <TouchableOpacity onPress={() => router.push(`/chat/${group.chatId}`)} style={styles.messageButton}>
                <MessageSquare size={16} color={theme.white} />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Meeting Details Section */}
          {(group.meetingDate || group.meetingTime || group.meetingLocation) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Meeting Details</Text>
              </View>
              <View style={styles.infoCard}>
                {group.meetingDate && (
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIconWrapper, { backgroundColor: `${neomorphColors.accent}15` }]}>
                      <Calendar size={20} color={neomorphColors.accent} />
                    </View>
                    <Text style={styles.infoValue}>{new Date(group.meetingDate).toLocaleDateString()}</Text>
                  </View>
                )}
                {group.meetingTime && (
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIconWrapper, { backgroundColor: `${extendedTheme.success}15` }]}>
                      <Clock size={20} color={extendedTheme.success} />
                    </View>
                    <Text style={styles.infoValue}>{group.meetingTime}</Text>
                  </View>
                )}
                {group.meetingLocation && (
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIconWrapper, { backgroundColor: `${extendedTheme.warning}15` }]}>
                      <MapPin size={20} color={extendedTheme.warning} />
                    </View>
                    <Text style={styles.infoValue}>{group.meetingLocation}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          {/* Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Group Details</Text>
            </View>
            <View style={styles.infoCard}>
              {/* Moved createdAt info row to the end */}
              {/* <View style={styles.infoRow}>
                <View
                  style={[
                    styles.infoIconWrapper,
                    { backgroundColor: `${neomorphColors.accent}15` },
                  ]}
                >
                  <Calendar size={20} color={neomorphColors.accent} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Created</Text>
                  <Text style={styles.infoValue}>
                    {new Date(group.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View> */}

              <View style={styles.infoRow}>
                <View style={[styles.infoIconWrapper, { backgroundColor: `${extendedTheme.success}15` }]}>
                  <Users size={20} color={extendedTheme.success} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Total Members</Text>
                  <Text style={styles.infoValue}>{group.members.length}</Text>
                </View>
                <TouchableOpacity style={styles.mapButton} onPress={() => setShowMembersList(!showMembersList)}>
                  <Text style={styles.mapButtonText}>{showMembersList ? "Hide" : "View All"}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <View style={[styles.infoIconWrapper, { backgroundColor: `${neomorphColors.accent}15` }]}>
                  <Calendar size={20} color={neomorphColors.accent} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Created</Text>
                  <Text style={styles.infoValue}>{new Date(group.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>

              {showMembersList && (
                <View style={styles.membersExpandedSection}>
                  <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Members</Text>
                  {group.members.map((member: any) => (
                    <View key={member.id} style={styles.infoRow}>
                      <View style={[styles.infoIconWrapper, { backgroundColor: `${theme.primary}15` }]}>
                        <Users size={20} color={theme.primary} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoValue}>{member.user.name}</Text>
                        <Text style={styles.infoLabel}>{member.user.email}</Text>
                      </View>
                      <View style={styles.memberActions}>
                        <Badge label={member.role} variant={member.role === "ADMIN" ? "warning" : "info"} />
                        {isCurrentUserAdmin && member.userId !== myData?.userId && (
                          <>
                            <TouchableOpacity style={styles.editButton} onPress={() => handleUpdateRole(member)}>
                              <Edit3 size={16} color={theme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.kickButton} onPress={() => handleKickMember(member)}>
                              <UserMinus size={16} color={theme.error} />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Admin Settings Section */}
          {isCurrentUserAdmin && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Admin Settings</Text>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconWrapper, { backgroundColor: `${extendedTheme.warning}15` }]}>
                    <Shield size={20} color={extendedTheme.warning} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Group Privacy</Text>
                    <Text style={styles.infoValue}>{group.isPrivate ? "Private" : "Public"}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.togglePrivacyButton}
                    onPress={() => updateGroupMutation({ isPrivate: !group.isPrivate })}
                    disabled={isUpdatingGroup}
                  >
                    <Text style={styles.togglePrivacyButtonText}>
                      {isUpdatingGroup ? "Updating..." : group.isPrivate ? "Make Public" : "Make Private"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          {/* Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <View style={styles.descriptionContainer}>
              <View style={styles.descriptionCard}>
                <Text style={styles.description}>{group.description}</Text>

               
              </View>
            </View>
          </View>

          {/* Members Section */}
          {/* <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Members</Text>
            </View>
            <View style={styles.infoCard}>
              {group.members.map((member: any) => (
                <View key={member.id} style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconWrapper,
                      { backgroundColor: `${theme.primary}15` },
                    ]}
                  >
                    <Users size={20} color={theme.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoValue}>{member.user.name}</Text>
                    <Text style={styles.infoLabel}>{member.user.email}</Text>
                  </View>
                  <View style={styles.memberActions}>
                    <Badge
                      label={member.role}
                      variant={member.role === 'ADMIN' ? 'warning' : 'info'}
                    />
                    {isCurrentUserAdmin && member.userId !== myData?.userId && (
                      <>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleUpdateRole(member)}
                        >
                          <Edit3 size={16} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.kickButton}
                          onPress={() => handleKickMember(member)}
                        >
                          <UserMinus size={16} color={theme.error} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View> */}
        </View>
      </ScrollView>

      {/* Footer with Join Button */}
      {canJoinGroup && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.rsvpButton} onPress={handleJoinGroup}>
            <View style={styles.rsvpContent}>
              <Text style={styles.rsvpButtonText}>Join Group</Text>
              <View style={styles.rsvpIcon}>
                <Text style={styles.rsvpIconText}>+</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Join Confirmation Modal */}
      <Modal
        visible={showJoinModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowJoinModal(false)}>
          <TouchableOpacity style={styles.confirmModalContent} activeOpacity={1} onPress={() => {}}>
            <Text style={styles.confirmModalTitle}>Join Group</Text>
            <Text style={styles.confirmModalText}> Are you sure you want to join "{group.name}"? You'll be able to interact with other members.
            </Text>
            <View style={styles.confirmModalActions}>
              <Button title="Cancel" variant="secondary" onPress={() => setShowJoinModal(false)} style={styles.cancelButton} />
              <Button title="Join" onPress={confirmJoinGroup} style={styles.addButton} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Existing Modals */}
      <Modal
        visible={showAddMembersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMembersModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => handleModalOverlayPress(setShowAddMembersModal)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
            disabled={isAddMemberPending}
          >
            <Text style={styles.modalTitle}>{isAddMemberPending ? "Adding..." : "Add Members"}</Text>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by email..."
                value={searchEmail}
                onChangeText={setSearchEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <ScrollView style={styles.usersList}>
              {availableUsers.map((user: User) => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.userItem, selectedUserIds.includes(user.id) && styles.selectedUserItem]}
                  onPress={() => toggleUserSelection(user.id)}
                >
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                  {selectedUserIds.includes(user.id) && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {availableUsers.length === 0 && (
                <Text style={styles.noUsersText}>
                  {searchEmail ? "No users found matching your search" : "No available users to add"}
                </Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setShowAddMembersModal(false)
                  setSelectedUserIds([])
                  setSearchEmail("")
                }}
                style={styles.cancelButton}
              />
              <Button
                title={
                  isAddMemberPending
                    ? "Adding..."
                    : `Add ${selectedUserIds.length} Member${selectedUserIds.length !== 1 ? "s" : ""}`
                }
                onPress={handleAddMembers}
                disabled={selectedUserIds.length === 0 || isAddMemberPending}
                //@ts-ignore
                style={[
                  styles.addButton,
                  (selectedUserIds.length === 0 || isAddMemberPending) && styles.disabledButton,
                ]}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showKickModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKickModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => handleModalOverlayPress(setShowKickModal)}
        >
          <TouchableOpacity style={styles.confirmModalContent} activeOpacity={1} onPress={() => {}}>
            <Text style={styles.confirmModalTitle}>Kick Member</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to kick {memberToKick?.user.name} from the group?
            </Text>
            <View style={styles.confirmModalActions}>
              <Button title="Cancel" onPress={() => setShowKickModal(false)} style={styles.cancelButton} />
              <Button
                title={kickMemberPending ? "Kicking..." : "Kick"}
                onPress={() => memberToKick && kickMember(memberToKick.userId)}
                style={styles.kickConfirmButton}
                disabled={kickMemberPending}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showUpdateRoleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpdateRoleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => handleModalOverlayPress(setShowUpdateRoleModal)}
        >
          <TouchableOpacity style={styles.compactRoleModalContent} activeOpacity={1} onPress={() => {}}>
            <Text style={styles.modalTitle}>Update Role</Text>
            <Text style={styles.roleModalSubtitle}>Update role for {memberToUpdate?.user.name}</Text>

            <View style={styles.roleOptionsContainer}>
              <TouchableOpacity
                style={[styles.roleOption, selectedRole === "MEMBER" && styles.selectedRoleOption]}
                onPress={() => setSelectedRole(GroupRole.MEMBER)}
              >
                <Text style={[styles.roleOptionText, selectedRole === "MEMBER" && styles.selectedRoleText]}>
                  MEMBER
                </Text>
                {memberToUpdate?.role === "MEMBER" && <Text style={styles.currentRoleIndicator}>Current</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleOption, selectedRole === "ADMIN" && styles.selectedRoleOption]}
                onPress={() => setSelectedRole(GroupRole.ADMIN)}
              >
                <Text style={[styles.roleOptionText, selectedRole === "ADMIN" && styles.selectedRoleText]}>ADMIN</Text>
                {memberToUpdate?.role === "ADMIN" && <Text style={styles.currentRoleIndicator}>Current</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowUpdateRoleModal(false)
                  setMemberToUpdate(null)
                  setSelectedRole(null)
                }}
                style={styles.cancelButton}
                textStyle={{color:'black'}}
              />
              <Button
                title={updateRolePending ? "Updaing..." : "Update"}
                onPress={() => selectedRole && updateMemberRole(selectedRole)}
                disabled={!selectedRole || selectedRole === memberToUpdate?.role || updateRolePending}
                //@ts-ignore
                style={[
                  styles.updateButton,
                  (!selectedRole || selectedRole === memberToUpdate?.role) && styles.disabledButton,
                ]}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <EditGroupModal
        visible={showEditGroupModal}
        onClose={() => setShowEditGroupModal(false)}
        group={group}
        onSubmit={() => refetch()}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  dropdownMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "white",
    borderRadius: borderRadius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: 150,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: theme.textPrimary,
    fontWeight: "500",
  },
  // To remove border from last item
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  messageButtonText: {
    color: theme.white,
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
  },

  // Content Container

  compactRoleModalContent: {
    backgroundColor: neomorphColors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg, // Reduced from spacing.xl
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  leaveButton: {
    flex: 1,
    backgroundColor: theme.error,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
  },

  container: {
    flex: 1,
    backgroundColor: neomorphColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  errorCard: {
    backgroundColor: theme.white,
    padding: spacing.lg,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
        shadowColor: neomorphColors.darkShadow,
      },
    }),
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: theme.error,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  backLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: neomorphColors.background,
    borderRadius: borderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backLinkText: {
    color: theme.primary,
    fontSize: typography.fontSize.base,
    fontWeight: "600",
  },

  // Hero Section
  heroContainer: {
    position: "relative",
    height: 350,
    marginHorizontal: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  headerActions: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  headerRight: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  eventBadge: {
    position: "absolute",
    top: 80,
    left: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  eventBadgeText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
  },
  heroBottomInfo: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  heroTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: "800",
    color: theme.white,
    flex: 1,
    marginRight: spacing.md,
  },
  heroRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  heroRatingText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
  },
  heroMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: typography.fontSize.sm,
    fontWeight: "500",
  },
  heroStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: extendedTheme.success,
  },
  heroStatusText: {
    color: extendedTheme.success,
    fontSize: typography.fontSize.xs,
    fontWeight: "600",
  },

  togglePrivacyButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  togglePrivacyButtonText: {
    color: theme.white,
    fontWeight: "600",
  },

  // Content Container
  contentContainer: {
    backgroundColor: neomorphColors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: spacing.lg,
  },

  // Tags Section
  tagsSection: {
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: neomorphColors.background,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
    color: theme.primary,
  },

  section: {
    marginVertical: spacing.sm,
    backgroundColor: neomorphColors.background,
    paddingTop: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: spacing.sm,
    fontFamily: typography?.fontFamily?.bold || "System",
  },

  infoCard: {
    backgroundColor: theme.white,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: extendedTheme.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  mapButtonText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
  },

  descriptionContainer: {
  },
  descriptionCard: {
    backgroundColor: theme.white,
    padding: spacing.md,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  highlightsList: {
    gap: spacing.sm,
  },
  highlightsTitle: {
    fontSize: typography.fontSize.md,
    color: theme.textPrimary,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: neomorphColors.background,
    padding: spacing.sm,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  highlightIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  highlightText: {
    fontSize: typography.fontSize.sm,
    color: theme.textPrimary,
    fontWeight: "500",
    flex: 1,
  },

  // Footer RSVP
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: neomorphColors.background,
    borderTopWidth: 1,
    borderTopColor: neomorphColors.lightShadow,
    alignItems: "center",
  },
  rsvpButton: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: theme.primary,
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  rsvpContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rsvpButtonText: {
    fontSize: typography.fontSize.md,
    color: theme.white,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  rsvpIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  rsvpIconText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: "700",
  },
  rsvpSubtext: {
    fontSize: typography.fontSize.xs,
    color: theme.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.white,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    width: "90%",
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  confirmModalContent: {
    backgroundColor: theme.white,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    width: "85%",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  confirmModalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.lg,
    color: theme.textPrimary,
  },
  confirmModalText: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  confirmModalActions: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  roleModalContent: {
    backgroundColor: theme.white,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    width: "90%",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  roleModalSubtitle: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    fontFamily: typography.fontFamily.medium,
  },
  roleOptionsContainer: {
    width: "100%",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  roleOption: {
    backgroundColor: theme.gray50,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedRoleOption: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryLight,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  roleOptionText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    letterSpacing: 0.5,
  },
  selectedRoleText: {
    color: theme.white,
    fontFamily: typography.fontFamily.bold,
  },
  currentRoleIndicator: {
    fontSize: typography.fontSize.sm,
    color: theme.white,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.medium,
    backgroundColor: theme.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    
  },
  modalActions: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  cancelButton: {
    backgroundColor: theme.gray200,
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    color:'black',
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  updateButton: {
    backgroundColor: theme.primary,
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  kickConfirmButton: {
    backgroundColor: theme.error,
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: theme.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButton: {
    backgroundColor: theme.primary,
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    backgroundColor: theme.gray400,
    opacity: 0.6,
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    backgroundColor: theme.white,
  },
  usersList: {
    maxHeight: 300,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  selectedUserItem: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
  },
  selectedIndicator: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedText: {
    color: theme.white,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.sm,
  },
  noUsersText: {
    textAlign: "center",
    color: theme.textSecondary,
    fontSize: typography.fontSize.base,
    padding: spacing.lg,
    fontStyle: "italic",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  editButton: {
    padding: spacing.xs,
    backgroundColor: "#e0f2fe",
    borderRadius: borderRadius.sm,
  },
  kickButton: {
    padding: spacing.xs,
    backgroundColor: "#fee2e2",
    borderRadius: borderRadius.sm,
  },
  // Added style for the expanded members section
  membersExpandedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
})
