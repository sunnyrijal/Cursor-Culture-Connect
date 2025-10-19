'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShareButton } from '@/components/ui/ShareButton';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import {
  ArrowLeft,
  Users,
  Clock,
  ChevronDown,
  User,
  Trash2,
  RotateCcw,
  MessageCircle,
  UserRoundCog,
  MapPin,
  Edit3,
  AlertTriangle,
} from 'lucide-react-native';
import {
  getQuickEventById,
  addInterestedUser,
  deleteQuickEvent,
  addNotInterestedUser,
  removeInterestedUser,
} from '@/contexts/quickEvent.api';
import getDecodedToken from '@/utils/getMyData';
import { formatTo12Hour } from '@/utils/formatDate';
import { useAlert } from '@/contexts/AlertContext';
import { EditQuickEventModal } from '@/components/UpdateQuickEventModal'; // Corrected import path
import { ReportModal } from '@/components/ReportModal';
// Enhanced theme for neumorphism
const neomorphColors = {
  background: '#F8FAFC',
  lightShadow: '#FFFFFF',
  darkShadow: '#a3b1c6',
};

// Extended theme
const extendedTheme = {
  ...theme,
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

interface QuickEventDetailType {
  id: string;
  name: string;
  description: string;
  time: string;
  endTime?:string
  max: string;
  isPublic: boolean;
  location: string;
  userId: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  interestedUsers?: {
    profilePicture: any;
    id: string;
    name?: string;
    major?: string;
  }[];
}

export default function QuickEventDetail() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { showAlert } = useAlert();

  const eventId = Array.isArray(id) ? id[0] : id ?? null;

  const {
    data: eventResponse,
    isLoading,
    isError,
    error,
  } = useQuery<{ data: QuickEventDetailType }, Error>({
    queryKey: ['quickevent', eventId],
    queryFn: () => getQuickEventById(eventId as string),
    enabled: !!eventId,
  });

  const quickEvent = eventResponse?.data;
  console.log(error)

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const { mutate: expressInterest, isPending: isExpressingInterest } =
    useMutation({
      mutationFn: () => addInterestedUser(eventId as string),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quickevent', eventId] });
      },
      onError: (error) => {
        console.error('Error expressing interest:', error);
      },
    });

  const { mutate: removeInterest, isPending: isRemovingInterest } = useMutation(
    {
      mutationFn: () => removeInterestedUser(eventId as string),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quickevent', eventId] });
      },
      onError: (error) => {
        console.error('Error removing interest:', error);
        showAlert({ title: 'Error', message: 'Failed to remove interest. Please try again.' });
      },
    }
  );

  const { mutate: expressNotInterested, isPending: isExpressingNotInterest } =
    useMutation({
      mutationFn: () => addNotInterestedUser(eventId as string),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quickevent', eventId] });
        queryClient.invalidateQueries({ queryKey: ['quick-events'] });

        router.back();
      },
      onError: (error) => {
        console.error('Error expressing not interested:', error);
      },
    });

  const isAlreadyInterested = React.useMemo(() => {
    console.log(
      'Interested users:',
      quickEvent?.interestedUsers,
      'My data:',
      myData
    );
    if (!quickEvent?.interestedUsers || !myData?.userId) return false;
    return quickEvent.interestedUsers.some((user) => user.id === myData.userId);
  }, [quickEvent, myData]);

  const { mutate: deleteEventMutation, isPending: isDeletingEvent } =
    useMutation({
      mutationFn: (eventIdToDelete: string) =>
        deleteQuickEvent(eventIdToDelete),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quick-events'] });
        router.back();
        showAlert({ title: 'Success', message: 'Quick event deleted successfully.' });
      },
      onError: (error) => {
        console.error('Error deleting quick event:', error);
        showAlert({ title: 'Error', message: 'Failed to delete quick event. Please try again.' });
      },
    });

  const handleDeleteQuickEvent = () => {
    if (!eventId) {
      showAlert({ title: 'Error', message: 'Event ID is missing.' });
      return;
    }
    showAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${quickEvent?.name}"? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEventMutation(eventId as string),
        },
      ],
    });
  };

  const handleNotForMe = () => {
    expressNotInterested();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading quick event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !quickEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Quick Event Not Found</Text>
            <Text style={styles.errorSubtext}>
              This quick event may not exist, or you might not have access to
              view it. Please check the event details and try again.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>← Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const generateEventShareContent = () => {
    return {
      title: `${quickEvent.name} - Quick Event`,
      message: `Join me at ${quickEvent.name}!\n\n⏰ ${quickEvent.time}\n👥 Max ${quickEvent.max} participants\n\n${quickEvent.description}\n\nDiscover quick events!`,
      url: `https://app.com/quick-event/${quickEvent.id}`,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerActions}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
              >
                <ArrowLeft size={20} color={theme.textPrimary} />
              </TouchableOpacity>

              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.quickEventBadge,
                    {
                      backgroundColor: quickEvent.isPublic
                        ? extendedTheme.success
                        : extendedTheme.info,
                    },
                  ]}
                >
                  <Text style={styles.quickEventBadgeText}>
                    {quickEvent.isPublic ? 'Public' : 'University Only'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <ShareButton
                {...generateEventShareContent()}
                size={18}
                color={theme.textPrimary}
                style={styles.headerButton}
              />
              {quickEvent?.userId !== myData?.userId && (
                <TouchableOpacity
                  onPress={() => setShowReportModal(true)}
                  style={styles.headerButton}
                >
                  <AlertTriangle size={20} color={extendedTheme.warning} />
                </TouchableOpacity>
              )}
              {quickEvent?.userId === myData?.userId && (
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(true)}
                  style={styles.headerButton}
                >
                  <Edit3 size={20} color={theme.primary} />
                </TouchableOpacity>
              )}
              {quickEvent?.userId === myData?.userId && (
                <TouchableOpacity
                  onPress={handleDeleteQuickEvent}
                  style={styles.headerButton}
                >
                  <Trash2 size={20} color={extendedTheme.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.eventTitle}>{quickEvent.name}</Text>
            <View style={styles.organizerContainer}>
              <MessageCircle size={16} color={theme.textSecondary} />
              <Text style={styles.eventSubtitle}>
                Organized by {quickEvent.user?.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Event Details</Text>
            <View style={styles.detailsContainer}>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconWrapper,
                      { backgroundColor: '#FDF2F8' },
                    ]}
                  >
                    <Clock size={24} color={extendedTheme.accent} />
                  </View>
                  <View style={styles.infoContent}>
                    {/* <Text style={styles.infoValue}>
                      {formatTo12Hour(quickEvent.time)}
                    </Text> */}

                    <Text style={styles.infoValue}>
                      {quickEvent.endTime
                        ? `${formatTo12Hour(
                            quickEvent.time
                          )} - ${formatTo12Hour(quickEvent.endTime)}`
                        : formatTo12Hour(quickEvent.time)}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconWrapper,
                      { backgroundColor: '#E0F2F1' },
                    ]}
                  >
                    <MapPin size={24} color="#26A69A" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoValue}>{quickEvent.location}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconWrapper,
                      { backgroundColor: '#FEF3C7' },
                    ]}
                  >
                    <UserRoundCog size={24} color={extendedTheme.warning} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoValue}>
                      {quickEvent.max
                        ? ` Max ${quickEvent.max} people`
                        : 'No Limit'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconWrapper,
                      { backgroundColor: '#DBEAFE' },
                    ]}
                  >
                    <Users size={24} color={extendedTheme.info} />
                  </View>
                  <View style={styles.infoContent}>
                    {quickEvent?.userId === myData?.userId &&
                    (quickEvent.interestedUsers?.length ?? 0) > 0 ? (
                      <TouchableOpacity
                        onPress={() => setIsUserListVisible(!isUserListVisible)}
                        style={styles.collapsibleHeader}
                      >
                        <Text style={styles.infoValue}>
                          {quickEvent.interestedUsers?.length || 0} interested
                        </Text>
                        <ChevronDown
                          size={20}
                          color={theme.textPrimary}
                          style={{
                            transform: [
                              { rotate: isUserListVisible ? '180deg' : '0deg' },
                            ],
                          }}
                        />
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.infoValue}>
                        {quickEvent.interestedUsers?.length || 0} interested
                      </Text>
                    )}
                  </View>
                </View>

                {isUserListVisible && quickEvent?.userId === myData?.userId && (
                  <View style={styles.interestedUsersList}>
                    {quickEvent.interestedUsers?.map((user) => (
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/public/profile/${user.id}`)
                        }
                        key={user.id}
                        style={styles.attendeeItem}
                      >
                        <Image
                          source={
                            user.profilePicture
                              ? { uri: user.profilePicture }
                              : require('../../assets/user.png')
                          }
                          style={styles.attendeeImage}
                        />
                        <View>
                          <Text style={styles.attendeeName}>{user.name}</Text>
                          {user.major && (
                            <Text style={styles.attendeeEmail}>
                              {user.major}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Quick Event</Text>
            <View style={styles.descriptionContainer}>
              <View style={styles.descriptionCard}>
                <Text style={styles.description}>
                  {quickEvent.description ||
                    'No description provided for this quick event.'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {isAlreadyInterested ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.notForMeButton,
              styles.removeInterestButton,
              isRemovingInterest && styles.disabledButton,
            ]}
            onPress={() => removeInterest()}
            disabled={isRemovingInterest}
          >
            {isRemovingInterest ? (
              <ActivityIndicator color={theme.textSecondary} size="small" />
            ) : (
              <>
                <RotateCcw size={16} color={theme.textSecondary} />
                <Text style={styles.notForMeButtonText}>
                  Not Interested Anymore
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.notForMeButton,
              (isExpressingInterest ||
                isDeletingEvent ||
                isExpressingNotInterest) &&
                styles.disabledButton,
            ]}
            onPress={handleNotForMe}
            disabled={
              isExpressingInterest || isDeletingEvent || isExpressingNotInterest
            }
          >
            {isExpressingNotInterest ? (
              <ActivityIndicator color={theme.textSecondary} size="small" />
            ) : (
              <Text style={styles.notForMeButtonText}>Not For Me</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.interestedButton,
              (isExpressingInterest ||
                isDeletingEvent ||
                isExpressingNotInterest) &&
                styles.disabledButton,
            ]}
            onPress={() => expressInterest()}
            disabled={
              isExpressingInterest || isDeletingEvent || isExpressingNotInterest
            }
          >
            {isExpressingInterest ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.interestedButtonText}>Interested</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      <EditQuickEventModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSubmit={() => {
          setIsEditModalVisible(false);
          queryClient.invalidateQueries({ queryKey: ['quickevent', eventId] });
        }}
        quickEvent={quickEvent}
      />
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        entityId={eventId as string}
        entityType="quickEvent"
        entityName={quickEvent.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  attendeeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  attendeeName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
  },
  attendeeEmail: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
  },

  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorCard: {
    backgroundColor: theme.white,
    padding: spacing.lg,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
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
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: theme.error,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
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
    fontWeight: '600',
  },

  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.white,
    justifyContent: 'center',
    alignItems: 'center',
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
  quickEventBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.primary,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  quickEventBadgeText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    paddingHorizontal: 10,
  },
  titleContainer: {
    marginBottom: spacing.md,
  },
  eventTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '800',
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  eventSubtitle: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    fontWeight: '500',
  },

  // Content Container
  contentContainer: {
    backgroundColor: theme.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.lg,
    marginHorizontal: spacing.sm,
    flex: 1,
  },

  section: {
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: spacing.md,
  },

  detailsContainer: {
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: neomorphColors.background,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  interestedUsersList: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  interestedUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  interestedUserName: {
    fontSize: typography.fontSize.base,
    color: theme.textPrimary,
  },
  interestedUserMajor: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },

  descriptionContainer: {
    marginBottom: spacing.md,
  },
  descriptionCard: {
    backgroundColor: neomorphColors.background,
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
    color: theme.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },

  // Footer RSVP
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: spacing.md,
  },
  notForMeButton: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  removeInterestButton: {
    flexDirection: 'row',
    gap: 8,
    borderColor: extendedTheme.warning,
  },
  notForMeButtonText: {
    fontSize: typography.fontSize.md,
    color: theme.textSecondary,
    fontWeight: '700',
  },
  interestedButton: {
    flex: 2,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.primary,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  interestedButtonText: {
    fontSize: typography.fontSize.md,
    color: theme.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: theme.gray400,
  },
  alreadyInterestedContainer: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: extendedTheme.success,
    gap: spacing.sm,
  },
  alreadyInterestedText: {
    fontSize: typography.fontSize.md,
    color: extendedTheme.success,
    fontWeight: '700',
  },
});
