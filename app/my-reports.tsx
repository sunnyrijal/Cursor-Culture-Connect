'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyReports,
  deleteMyReport,
  Report,
  ReportReason,
  ReportStatus,
} from '@/contexts/report.api';
import { useAlert } from '@/contexts/AlertContext';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import {
  ArrowLeft,
  Trash2,
  ChevronDown,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  User,
  Tag,
  Filter,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const reasonDisplayNames: Record<ReportReason, string> = {
  [ReportReason.SPAM]: 'Spam or Misleading',
  [ReportReason.HARASSMENT]: 'Harassment or Bullying',
  [ReportReason.HATE_SPEECH]: 'Hate Speech',
  [ReportReason.INAPPROPRIATE_CONTENT]: 'Inappropriate Content',
  [ReportReason.OTHER]: 'Other',
};

const statusDisplayNames: Record<ReportStatus, string> = {
  PENDING: 'Pending Review',
  REVIEWED: 'Under Review',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
};

const statusColors: Record<ReportStatus, string> = {
  PENDING: '#F59E0B',
  REVIEWED: '#3B82F6',
  RESOLVED: '#10B981',
  DISMISSED: '#6B7280',
};

const statusBackgrounds: Record<ReportStatus, string> = {
  PENDING: '#FEF3C7',
  REVIEWED: '#DBEAFE',
  RESOLVED: '#D1FAE5',
  DISMISSED: '#F3F4F6',
};

export default function MyReportsScreen() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [filters, setFilters] = useState<{
    status?: ReportStatus;
    reason?: ReportReason;
  }>({});
  const [openDropdown, setOpenDropdown] = useState<'status' | 'reason' | null>(null);

  const {
    data: reportsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['myReports', filters],
    queryFn: () => getMyReports(filters),
  });

  const reports = reportsResponse?.data || [];
