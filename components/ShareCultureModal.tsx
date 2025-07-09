import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, Modal } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { X, Camera, Image as ImageIcon, Globe, Lock, Users, Plus } from 'lucide-react-native';
import { heritageOptions } from '@/data/heritageLanguageData';

interface ShareCultureModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (storyData: any) => void;
}

const culturalTags = [
  'Food & Cuisine', 'Traditional Clothing', 'Festivals', 'Music & Dance',
  'Language', 'Art & Crafts', 'Religious Practices', 'Family Traditions',
  'Wedding Customs', 'Coming of Age', 'Storytelling', 'Games & Sports',
  'Architecture', 'Literature', 'Philosophy', 'Healing Practices'
];

export function ShareCultureModal({ visible, onClose, onSubmit }: ShareCultureModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    heritage: '',
    tags: [],
    visibility: 'public',
    allowComments: true,
    selectedImage: null
  });

  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showHeritageDropdown, setShowHeritageDropdown] = useState(false);

  const handleTagSelect = (tag: string) => {
    const currentTags = [...formData.tags];
    const index = currentTags.indexOf(tag);
    
    if (index > -1) {
      currentTags.splice(index, 1);
    } else if (currentTags.length < 5) {
      currentTags.push(tag);
    }
    
    setFormData({...formData, tags: currentTags});
  };

  const handleImageSelect = () => {
    // In real app, this would open image picker
    const mockImage = 'https://images.pexels.com/photos/6786961/pexels-photo-6786961.jpeg?auto=compress&cs=tinysrgb&w=400';
    setFormData({...formData, selectedImage: mockImage});
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your story');
      return;
    }
    if (!formData.story.trim()) {
      Alert.alert('Error', 'Please share your cultural story');
      return;
    }
    if (!formData.heritage) {
      Alert.alert('Error', 'Please select your heritage');
      return;
    }
    if (formData.tags.length === 0) {
      Alert.alert('Error', 'Please select at least one tag');
      return;
    }

    onSubmit(formData);
    
    // Reset form
    setFormData({
      title: '',
      story: '',
      heritage: '',
      tags: [],
      visibility: 'public',
      allowComments: true,
      selectedImage: null
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Share Your Culture</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.gray500} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Story Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Story Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="Give your story a compelling title"
              maxLength={100}
            />
          </View>

          {/* Heritage Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Heritage *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowHeritageDropdown(!showHeritageDropdown)}
            >
              <Text style={[styles.dropdownText, !formData.heritage && styles.placeholder]}>
                {formData.heritage || 'Select your heritage'}
              </Text>
            </TouchableOpacity>
            
            {showHeritageDropdown && (
              <Card style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {heritageOptions.map((heritage) => (
                    <TouchableOpacity
                      key={heritage}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setFormData({...formData, heritage});
                        setShowHeritageDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{heritage}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Card>
            )}
          </View>

          {/* Cultural Story */}
          <View style={styles.field}>
            <Text style={styles.label}>Your Cultural Story *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.story}
              onChangeText={(text) => setFormData({...formData, story: text})}
              placeholder="Share a meaningful cultural tradition, memory, or practice from your heritage..."
              multiline
              numberOfLines={6}
              maxLength={1000}
            />
            <Text style={styles.charCount}>{formData.story.length}/1000</Text>
          </View>

          {/* Image Upload */}
          <View style={styles.field}>
            <Text style={styles.label}>Add Photo (Optional)</Text>
            {formData.selectedImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: formData.selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setFormData({...formData, selectedImage: null})}
                >
                  <X size={16} color={theme.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageUpload} onPress={handleImageSelect}>
                <ImageIcon size={32} color={theme.gray400} />
                <Text style={styles.imageUploadText}>Add a photo to your story</Text>
                <Text style={styles.imageUploadSubtext}>Tap to select from gallery</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cultural Tags */}
          <View style={styles.field}>
            <Text style={styles.label}>Cultural Tags * (Select up to 5)</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowTagDropdown(!showTagDropdown)}
              disabled={formData.tags.length >= 5}
            >
              <Plus size={16} color={formData.tags.length >= 5 ? theme.gray400 : theme.primary} />
              <Text style={[styles.addButtonText, formData.tags.length >= 5 && styles.disabledText]}>
                Add Tags
              </Text>
            </TouchableOpacity>
            
            <View style={styles.tagContainer}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={styles.editableTag}>
                  <Badge label={tag} variant="primary" size="sm" />
                  <TouchableOpacity
                    onPress={() => handleTagSelect(tag)}
                    style={styles.removeButton}
                  >
                    <X size={12} color={theme.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {showTagDropdown && (
              <Card style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {culturalTags
                    .filter(tag => !formData.tags.includes(tag))
                    .map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.dropdownOption}
                      onPress={() => {
                        handleTagSelect(tag);
                        setShowTagDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Card>
            )}
          </View>

          {/* Visibility Settings */}
          <View style={styles.field}>
            <Text style={styles.label}>Who can see this?</Text>
            
            <TouchableOpacity
              style={[styles.visibilityOption, formData.visibility === 'public' && styles.visibilityOptionActive]}
              onPress={() => setFormData({...formData, visibility: 'public'})}
            >
              <Globe size={20} color={formData.visibility === 'public' ? theme.white : theme.success} />
              <View style={styles.visibilityOptionContent}>
                <Text style={[styles.visibilityOptionTitle, formData.visibility === 'public' && styles.visibilityOptionTitleActive]}>
                  Public
                </Text>
                <Text style={[styles.visibilityOptionDesc, formData.visibility === 'public' && styles.visibilityOptionDescActive]}>
                  Anyone can see and interact with your story
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.visibilityOption, formData.visibility === 'heritage' && styles.visibilityOptionActive]}
              onPress={() => setFormData({...formData, visibility: 'heritage'})}
            >
              <Users size={20} color={formData.visibility === 'heritage' ? theme.white : theme.primary} />
              <View style={styles.visibilityOptionContent}>
                <Text style={[styles.visibilityOptionTitle, formData.visibility === 'heritage' && styles.visibilityOptionTitleActive]}>
                  My Heritage Community
                </Text>
                <Text style={[styles.visibilityOptionDesc, formData.visibility === 'heritage' && styles.visibilityOptionDescActive]}>
                  Only people from your heritage can see this
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.visibilityOption, formData.visibility === 'private' && styles.visibilityOptionActive]}
              onPress={() => setFormData({...formData, visibility: 'private'})}
            >
              <Lock size={20} color={formData.visibility === 'private' ? theme.white : theme.warning} />
              <View style={styles.visibilityOptionContent}>
                <Text style={[styles.visibilityOptionTitle, formData.visibility === 'private' && styles.visibilityOptionTitleActive]}>
                  Connections Only
                </Text>
                <Text style={[styles.visibilityOptionDesc, formData.visibility === 'private' && styles.visibilityOptionDescActive]}>
                  Only your connections can see this story
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Comments Setting */}
          <View style={styles.field}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setFormData({...formData, allowComments: !formData.allowComments})}
            >
              <View style={[styles.checkbox, formData.allowComments && styles.checkboxActive]}>
                {formData.allowComments && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Allow comments and reactions</Text>
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Preview</Text>
            <Card style={styles.previewCard}>
              <Text style={styles.previewName}>{formData.title || 'Your Story Title'}</Text>
              <Text style={styles.previewHeritage}>
                {formData.heritage ? `${formData.heritage} Heritage` : 'Heritage'}
              </Text>
              <Text style={styles.previewDesc}>
                {formData.story || 'Your cultural story will appear here...'}
              </Text>
              {formData.selectedImage && (
                <Image source={{ uri: formData.selectedImage }} style={styles.previewImage} />
              )}
              <View style={styles.previewBadges}>
                {formData.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} label={tag} variant="success" size="sm" />
                ))}
                {formData.tags.length > 3 && (
                  <Badge label={`+${formData.tags.length - 3} more`} variant="info" size="sm" />
                )}
              </View>
            </Card>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.actionButton}
          />
          <Button
            title="Share Story"
            onPress={handleSubmit}
            style={styles.actionButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textPrimary,
    backgroundColor: theme.white,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: theme.white,
  },
  dropdownText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textPrimary,
  },
  placeholder: {
    color: theme.gray400,
  },
  dropdownMenu: {
    marginTop: spacing.sm,
    maxHeight: 200,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  dropdownOptionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textPrimary,
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUpload: {
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.gray50,
  },
  imageUploadText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: theme.textPrimary,
    marginTop: spacing.sm,
  },
  imageUploadSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.white,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.primary,
    marginLeft: spacing.xs,
  },
  disabledText: {
    color: theme.gray400,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  editableTag: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: spacing.sm,
    backgroundColor: theme.white,
  },
  visibilityOptionActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  visibilityOptionContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  visibilityOptionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
  },
  visibilityOptionTitleActive: {
    color: theme.white,
  },
  visibilityOptionDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
  },
  visibilityOptionDescActive: {
    color: theme.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkmark: {
    color: theme.white,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textPrimary,
  },
  preview: {
    marginTop: spacing.lg,
  },
  previewTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.sm,
  },
  previewCard: {
    padding: spacing.md,
    backgroundColor: theme.gray50,
  },
  previewName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  previewHeritage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.primary,
    marginBottom: spacing.sm,
  },
  previewDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  previewBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});