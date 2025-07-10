import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchableSelector } from '@/components/ui/SearchableSelector';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { ArrowLeft, Save } from 'lucide-react-native';
import { heritageOptions, languageOptions } from '@/data/heritageLanguageData';
import { store } from '@/data/store';
import { UserProfile } from '@/types/user';
const privacyOptions = [
  { label: 'Public', value: 'public' },
  { label: 'Group-Only', value: 'group' },
  { label: 'Connections Only', value: 'connections' },
];

export default function EditProfile() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    fullName: 'Alex Chen',
    bio: 'Passionate about technology and preserving cultural traditions. Love connecting with fellow students from around the world! 🌏',
    linkedIn: '',
    major: 'Computer Science',
    year: 'Junior',
    heritage: ['Chinese', 'Taiwanese'],
    languages: ['Mandarin', 'English', 'Cantonese'],
    // Add any other fields as needed
  });

  const handleSave = () => {
    if (!profile.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    store.updateUserProfile(profile);
    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };
  
  const updateProfileValue = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({...prev, [key]: value}));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} value={profile.name} onChangeText={(text) => updateProfileValue('name', text)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Bio *</Text>
            <TextInput style={[styles.input, styles.textArea]} value={profile.bio} onChangeText={(text) => updateProfileValue('bio', text)} multiline />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>LinkedIn Profile</Text>
            <TextInput style={styles.input} value={profile.linkedinUrl} onChangeText={(text) => updateProfileValue('linkedinUrl', text)} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Profile Privacy</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {privacyOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    backgroundColor: profile.privacy === option.value ? theme.primary : theme.gray100,
                    marginRight: 8,
                  }}
                  onPress={() => updateProfileValue('privacy', option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Set profile privacy to ${option.label}`}
                >
                  <Text style={{ color: profile.privacy === option.value ? theme.white : theme.textPrimary, fontWeight: '500' }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Major</Text>
              <TextInput style={styles.input} value={profile.major} onChangeText={(text) => updateProfileValue('major', text)} />
            </View>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Year</Text>
              <TextInput style={styles.input} value={profile.year} onChangeText={(text) => updateProfileValue('year', text)} />
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Cultural Identity</Text>
          <SearchableSelector
            title="Heritage"
            placeholder="Search for your heritage..."
            selectedItems={profile.heritage || []}
            availableItems={heritageOptions}
            maxItems={5}
            onItemsChange={(items) => updateProfileValue('heritage', items)}
            variant="primary"
          />
          <SearchableSelector
            title="Languages"
            placeholder="Search for languages..."
            selectedItems={profile.languages || []}
            availableItems={languageOptions}
            maxItems={8}
            onItemsChange={(items) => updateProfileValue('languages', items)}
            variant="secondary"
          />
        </Card>

        <View style={styles.saveSection}>
          <Button title="Save Changes" onPress={handleSave} style={styles.saveButtonLarge} />
          <Button title="Cancel" variant="outline" onPress={() => router.back()} style={styles.cancelButton} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  saveButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
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
    height: 100,
    textAlignVertical: 'top',
  },
  saveSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  saveButtonLarge: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
  },
});
