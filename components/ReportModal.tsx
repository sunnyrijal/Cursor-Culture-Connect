import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { ChevronDown, Sparkles, X, AlertTriangle } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitReport, ReportReason } from '@/contexts/report.api';
import { useAlert } from '@/contexts/AlertContext';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'event' | 'group' | 'quickEvent' | 'user';
  entityName: string;
}

const reportReasons = Object.values(ReportReason);

const reasonDisplayNames: Record<ReportReason, string> = {
  [ReportReason.SPAM]: 'Spam or Misleading',
  [ReportReason.HARASSMENT]: 'Harassment or Bullying',
  [ReportReason.HATE_SPEECH]: 'Hate Speech',
  [ReportReason.INAPPROPRIATE_CONTENT]: 'Inappropriate Content',
  [ReportReason.OTHER]: 'Other',
};

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  entityId,
  entityType,
  entityName,
}) => {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  const { mutate: submitReportMutation, isPending } = useMutation({
    mutationFn: submitReport,
    onSuccess: () => {
      showAlert({
        title: 'Report Submitted',
        message: 'Thank you for your feedback. We will review your report shortly.',
      });
      onClose();
      setReason(null);
      setDescription('');
      setShowReasonDropdown(false);
    },
    onError: (error: any) => {
      console.log(error)
      showAlert({
        title: 'Error',
        message: error?.response?.data.message || 'Failed to submit report. Please try again.',
      });
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      setTimeout(() => {
        showAlert({ 
          title: 'Incomplete', 
          message: 'Please select a reason for your report.' 
        });
      }, 250);
      return;
    }

    const reportData: any = {
      reason,
      description: description.trim() || undefined,
    };

    if (entityType === 'event') reportData.eventId = entityId;
    if (entityType === 'group') reportData.groupId = entityId;
    if (entityType === 'quickEvent') reportData.quickEventId = entityId;
    if (entityType === 'user') reportData.reportedUserId = entityId;

    submitReportMutation(reportData);
  };

  const handleClose = () => {
    setReason(null);
    setDescription('');
    setShowReasonDropdown(false);
    setFocusedField(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      transparent={false}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <AlertTriangle size={28} color="#EF4444" />
              </View>
              <Text style={styles.title}>Report Content</Text>
              <Text style={styles.subtitle}>
                Report "{entityName}"
              </Text>
              <Text style={styles.description}>
                Help us maintain a safe community by reporting inappropriate content
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <BlurView intensity={25} style={styles.blurView}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.9)',
                  'rgba(255, 255, 255, 0.7)',
                ]}
                style={styles.formGradient}
              >
                {/* Reason Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Reason *</Text>
                  <TouchableOpacity
                    onPress={() => setShowReasonDropdown(!showReasonDropdown)}
                    disabled={isPending}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.inputWrapper,
                        reason && styles.inputWrapperValid,
                      ]}
                    >
                      <Sparkles
                        size={20}
                        color="#EF4444"
                        style={styles.inputIcon}
                      />
                      <Text
                        style={[
                          styles.dropdownText,
                          !reason && styles.placeholder,
                        ]}
                      >
                        {reason 
                          ? reasonDisplayNames[reason]
                          : 'Select a reason for reporting'}
                      </Text>
                      <ChevronDown 
                        size={20} 
                        color="#9CA3AF"
                        style={[
                          styles.chevron,
                          showReasonDropdown && styles.chevronRotated
                        ]}
                      />
                    </View>
                  </TouchableOpacity>

                  {showReasonDropdown && (
                    <View style={styles.dropdown}>
                      <ScrollView
                        style={styles.dropdownScroll}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                      >
                        {reportReasons.map((r, index) => (
                          <TouchableOpacity
                            key={r}
                            style={[
                              styles.dropdownItem,
                              index === reportReasons.length - 1 && styles.dropdownItemLast,
                            ]}
                            onPress={() => {
                              setReason(r);
                              setShowReasonDropdown(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.dropdownItemContent}>
                              <Text style={styles.dropdownItemText}>
                                {reasonDisplayNames[r]}
                              </Text>
                              {reason === r && (
                                <View style={styles.selectedIndicator}>
                                  <View style={styles.selectedDot} />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Description Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Additional Details {reason && '(Optional)'}
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      styles.textAreaWrapper,
                      focusedField === 'description' && styles.inputWrapperFocused,
                      description && styles.inputWrapperValid,
                    ]}
                  >
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Provide more details about your report..."
                      placeholderTextColor="#9CA3AF"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={4}
                      maxLength={500}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      textAlignVertical="top"
                      editable={!isPending}
                    />
                  </View>
                  <Text style={styles.characterCount}>
                    {description.length}/500 characters
                  </Text>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <View style={styles.infoIconContainer}>
                    <AlertTriangle size={16} color="#6366F1" />
                  </View>
                  <Text style={styles.infoText}>
                    Your report will be reviewed by our moderation team. False reports may result in account restrictions.
                  </Text>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <View style={styles.mainActionsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!reason || isPending) && styles.primaryButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!reason || isPending}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  !reason || isPending 
                    ? ['#9CA3AF', '#6B7280'] 
                    : ['#EF4444', '#DC2626']
                }
                style={styles.buttonGradient}
              >
                <View style={styles.buttonContent}>
                  {isPending && (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  )}
                  <Text style={styles.primaryButtonText}>
                    {isPending ? 'Submitting...' : 'Submit Report'}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7',
  },
  scrollContainer: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  formContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  blurView: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  formGradient: {
    padding: 24,
    borderRadius: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#CDD2D8',
    minHeight: 56,
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
  textAreaWrapper: {
    minHeight: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputWrapperFocused: {
    borderColor: '#EF4444',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputWrapperValid: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  chevron: {
    marginLeft: 8,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 16,
  },
  textArea: {
    height: 96,
    paddingTop: 8,
    paddingBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 6,
    marginRight: 4,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    maxHeight: 280,
    overflow: 'hidden',
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
    maxHeight: 280,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginTop: 8,
  },
  infoIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    backgroundColor: '#F0F3F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mainActionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  primaryButton: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  primaryButtonDisabled: {
    opacity: 0.6,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});