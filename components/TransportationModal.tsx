import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Car, Hand, UserCheck, X } from 'lucide-react-native';
import { theme, typography, borderRadius, spacing } from './theme';
import { Button } from './ui/Button';

export enum TransportationPreference {
  CAN_PROVIDE_RIDE = 'CAN_PROVIDE_RIDE',
  NEED_RIDE = 'NEED_RIDE',
  MANAGE_MYSELF = 'MANAGE_MYSELF',
}

interface TransportationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (preference: TransportationPreference, message?: string) => void;
  isConfirming: boolean;
  isEditing?: boolean;
  initialPreference?: TransportationPreference | null;
  initialMessage?: string;
  onLeaveEvent?: () => void;
  isLeaving?: boolean;
}

const options = [
  {
    preference: TransportationPreference.CAN_PROVIDE_RIDE,
    label: 'I can provide a ride',
    icon: Car,
  },
  {
    preference: TransportationPreference.NEED_RIDE,
    label: 'I need a ride',
    icon: Hand,
  },
  {
    preference: TransportationPreference.MANAGE_MYSELF,
    label: "I'll manage myself",
    icon: UserCheck,
  },
];

export const TransportationModal: React.FC<TransportationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isConfirming,
  isEditing = false,
  initialPreference = null,
  initialMessage = '',
  onLeaveEvent,
  isLeaving = false,
}) => {
  const [selectedPreference, setSelectedPreference] =
    useState<TransportationPreference | null>(initialPreference);
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (visible) {
      setSelectedPreference(initialPreference);
      setMessage(initialMessage || '');
    }
  }, [visible, initialPreference, initialMessage]);


  const showMessageInput =
    selectedPreference === TransportationPreference.CAN_PROVIDE_RIDE ||
    selectedPreference === TransportationPreference.NEED_RIDE;

  const handleConfirm = () => {
    if (selectedPreference) {
      onConfirm(selectedPreference, showMessageInput ? message : undefined);
    }
  };

  const handleClose = () => {
    setSelectedPreference(null);
    setMessage('');
    onClose();
  };

  const handleLeave = () => {
    if (onLeaveEvent) {
      onLeaveEvent();
    }
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Transportation</Text>
            <Text style={styles.modalSubtitle}>
              How are you getting to the event?
            </Text>

            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.preference}
                  style={[
                    styles.option,
                    selectedPreference === option.preference &&
                      styles.selectedOption,
                  ]}
                  onPress={() => setSelectedPreference(option.preference)}
                >
                  <option.icon
                    size={24}
                    color={
                      selectedPreference === option.preference
                        ? theme.primary
                        : theme.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedPreference === option.preference &&
                        styles.selectedOptionLabel,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {showMessageInput && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>Optional Message</Text>
                <TextInput
                  style={styles.messageInput}
                  placeholder="e.g., I can take 3 people, pickup from campus..."
                  placeholderTextColor={theme.gray400}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />
              </View>
            )}

            <Button
              title={isConfirming ? 'Saving...' : isEditing ? 'Update RSVP' : 'Confirm RSVP'}
              onPress={handleConfirm}
              disabled={!selectedPreference || isConfirming}
              style={[
                styles.confirmButton,
                (!selectedPreference || isConfirming) && styles.disabledButton,
              ]}
            />

            {isEditing && (
              <Button
                title={isLeaving ? 'Leaving...' : 'Leave Event'}
                onPress={handleLeave}
                disabled={isLeaving}
                style={[
                  styles.leaveButton,
                  isLeaving && styles.disabledButton,
                ]}
              />)}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.white,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  closeButton: { position: 'absolute', top: 16, right: 16 },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  optionsContainer: { gap: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: theme.border,
    gap: spacing.md,
  },
  selectedOption: { borderColor: theme.primary, backgroundColor:'#dfe8ffff' },
  optionLabel: { fontSize: typography.fontSize.base, color: theme.textPrimary },
  selectedOptionLabel: { fontWeight: 'bold', color: theme.primary },
  messageContainer: { marginTop: spacing.lg },
  messageLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: spacing.xs,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  confirmButton: { marginTop: spacing.lg },
  disabledButton: { backgroundColor: theme.gray400, opacity: 0.7 },
  leaveButton: { marginTop: spacing.sm, backgroundColor: theme.error },
});