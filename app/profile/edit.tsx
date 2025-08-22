import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchableSelector } from '@/components/ui/SearchableSelector';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { ArrowLeft, Save, User, GraduationCap, Globe2, MessageCircle, Lock, Eye, Users, CheckCircle } from 'lucide-react-native';
import { heritageOptions, languageOptions } from '@/data/heritageLanguageData';
import { store } from '@/data/store';
import { UserProfile } from '@/types/user';

const privacyOptions = [
  { label: 'Public', value: 'public', icon: Globe2, description: 'Visible to everyone' },
  { label: 'Group-Only', value: 'group', icon: Users, description: 'Only group members' },
  { label: 'Connections Only', value: 'connections', icon: Lock, description: 'Only your connections' },
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
    privacy: 'public',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const renderInputField = (
    key: string,
    label: string,
    value: string | undefined,
    placeholder: string,
    multiline = false,
    required = false
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.neomorphicInputContainer}>
        <BlurView intensity={15} tint="light" style={styles.inputBlur}>
          <LinearGradient
            colors={
              focusedField === key 
                ? ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.9)']
                : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.9)']
            }
            style={[styles.inputGradient, multiline && styles.textAreaGradient]}
          >
            <TextInput
              style={[styles.neomorphicInput, multiline && styles.textAreaInput]}
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#94A3B8"
              onChangeText={(text) => updateProfileValue(key as keyof UserProfile, text)}
              onFocus={() => setFocusedField(key)}
              onBlur={() => setFocusedField(null)}
              multiline={multiline}
              textAlignVertical={multiline ? 'top' : 'center'}
            />
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );

  const renderSection = (title: string, icon: any, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.1)']}
            style={styles.sectionIconGradient}
          >
            {React.createElement(icon, { size: 20, color: '#6366F1' })}
          </LinearGradient>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.neomorphicCard}>
        <BlurView intensity={20} tint="light" style={styles.cardBlur}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.8)']}
            style={styles.cardGradient}
          >
            {children}
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0', '#F1F5F9']}
        style={styles.gradientBackground}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <BlurView intensity={30} tint="light" style={styles.headerBlur}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.neomorphicButton}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.9)', 'rgba(241, 245, 249, 0.8)']}
                    style={styles.buttonGradient}
                  >
                    <ArrowLeft size={20} color="#475569" />
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} style={styles.neomorphicSaveButton}>
                  <LinearGradient
                    colors={['rgba(99, 102, 241, 0.9)', 'rgba(99, 102, 241, 0.8)']}
                    style={styles.saveButtonGradient}
                  >
                    <Save size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Basic Information */}
          {renderSection('Basic Information', User, (
            <>
              {renderInputField('name', 'Full Name', profile.fullName, 'Enter your full name', false, true)}
              {renderInputField('bio', 'Bio', profile.bio, 'Tell others about yourself...', true, true)}
              {renderInputField('linkedinUrl', 'LinkedIn Profile', profile.linkedIn, 'https://linkedin.com/in/username')}
              
              <View style={styles.field}>
                <Text style={styles.label}>Profile Privacy</Text>
                <View style={styles.privacyContainer}>
                  {privacyOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.privacyOption}
                      onPress={() => updateProfileValue('privacy', option.value)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.neomorphicPrivacyButton}>
                        <BlurView intensity={10} tint="light" style={styles.privacyBlur}>
                          <LinearGradient
                            colors={
                              profile.privacy === option.value 
                                ? ['rgba(99, 102, 241, 0.9)', 'rgba(99, 102, 241, 0.8)']
                                : ['rgba(255, 255, 255, 0.8)', 'rgba(248, 250, 252, 0.6)']
                            }
                            style={styles.privacyGradient}
                          >
                            <View style={styles.privacyContent}>
                              <View style={styles.privacyIconContainer}>
                                <option.icon 
                                  size={16} 
                                  color={profile.privacy === option.value ? '#FFFFFF' : '#6366F1'} 
                                />
                              </View>
                              <View style={styles.privacyTextContainer}>
                                <Text style={[
                                  styles.privacyLabel,
                                  profile.privacy === option.value && styles.privacyLabelActive
                                ]}>
                                  {option.label}
                                </Text>
                                <Text style={[
                                  styles.privacyDescription,
                                  profile.privacy === option.value && styles.privacyDescriptionActive
                                ]}>
                                  {option.description}
                                </Text>
                              </View>
                              {profile.privacy === option.value && (
                                <CheckCircle size={16} color="#FFFFFF" />
                              )}
                            </View>
                          </LinearGradient>
                        </BlurView>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ))}

          {/* Academic Information */}
          {renderSection('Academic Information', GraduationCap, (
            <View style={styles.row}>
              <View style={styles.halfField}>
                {renderInputField('major', 'Major', profile.major, 'Your major')}
              </View>
              <View style={styles.halfField}>
                {renderInputField('year', 'Year', profile.year, 'Your year')}
              </View>
            </View>
          ))}

          {/* Cultural Identity */}
          {renderSection('Cultural Identity', Globe2, (
            <>
              <View style={styles.selectorContainer}>
                <SearchableSelector
                  title="Heritage"
                  placeholder="Search for your heritage..."
                  selectedItems={profile.heritage || []}
                  availableItems={heritageOptions}
                  maxItems={5}
                  onItemsChange={(items) => updateProfileValue('heritage', items)}
                  variant="primary"
                />
              </View>
              <View style={styles.selectorContainer}>
                <SearchableSelector
                  title="Languages"
                  placeholder="Search for languages..."
                  selectedItems={profile.languages || []}
                  availableItems={languageOptions}
                  maxItems={8}
                  onItemsChange={(items) => updateProfileValue('languages', items)}
                  variant="secondary"
                />
              </View>
            </>
          ))}
        </ScrollView>

        {/* Fixed Bottom Save Section */}
        <View style={styles.fixedSaveSection}>
          <BlurView intensity={25} tint="light" style={styles.fixedSaveBlur}>
            <LinearGradient
              colors={['rgba(248, 250, 252, 0.98)', 'rgba(248, 250, 252, 0.95)']}
              style={styles.fixedSaveGradient}
            >
              <View style={styles.saveButtonsContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.secondarySaveButton}>
                  <BlurView intensity={15} tint="light" style={styles.saveButtonBlur}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']}
                      style={styles.secondarySaveGradient}
                    >
                      <Text style={styles.secondarySaveText}>Cancel</Text>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSave} style={styles.primarySaveButton}>
                  <BlurView intensity={20} tint="light" style={styles.saveButtonBlur}>
                    <LinearGradient
                      colors={['rgba(99, 102, 241, 0.95)', 'rgba(99, 102, 241, 0.85)']}
                      style={styles.primarySaveGradient}
                    >
                      <View style={styles.saveButtonContent}>
                        <Save size={20} color="#FFFFFF" />
                        <Text style={styles.primarySaveText}>Save Changes</Text>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerBlur: {
    borderRadius: 20,
  },
  headerGradient: {
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  neomorphicButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#CBD5E1',
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  neomorphicSaveButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20, // Add padding for bottom buttons
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  sectionIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  neomorphicCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardBlur: {
    borderRadius: 20,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 20,
    backgroundColor:'white',
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  required: {
    color: '#EF4444',
  },
  neomorphicInputContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#CBD5E1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputBlur: {
    borderRadius: 16,
  },
  inputGradient: {
    borderRadius: 16,
    padding: 2,
  },
  textAreaGradient: {
    minHeight: 100,
  },
  neomorphicInput: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    minHeight: 48,
  },
  textAreaInput: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  privacyContainer: {
    gap: 12,
  },
  privacyOption: {
    marginBottom: 4,
  },
  neomorphicPrivacyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor:'white',
    ...Platform.select({
      ios: {
        shadowColor: '#CBD5E1',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  privacyBlur: {
    borderRadius: 16,
  },
  privacyGradient: {
    padding: 16,
    borderRadius: 16,
  },
  privacyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  privacyLabelActive: {
    color: '#FFFFFF',
  },
  privacyDescription: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  privacyDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  selectorContainer: {
    marginBottom: 16,
  },
  // Fixed bottom section styles
  fixedSaveSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fixedSaveBlur: {
    flex: 1,
  },
  fixedSaveGradient: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16, // Extra padding for iOS home indicator
    paddingHorizontal: 20,
  },
  saveButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primarySaveButton: {
    flex: 2,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  secondarySaveButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#CBD5E1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonBlur: {
    flex: 1,
    borderRadius: 18,
  },
  primarySaveGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  secondarySaveGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primarySaveText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  secondarySaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});