'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  // Remove Alert import
  Modal,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlurView } from 'expo-blur';
import { X, Sparkles, Tag } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInterest } from '@/contexts/interest.api';
import { useAlert } from '@/contexts/AlertContext';

interface CreateInterestModalProps {
  // Add useAlert import
  visible: boolean;
  onClose: () => void;
}

export function CreateInterestModal({
  visible,
  onClose,
}: CreateInterestModalProps) {
  const { showAlert } = useAlert(); // Initialize useAlert
  const [name, setName] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!visible) {
      setName('');
      setFocusedField(null);
    }
  }, [visible]);

  const createInterestMutation = useMutation({
    mutationFn: createInterest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
      showAlert({ title: 'Success', message: 'Interest created successfully!' }); // Use custom alert
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create interest.';
      showAlert({ title: 'Error', message: errorMessage }); // Use custom alert
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      showAlert({ title: 'Missing Name', message: 'Please enter an interest name.' }); // Use custom alert
      return;
    }
    createInterestMutation.mutate(name.trim());
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create New Interest</Text>
            <Text style={styles.subtitle}>
              Add a new interest category for activities.
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <BlurView intensity={25} style={styles.blurView}>
              <View style={styles.formGradient}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Interest Name *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'name' && styles.inputWrapperFocused,
                    ]}
                  >
                    <Tag
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g., Photography, Hiking"
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </ScrollView>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={createInterestMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              createInterestMutation.isPending && styles.primaryButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createInterestMutation.isPending}
          >
            <View
              style={[styles.buttonGradient, { backgroundColor: createInterestMutation.isPending ? '#9CA3AF' : '#6366F1' }]}
            >
              <View style={styles.buttonContent}>
                {createInterestMutation.isPending && (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                )}
                <Text style={styles.primaryButtonText}>
                  {createInterestMutation.isPending
                    ? 'Creating...'
                    : 'Create Interest'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F3F7' },
  scrollContainer: { flex: 1 },
  headerContainer: { marginHorizontal: 20, marginTop: Platform.OS === 'ios' ? 60 : 40, marginBottom: 32, alignItems: 'center' },
  closeButton: { position: 'absolute', top: 0, right: 0, padding: 8, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', fontWeight: '500' },
  formContainer: { marginHorizontal: 20, marginBottom: 24 },
  blurView: { borderRadius: 24, overflow: 'hidden' },
  formGradient: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F3F7', borderRadius: 16, paddingHorizontal: 16, borderWidth: 2, borderColor: '#CDD2D8', minHeight: 56 },
  inputWrapperFocused: { borderColor: '#6366F1', backgroundColor: '#FFFFFF' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1F2937', fontWeight: '500', paddingVertical: 16 },
  actionsContainer: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, paddingTop: 20, backgroundColor: '#F0F3F7', borderTopWidth: 1, borderTopColor: '#CDD2D8', flexDirection: 'row', gap: 16 },
  cancelButton: { flex: 1, height: 56, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 2, borderColor: 'rgba(226, 232, 240, 0.8)', justifyContent: 'center', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#64748B' },
  primaryButton: { flex: 2, height: 56, borderRadius: 16, overflow: 'hidden', },
  primaryButtonDisabled: { opacity: 0.7 },
  buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  buttonIcon: { marginLeft: 4 },
  buttonContent:{display:'flex'}
});