console.log(reports)
  const deleteReportMutation = useMutation({
    mutationFn: deleteMyReport,
    onSuccess: () => {
      showAlert({ title: 'Success', message: 'Report has been deleted.' });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
    onError: (err: any) => {
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to delete report.',
      });
    },
  });

  const handleDeleteReport = (reportId: string) => {
    showAlert({
      title: 'Delete Report',
      message: 'Are you sure you want to delete this report? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReportMutation.mutate(reportId),
        },
      ],
    });
  };

  const getEntityInfo = (report: Report) => {
    if (report.event)
      return {
        icon: Calendar,
        name: report.event.name,
        type: 'Event',
      };
    if (report.group)
      return { icon: Users, name: report.group.name, type: 'Group' };
    if (report.quickEvent)
      return {
        icon: Calendar,
        name: report.quickEvent.name,
        type: 'Quick Event',
      };
    if (report.reportedUser)
      return {
        icon: User,
        name: report.reportedUser.name,
        type: 'User',
      };
    if (report.activity)
      return {
        icon: Tag,
        name: report.activity.name,
        type: 'Activity',
      };
    return { icon: FileText, name: 'Content', type: 'Unknown' };
  };

  const handleNavigation = (report: Report) => {
    if (report.event?.id) {
      router.push(`/event/${report.event.id}`);
    } else if (report?.group?.id) {
      router.push(`/group/${report.group.id}`);
    } else if (report?.quickEvent?.id) {
      router.push(`/quickevent/${report.quickEvent.id}`);
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => {
    const entityInfo = getEntityInfo(item);
    const EntityIcon = entityInfo.icon;
    
    return (
      <TouchableOpacity
        style={styles.reportCard}
        activeOpacity={0.8}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.reportCardGradient}
        >
          <View style={styles.reportHeader}>
            <View style={styles.entityInfo}>
              <View style={styles.entityIconContainer}>
                <EntityIcon size={18} color="#6366F1" />
              </View>
              <TouchableOpacity 
        onPress={() => handleNavigation(item)}
              style={styles.entityTextContainer}>
                
                <Text style={styles.entityName} numberOfLines={1}>
                  {entityInfo.name}
                </Text>
                <Text style={styles.entityType}>{entityInfo.type}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteReport(item.id)}
              disabled={deleteReportMutation.isPending}
              activeOpacity={0.7}
            >
              <View style={styles.deleteButtonInner}>
                <Trash2 size={18} color="#EF4444" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.reportDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reason</Text>
              <View style={styles.reasonBadge}>
                <Text style={styles.reasonText}>
                  {reasonDisplayNames[item.reason] || item.reason}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusBackgrounds[item.status] },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusColors[item.status] },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColors[item.status] },
                  ]}
                >
                  {statusDisplayNames[item.status] || item.status}
                </Text>
              </View>
            </View>

            {item.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.descriptionText}>{item.description}</Text>
              </View>
            )}

            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                Reported on {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const FilterDropdown = ({
    type,
    label,
    options,
    selectedValue,
    onSelect,
  }: {
    type: 'status' | 'reason';
    label: string;
    options: any;
    selectedValue?: string;
    onSelect: (value?: any) => void;
  }) => {
    const isOpen = openDropdown === type;
    const hasSelection = selectedValue !== undefined;

    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasSelection && styles.filterButtonActive,
            isOpen && styles.filterButtonOpen,
          ]}
          onPress={() => setOpenDropdown(isOpen ? null : type)}
          activeOpacity={0.7}
        >
          <View style={styles.filterButtonContent}>
            <Filter size={16} color={hasSelection ? '#6366F1' : '#9CA3AF'} />
            <Text
              style={[
                styles.filterButtonText,
                hasSelection && styles.filterButtonTextActive,
              ]}
            >
              {selectedValue ? options[selectedValue] : label}
            </Text>
          </View>
          <ChevronDown
            size={16}
            color={hasSelection ? '#6366F1' : '#9CA3AF'}
            style={[
              styles.chevron,
              isOpen && styles.chevronRotated,
            ]}
          />
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownMenu}>
            <ScrollView
              style={styles.dropdownScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  !selectedValue && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onSelect(undefined);
                  setOpenDropdown(null);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownItemContent}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      !selectedValue && styles.dropdownItemTextSelected,
                    ]}
                  >
                    All {label}
                  </Text>
                  {/* {!selectedValue && (
                    <View style={styles.selectedIndicator}>
                      <View style={styles.selectedDot} />
                    </View>
                  )} */}
                </View>
              </TouchableOpacity>

              {Object.entries(options).map(([key, value], index) => {
                const isSelected = selectedValue === key;
                const isLast = index === Object.entries(options).length - 1;

                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.dropdownItem,
                      isLast && styles.dropdownItemLast,
                      isSelected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(key);
                      setOpenDropdown(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemContent}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {value as string}
                      </Text>
                      {/* {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <View style={styles.selectedDot} />
                        </View>
                      )} */}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const hasActiveFilters = filters.status || filters.reason;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>My Reports</Text>
          {reports.length > 0 && (
            <Text style={styles.subtitle}>{reports.length} total reports</Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <FilterDropdown
          type="status"
          label="Status"
          options={statusDisplayNames}
          selectedValue={filters.status}
          onSelect={(status) => setFilters((prev) => ({ ...prev, status }))}
        />
        <FilterDropdown
          type="reason"
          label="Reason"
          options={reasonDisplayNames}
          selectedValue={filters.reason}
          onSelect={(reason) => setFilters((prev) => ({ ...prev, reason }))}
        />
      </View>

      {hasActiveFilters && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersText}>
            Filtering: {filters.status && statusDisplayNames[filters.status]}
            {filters.status && filters.reason && ' • '}
            {filters.reason && reasonDisplayNames[filters.reason]}
          </Text>
          <TouchableOpacity
            onPress={() => setFilters({})}
            style={styles.clearFiltersButton}
            activeOpacity={0.7}
          >
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <AlertTriangle size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load reports</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#6366F1"
              colors={['#6366F1']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <AlertTriangle size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No Reports Found</Text>
              <Text style={styles.emptyText}>
                {hasActiveFilters
                  ? 'No reports match your current filters.'
                  : "You haven't submitted any reports yet."}
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity
                  style={styles.clearFiltersButtonLarge}
                  onPress={() => setFilters({})}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearFiltersButtonLargeText}>
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  filterBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#6366F1',
  },
  filterButtonOpen: {
    borderColor: '#6366F1',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#6366F1',
  },
  chevron: {
    marginLeft: 4,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    maxHeight: 240,
    overflow: 'hidden',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EEF2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#C7D2FE',
  },
  activeFiltersText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    flex: 1,
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  reportCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  reportCardGradient: {
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  entityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  entityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entityTextContainer: {
    flex: 1,
  },
  entityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  entityType: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reasonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionContainer: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 8,
  },
  dateContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'right',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  clearFiltersButtonLarge: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  clearFiltersButtonLargeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});