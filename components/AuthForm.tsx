'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Globe,
  Camera,
  Heart,
  GraduationCap,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { getUniversities } from '@/contexts/university.api';
import UniversityDropdown from './UniversityDropdown';
import Location from './Location';

import { Picker } from '@react-native-picker/picker';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

//@ts-ignore
import logo from '../assets/logo.png';
import { uploadFile } from '@/contexts/file.api';
import TermsModal from './TermsModal';

const { width, height } = Dimensions.get('window');

export const ETHNICITY_OPTIONS = [
  'Asian',
  'Black/African American',
  'Hispanic/Latino',
  'White/Caucasian',
  'Native American',
  'Pacific Islander',
  'Middle Eastern',
  'Mixed/Multiracial',
];

export const INTERESTS_OPTIONS = [
  'Technology',
  'Sports',
  'Music',
  'Art',
  'Reading',
  'Gaming',
  'Travel',
  'Cooking',
  'Photography',
  'Fitness',
  'Politics',
  'Dance',
];

export const MAJOR_OPTIONS = [
  'Accounting',
  'Art',
  'Biology',
  'Business',
  'Chemistry',
  'Communications',
  'Computer Science',
  'Economics',
  'Education',
  'Engineering',
  'English',
  'History',
  'Law',
  'Marketing',
  'Mathematics',
  'Medicine',
  'Nursing',
  'Physics',
  'Political Science',
  'Psychology',
  'Sociology',
  'Other',
];

export const CLASS_YEAR_OPTIONS = [
  '2026 Senior',
  '2027 Junior',
  '2028 Sophomore',
  '2029 Freshman',
  'Graduate',
];

interface AuthFormProps {
  initialMode?: 'login' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1 - Basic Information (Required fields)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [classYear, setClassYear] = useState('');

  // Step 2 - Profile Information (Optional fields)
  const [profilePicture, setProfilePicture] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [ethnicity, setEthnicity] = useState<string[]>([]);
  const [location, setLocation] = useState({
    city: '',
    state: '',
  });
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [bio, setBio] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // Legal checkboxes
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const majorPickerRef = useRef<Picker<string>>(null);
  const classYearPickerRef = useRef<Picker<string>>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const uploadFileMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
      setProfilePicture(data.url);
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
    },
  });

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Sorry, we need camera roll permissions to make this work!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        uploadFileMutation.mutate({
          uri: asset.uri,
          type: asset.type,
          mimeType: asset.mimeType,
          fileName: asset.fileName || 'profile_image.jpg',
        });
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', `Failed to pick image: ${error.message}`);
    }
  };

  const renderProfilePictureInput = () => {
    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <Text style={styles.inputLabel}>Add a profile picture (optional)</Text>

        {!profilePicture && !uploadFileMutation.isPending && (
          <TouchableOpacity
            style={[styles.profilePicturePlaceholder]}
            onPress={pickImage}
            disabled={loading || uploadFileMutation.isPending}
          >
            <View style={styles.profilePlaceholderContent}>
              <Camera size={32} color="#9CA3AF" />
            </View>
            <View style={styles.addIconContainer}>
              <Plus size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {(profilePicture || uploadFileMutation.isPending) && (
          <View style={styles.profilePreview}>
            {uploadFileMutation.isPending ? (
              <View style={styles.profilePreviewLoading}>
                <ActivityIndicator size="small" color="#6366F1" />
                <Text style={styles.loadingImageText}>Uploading...</Text>
              </View>
            ) : (
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: profilePicture }}
                  style={styles.profileImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeProfileImage}
                  disabled={loading || uploadFileMutation.isPending}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  const removeProfileImage = () => {
    setProfilePicture('');
  };

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: getUniversities,
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  const openLegalModal = (type: 'terms' | 'privacy') => {
    setModalType(type);
    setShowModal(true);
  };

  const closeLegalModal = (): void => {
    setShowModal(false);
    setModalType(null);
  };

  const [isSignup, setIsSignup] = useState(initialMode === 'signup');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [fieldValidation, setFieldValidation] = useState<
    Record<string, boolean>
  >({});

  const { login, signup } = useAuth();
  const router = useRouter();

  // Animation values
  const headerScale = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(1);
  const switchScale = useSharedValue(0);
  const particleOpacity = useSharedValue(0);
  const backgroundRotation = useSharedValue(0);

  useEffect(() => {
    // Entry animations
    headerOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    headerScale.value = withDelay(
      200,
      withSpring(1, { damping: 15, stiffness: 100 })
    );

    formOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    formTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 15, stiffness: 120 })
    );

    switchScale.value = withDelay(
      1000,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    particleOpacity.value = withDelay(1200, withTiming(1, { duration: 1000 }));

    backgroundRotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    formTranslateY.value = withSequence(
      withTiming(20, { duration: 200 }),
      withTiming(0, { duration: 400 })
    );
  }, [isSignup]);

  const validateField = (field: string, value: any): boolean => {
    let isValid = false;

    switch (field) {
      case 'email':
        isValid =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.includes('.edu');
        break;
      case 'password':
        isValid = value.length >= 8;
        break;
      case 'confirmPassword':
        isValid = value === password;
        break;
      case 'firstName':
      case 'lastName':
        isValid = value.length >= 2;
        break;
      case 'university':
        isValid = value.length >= 2;
        break;
      case 'major':
      case 'classYear':
        isValid = value.length > 0;
        break;
      case 'dateOfBirth':
        isValid = /^\d{4}-\d{2}-\d{2}$/.test(value);
        break;
      case 'termsAccepted':
      case 'privacyAccepted':
        isValid = value === true;
        break;
      default:
        isValid = true;
    }

    setFieldValidation((prev) => ({ ...prev, [field]: isValid }));
    return isValid;
  };

  const handleSubmit = async (): Promise<void> => {
    if (isSignup && currentStep === 1) {
      // Validate step 1 fields
      const step1Valid = [
        validateField('firstName', firstName),
        validateField('lastName', lastName),
        validateField('dateOfBirth', dateOfBirth),
        validateField('email', email),
        validateField('university', university),
        validateField('password', password),
        validateField('confirmPassword', confirmPassword),
      ].every(Boolean);

      if (step1Valid) {
        setCurrentStep(2);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        return;
      } else {
        setError('Please fill in all required fields correctly.');
        return;
      }
    }

    if (isSignup && currentStep === 2) {
      if (!termsAccepted || !privacyAccepted) {
        setError('You must accept the Terms & Conditions and Privacy Policy.');
        return;
      }
    }

    setError('');
    setLoading(true);

    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    try {
      if (isSignup) {
        const signupData = {
          firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
          lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
          email,
          password,
          confirmPassword,
          dateOfBirth,
          classYear,
          major,
          university,
          countryOfOrigin,
          profilePicture,
          pronouns,
          ethnicity,
          city: location.city,
          state: location.state,
          languagesSpoken,
          interests: selectedInterests,
          bio,
          termsAccepted,
          privacyAccepted,
          marketingOptIn,
        };

        console.log('Signup data:', signupData);
        await signup(signupData);
      } else {
        const loginData = { email, password };
        console.log('Login data:', loginData);
        await login(email, password);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.log(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (): void => {
    setIsSignup(!isSignup);
    setCurrentStep(1);
    setError('');
    // Reset all fields
    setFirstName('');
    setLastName('');
    setUniversity('');
    setMajor('');
    setClassYear('');
    setDateOfBirth('');
    setCountryOfOrigin('');
    setProfilePicture('');
    setPronouns('');
    setEthnicity([]);
    setLocation({ city: '', state: '' });
    setLanguagesSpoken([]);
    setSelectedInterests([]);
    setCustomInterest('');
    setBio('');
    setConfirmPassword('');
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setMarketingOptIn(false);
  };

  const toggleEthnicity = (option: string): void => {
    setEthnicity((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const toggleInterest = (interest: string): void => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const addCustomInterest = (): void => {
    if (
      customInterest.trim() &&
      !selectedInterests.includes(customInterest.trim())
    ) {
      setSelectedInterests((prev) => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const addLanguage = (language: string): void => {
    if (language.trim() && !languagesSpoken.includes(language.trim())) {
      setLanguagesSpoken((prev) => [...prev, language.trim()]);
    }
  };

  const removeLanguage = (language: string): void => {
    setLanguagesSpoken((prev) => prev.filter((lang) => lang !== language));
  };

  const renderAnimatedInput = useCallback(
    (
      icon: React.ElementType,
      label: string,
      value: string,
      onChangeText: (text: string) => void,
      placeholder: string,
      inputKey: string,
      options: object = {}
    ) => {
      const isValid = fieldValidation[inputKey];
      const isFocused = focusedInput === inputKey;

      return (
        <Animated.View
          style={[styles.inputContainer, { opacity: formOpacity }]}
        >
          <Text style={styles.inputLabel}>{label}</Text>
          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
              isValid === true && styles.inputWrapperValid,
              isValid === false && value && styles.inputWrapperInvalid,
            ]}
          >
            <View style={styles.inputIcon}>
              {React.createElement(icon, {
                size: 20,
                color: isFocused
                  ? '#6366F1'
                  : isValid === true
                  ? '#10B981'
                  : isValid === false && value
                  ? '#EF4444'
                  : '#9CA3AF',
              })}
            </View>

            <TextInput
              style={styles.input}
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
              editable={!loading}
              placeholderTextColor="#9CA3AF"
              {...options}
            />
            {inputKey === 'password' && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            )}

            {inputKey === 'confirmPassword' && (
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            )}

            {isValid === true && value && (
              <View style={styles.validIcon}>
                <CheckCircle size={16} color="#10B981" />
              </View>
            )}

            {isValid === false && value && (
              <View style={styles.validIcon}>
                <AlertCircle size={16} color="#EF4444" />
              </View>
            )}
          </View>

          {isValid === false && value && (
            <Text style={styles.validationText}>
              {inputKey === 'email' &&
                'Please enter a valid college email address (.edu)'}
              {inputKey === 'password' &&
                'Password must be at least 8 characters'}
              {inputKey === 'confirmPassword' && 'Passwords do not match'}
              {inputKey === 'firstName' &&
                'First name must be at least 2 characters'}
              {inputKey === 'lastName' &&
                'Last name must be at least 2 characters'}
              {inputKey === 'university' && 'University name is required'}
              {inputKey === 'dateOfBirth' &&
                'Please enter date in YYYY-MM-DD format'}
            </Text>
          )}
        </Animated.View>
      );
    },
    [
      fieldValidation,
      focusedInput,
      loading,
      password,
      showConfirmPassword,
      showPassword,
      formOpacity,
    ]
  );

const renderPickerInput = useCallback(
  (
    icon: React.ElementType,
    label: string,
    selectedValue: string,
    onValueChange: (value: string) => void,
    placeholder: string,
    items: { label: string; value: string }[],
    inputKey: string,
    pickerRef: React.RefObject<Picker<string>>
  ) => {
    const isValid = fieldValidation[inputKey];
    const isFocused = focusedInput === inputKey;

    const handleInputPress = () => {
      if (!loading && pickerRef.current) {
        setFocusedInput(inputKey);
        // Focus the picker to trigger it programmatically
        pickerRef.current.focus();
      }
    };

    const handlePickerChange = (itemValue: string) => {
      if (itemValue && itemValue !== '') {
        onValueChange(itemValue);
        validateField(inputKey, itemValue);
      }
      setFocusedInput('');
    };

    const displayValue = selectedValue ? 
      items.find(item => item.value === selectedValue)?.label || selectedValue 
      : placeholder;

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        
        <View style={{ position: 'relative' }}>
          {/* Clickable overlay */}
          <TouchableOpacity
            onPress={handleInputPress}
            disabled={loading}
            activeOpacity={0.7}
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
              isValid === true && styles.inputWrapperValid,
              isValid === false && selectedValue && styles.inputWrapperInvalid,
              { paddingHorizontal: 0, paddingLeft: 16, paddingRight: 16 },
            ]}
          >
            <View style={styles.inputIcon}>
              {React.createElement(icon, {
                size: 20,
                color: isFocused
                  ? '#6366F1'
                  : isValid === true
                  ? '#10B981'
                  : isValid === false && selectedValue
                  ? '#EF4444'
                  : '#9CA3AF',
              })}
            </View>
            
            {/* Display selected value or placeholder */}
            <View style={styles.pickerDisplayContainer}>
              <Text
                style={[
                  styles.pickerDisplayText,
                  !selectedValue && styles.pickerPlaceholderText,
                ]}
              >
                {displayValue}
              </Text>
            </View>
            
            {/* Dropdown arrow */}
            <View style={styles.dropdownArrow}>
              <Text style={styles.dropdownArrowText}>▼</Text>
            </View>
          </TouchableOpacity>

          {/* Hidden Picker - always rendered but invisible */}
          <Picker
            ref={pickerRef}
            selectedValue={selectedValue}
            onValueChange={handlePickerChange}
            style={[
              styles.picker, 
              { 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                zIndex: -1
              }
            ]}
            enabled={!loading}
            prompt={label}
            mode="dropdown"
          >
            <Picker.Item
              label={placeholder}
              value=""
              enabled={false}
              color="#9CA3AF"
            />
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    );
  },
  [fieldValidation, focusedInput, loading]
);

  const renderBreadcrumb = () => {
    if (!isSignup) return null;

    return (
      <Animated.View
        style={[styles.breadcrumbContainer, { opacity: formOpacity }]}
      >
        <View style={styles.breadcrumbStep}>
          <View
            style={[
              styles.breadcrumbCircle,
              currentStep >= 1 && styles.breadcrumbCircleActive,
            ]}
          >
            <Text
              style={[
                styles.breadcrumbText,
                currentStep >= 1 && styles.breadcrumbTextActive,
              ]}
            >
              1
            </Text>
          </View>
          <Text
            style={[
              styles.breadcrumbLabel,
              currentStep === 1 && styles.breadcrumbLabelActive,
            ]}
          >
            Basic Info
          </Text>
        </View>

        <View style={styles.breadcrumbLine} />

        <View style={styles.breadcrumbStep}>
          <View
            style={[
              styles.breadcrumbCircle,
              currentStep >= 2 && styles.breadcrumbCircleActive,
            ]}
          >
            <Text
              style={[
                styles.breadcrumbText,
                currentStep >= 2 && styles.breadcrumbTextActive,
              ]}
            >
              2
            </Text>
          </View>
          <Text
            style={[
              styles.breadcrumbLabel,
              currentStep === 2 && styles.breadcrumbLabelActive,
            ]}
          >
            Profile
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderPronounsDropdown = () => {
    const pronounOptions = ['she/her', 'he/him', 'they/them', 'other'];
    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <Text style={styles.sectionTitle}>Pronouns</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollView}>
          <View style={styles.dropdownContainer}>
            {pronounOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.dropdownOption, pronouns === option && styles.dropdownOptionSelected]}
                onPress={() => setPronouns(option)}
              >
                <Text style={[styles.dropdownOptionText, pronouns === option && styles.dropdownOptionTextSelected]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {pronouns === 'other' && (
          <TextInput
            style={styles.customInterestInput}
            placeholder="Please specify your pronouns"
            onChangeText={setPronouns}
            autoFocus
          />
        )}
      </Animated.View>
    );
  };

  const renderEthnicitySelection = () => {
    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <View style={styles.ethnicityHeader}>
          <Heart size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Ethnicity & Background</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Help us build inclusive communities and celebrate diversity
        </Text>
        <View style={styles.checkboxContainer}>
          {ETHNICITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.checkboxRow}
              onPress={() => toggleEthnicity(option)}
            >
              <View
                style={[
                  styles.checkbox,
                  ethnicity.includes(option) && styles.checkboxSelected,
                ]}
              >
                {ethnicity.includes(option) && (
                  <CheckCircle size={16} color="#6366F1" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderLanguagesSpoken = () => {
    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <View style={styles.languagesHeader}>
          <Globe size={20} color="#10B981" />
          <Text style={[styles.inputLabel, { marginLeft: 10, fontSize: 16 }]}>
            Languages Spoken
          </Text>
        </View>

        <View style={styles.languageInputContainer}>
          <TextInput
            style={styles.languageInput}
            placeholder="Add a language (e.g., Nepali, Hindi)"
            value={newLanguage}
            onChangeText={setNewLanguage}
            onSubmitEditing={() => {
              if (newLanguage.trim()) {
                addLanguage(newLanguage);
                setNewLanguage('');
              }
            }}
          />
          <TouchableOpacity
            style={styles.addLanguageButton}
            onPress={() => {
              if (newLanguage.trim()) {
                addLanguage(newLanguage);
                setNewLanguage('');
              }
            }}
          >
            <Text style={styles.addLanguageButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.languageTagsContainer}>
          {languagesSpoken.map((language, index) => (
            <View key={index} style={styles.languageTag}>
              <Text style={styles.languageTagText}>{language}</Text>
              <TouchableOpacity
                onPress={() => removeLanguage(language)}
                style={styles.removeLanguageButton}
              >
                <X size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderInterestsAndHobbies = () => {
    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <View style={styles.interestsHeader}>
          <Heart size={20} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Interests & Hobbies</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Select your interests to connect with like-minded peers
        </Text>

        <View style={styles.interestsGrid}>
          {INTERESTS_OPTIONS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestTag,
                selectedInterests.includes(interest) &&
                  styles.interestTagSelected,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text
                style={[
                  styles.interestTagText,
                  selectedInterests.includes(interest) &&
                    styles.interestTagTextSelected,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
          {/* Display custom interests that are not in the default options */}
          {selectedInterests
            .filter((interest) => !INTERESTS_OPTIONS.includes(interest))
            .map((interest, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.interestTag, styles.interestTagSelected]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[styles.interestTagText, styles.interestTagTextSelected]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        <View style={styles.customInterestContainer}>
          <TextInput
            style={styles.customInterestInput}
            placeholder="Add custom interest..."
            value={customInterest}
            onChangeText={setCustomInterest}
            onSubmitEditing={addCustomInterest}
          />
          <TouchableOpacity
            style={styles.addInterestButton}
            onPress={addCustomInterest}
          >
            <Text style={styles.addInterestButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderBioSection = () => {
    const maxLength = 500;

    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <Text style={styles.inputLabel}>Tell us about yourself</Text>
        <View style={styles.bioContainer}>
          <TextInput
            style={styles.bioInput}
            placeholder="Share a bit about yourself, your goals, what you're looking for in connections..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            maxLength={maxLength}
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.characterCount}>
          {bio.length}/{maxLength} characters
        </Text>
      </Animated.View>
    );
  };

  const renderLegalCheckboxes = () => {
    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => {
            setTermsAccepted(!termsAccepted);
            validateField('termsAccepted', !termsAccepted);
          }}
        >
          <View
            style={[styles.checkbox, termsAccepted && styles.checkboxSelected]}
          >
            {termsAccepted && <CheckCircle size={16} color="#6366F1" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I accept the{' '}
            <Text
              style={styles.linkText}
              onPress={() => openLegalModal('terms')}
            >
              Terms & Conditions
            </Text>{' '}
            *
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => {
            setPrivacyAccepted(!privacyAccepted);
            validateField('privacyAccepted', !privacyAccepted);
          }}
        >
          <View
            style={[
              styles.checkbox,
              privacyAccepted && styles.checkboxSelected,
            ]}
          >
            {privacyAccepted && <CheckCircle size={16} color="#6366F1" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I accept the{' '}
            <Text
              style={styles.linkText}
              onPress={() => openLegalModal('privacy')}
            >
              Privacy Policy
            </Text>{' '}
            *
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setMarketingOptIn(!marketingOptIn)}
        >
          <View
            style={[styles.checkbox, marketingOptIn && styles.checkboxSelected]}
          >
            {marketingOptIn && <CheckCircle size={16} color="#6366F1" />}
          </View>
          <Text style={styles.checkboxLabel}>
            Send me updates about events and news (Notification/Marketing
            Opt-In)
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderDateOfBirthPicker = () => {
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    const onDateChange = (event: any, selectedDate?: Date): void => {
      const currentDate = selectedDate || new Date();
      setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
      setSelectedDate(currentDate);
      setDateOfBirth(formatDate(currentDate));
      validateField('dateOfBirth', formatDate(currentDate));
    };

    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <Text style={styles.inputLabel}>Date of Birth *</Text>
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            fieldValidation['dateOfBirth'] === true && styles.inputWrapperValid,
            fieldValidation['dateOfBirth'] === false &&
              dateOfBirth &&
              styles.inputWrapperInvalid,
          ]}
          onPress={() => setShowDatePicker(true)}
          disabled={loading}
        >
          <View style={styles.inputIcon}>
            <Calendar size={20} color={dateOfBirth ? '#6366F1' : '#9CA3AF'} />
          </View>
          <Text
            style={[
              styles.input,
              { color: dateOfBirth ? '#111827' : '#9CA3AF' },
            ]}
          >
            {dateOfBirth || 'Select your date of birth'}
          </Text>
          {fieldValidation['dateOfBirth'] === true && dateOfBirth && (
            <View style={styles.validIcon}>
              <CheckCircle size={16} color="#10B981" />
            </View>
          )}
          {fieldValidation['dateOfBirth'] === false && dateOfBirth && (
            <View style={styles.validIcon}>
              <AlertCircle size={16} color="#EF4444" />
            </View>
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()} // Prevent future dates
            minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
          />
        )}

        {fieldValidation['dateOfBirth'] === false && dateOfBirth && (
          <Text style={styles.validationText}>
            Please select a valid date of birth
          </Text>
        )}
      </Animated.View>
    );
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const switchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: switchScale.value }],
  }));

  const particleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${backgroundRotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Animated.View style={[styles.backgroundContainer]}>
        <View style={styles.backgroundGradient} />
      </Animated.View>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            {isSignup ?
              <Text style={styles.subtitle}>
                Connect with peers who share your interests and background
              </Text>
              : <>
                  <Image source={logo} style={styles.logo} />
                  <Text style={styles.title}>Welcome Back!</Text>
                </>
            }
          </Animated.View>

          {renderBreadcrumb()}

          {/* Error Message */}
          {error ? (
            <Animated.View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Form */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <BlurView intensity={20} style={styles.formBlur}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.95)',
                  'rgba(248, 250, 252, 0.9)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.formGradient}
              >
                {/* Login Form */}
                {!isSignup && (
                  <>
                    {renderAnimatedInput(
                      Mail,
                      'Email',
                      email,
                      setEmail,
                      'Enter your email',
                      'email',
                      {
                        keyboardType: 'email-address',
                        autoCapitalize: 'none',
                        autoComplete: 'email',
                        autoCorrect: false,
                      }
                    )}

                    {renderAnimatedInput(
                      Lock,
                      'Password',
                      password,
                      setPassword,
                      'Enter your password',
                      'password',
                      {
                        secureTextEntry: !showPassword,
                        autoComplete: 'password',
                        autoCorrect: false,
                      }
                    )}

                    <View style={styles.extraLinksContainer}>
                      <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                        <Text style={styles.linkText}>Forgot Password?</Text>
                      </TouchableOpacity>
                      {/* <TouchableOpacity
                        onPress={() => router.push(email ? `/(auth)/verify?email=${email}` : '/(auth)/verify')}
                      >
                        <Text style={styles.linkText}>Verify Account</Text>
                      </TouchableOpacity> */}
                    </View>
                  </>
                )}

                {isSignup && currentStep === 1 && (
                  <>
                    {renderProfilePictureInput()}

                    {renderAnimatedInput(
                      User,
                      'First Name *',
                      firstName,
                      setFirstName,
                      'John',
                      'firstName',
                      {
                        autoCapitalize: 'words',
                        autoComplete: 'given-name',
                      }
                    )}

                    {renderAnimatedInput(
                      User,
                      'Last Name *',
                      lastName,
                      setLastName,
                      'Doe',
                      'lastName',
                      {
                        autoCapitalize: 'words',
                        autoComplete: 'family-name',
                      }
                    )}

                    {/* {renderAnimatedInput(
                      Calendar,
                      'Date of Birth *',
                      dateOfBirth,
                      setDateOfBirth,
                      'YYYY-MM-DD',
                      'dateOfBirth',
                      {
                        placeholder: 'YYYY-MM-DD',
                        maxLength: 10,
                      }
                    )} */}

                    {renderDateOfBirthPicker()}

                    {renderAnimatedInput(
                      Mail,
                      'College Email Address *',
                      email,
                      setEmail,
                      'john.doe@university.edu',
                      'email',
                      {
                        keyboardType: 'email-address',
                        autoCapitalize: 'none',
                        autoComplete: 'email',
                        autoCorrect: false,
                      }
                    )}

                    <Animated.View
                      style={[{ opacity: formOpacity, zIndex: 100 }]}
                    >
                      <UniversityDropdown
                        universities={universities?.data || []}
                        value={university}
                        onValueChange={setUniversity}
                        label="College/University *"
                        placeholder="Search for your college..."
                        isValid={fieldValidation['university']}
                        isFocused={focusedInput === 'university'}
                        onFocus={() => setFocusedInput('university')}
                        onBlur={() => {
                          setFocusedInput('');
                          if (university)
                            validateField('university', university);
                        }}
                        loading={loading}
                      />
                    </Animated.View>

                    {renderPickerInput(
                      GraduationCap,
                      'Major/Field of Study *',
                      major,
                      setMajor,
                      'Select your major',
                      MAJOR_OPTIONS.map((m) => ({ label: m, value: m })),
                      'major',
                      majorPickerRef
                    )}

                    {renderPickerInput(
                      Calendar,
                      'Expected Graduation Year *',
                      classYear,
                      setClassYear,
                      'Select your class year',
                      CLASS_YEAR_OPTIONS.map((y) => ({ label: y, value: y })),
                      'classYear',
                      classYearPickerRef
                    )}

                    {renderAnimatedInput(
                      Globe,
                      'Country of Origin',
                      countryOfOrigin,
                      setCountryOfOrigin,
                      'e.g., Nepal',
                      'countryOfOrigin'
                    )}

                    {renderAnimatedInput(
                      Lock,
                      'Password *',
                      password,
                      setPassword,
                      'Enter your password',
                      'password',
                      {
                        secureTextEntry: !showPassword,
                        autoComplete: 'password',
                        autoCorrect: false,
                      }
                    )}

                    {renderAnimatedInput(
                      Lock,
                      'Confirm Password *',
                      confirmPassword,
                      setConfirmPassword,
                      '••••••••',
                      'confirmPassword',
                      {
                        secureTextEntry: !showConfirmPassword,
                        autoComplete: 'password',
                        autoCorrect: false,
                      }
                    )}
                  </>
                )}

                {isSignup && currentStep === 2 && (
                  <>
                    {renderPronounsDropdown()}

                    {renderEthnicitySelection()}

                    <Location
                      selectedState={location.state}
                      selectedCity={location.city}
                      onStateChange={(state) =>
                        setLocation((prev) => ({ ...prev, state }))
                      }
                      onCityChange={(city) =>
                        setLocation((prev) => ({ ...prev, city }))
                      }
                      isValid={{
                        state: fieldValidation.state,
                        city: fieldValidation.city,
                      }}
                      isFocused={{
                        state: focusedInput === 'state',
                        city: focusedInput === 'city',
                      }}
                      onFocus={(field) => setFocusedInput(field)}
                      onBlur={() => setFocusedInput('')}
                      loading={loading}
                    />

                    {renderLanguagesSpoken()}

                    {renderInterestsAndHobbies()}

                    {renderBioSection()}

                    {renderLegalCheckboxes()}
                  </>
                )}
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Navigation Buttons */}
          <Animated.View style={buttonAnimatedStyle}>
            {isSignup && currentStep === 2 && (
              <TouchableOpacity
                style={[styles.secondaryButton]}
                onPress={() => setCurrentStep(1)}
                disabled={loading}
              >
                <View style={styles.buttonContent}>
                  <ArrowLeft size={16} color="#6366F1" />
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  loading
                    ? ['#CBD5E1', '#94A3B8']
                    : ['#8B5CF6', '#6366F1', '#3B82F6']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>
                      {!isSignup
                        ? 'Sign In'
                        : currentStep === 1
                        ? 'Continue'
                        : currentStep === 2
                        ? 'Complete Registration'
                        : 'Create Account'}
                    </Text>
                    <View style={styles.buttonIcon}>
                      {!isSignup || currentStep === 2 ? (
                        <Sparkles size={16} color="white" />
                      ) : (
                        <ArrowRight size={16} color="white" />
                      )}
                    </View>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* {isSignup && currentStep === 2 && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  // Skip profile setup and proceed with basic info only
                  if (!termsAccepted || !privacyAccepted) {
                    setError("You must accept the Terms & Conditions and Privacy Policy.")
                    return
                  }
                  handleSubmit()
                }}
                disabled={loading}
              >
                <Text style={styles.skipButtonText}>Skip & Join</Text>
              </TouchableOpacity>
            )} */}
          </Animated.View>

          {/* Switch Container */}
          <Animated.View style={[styles.switchContainer, switchAnimatedStyle]}>
            <BlurView intensity={10} style={styles.switchBlur}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.8)',
                  'rgba(248, 250, 252, 0.6)',
                ]}
                style={styles.switchGradient}
              >
                <Text style={styles.switchLabel}>
                  {isSignup
                    ? 'Already have an account?'
                    : "Don't have an account?"}
                </Text>
                <TouchableOpacity
                  onPress={toggleMode}
                  disabled={loading}
                  style={styles.switchButton}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[
                      'rgba(99, 102, 241, 0.1)',
                      'rgba(139, 92, 246, 0.1)',
                    ]}
                    style={styles.switchButtonGradient}
                  >
                    <Text style={styles.switchButtonText}>
                      {isSignup ? 'Sign In' : 'Sign Up'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
            {showModal && (
              <TermsModal
                isVisible={showModal}
                modalType={modalType}
                onClose={closeLegalModal}
              />
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  horizontalScrollView: {
    marginBottom: 10,
  },

 pickerDisplayContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 12,
  },
  pickerDisplayText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerPlaceholderText: {
    color: '#9CA3AF',
  },
  dropdownArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 8,
  },
  dropdownArrowText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  extraLinksContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },

  picker: {
    flex: 1,
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      ios: {
        // iOS specific styles if needed
      },
      android: {
        color: '#111827',
        marginVertical: -8, // Adjust vertical alignment on Android
      },
    }),
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  breadcrumbStep: {
    alignItems: 'center',
  },
  breadcrumbCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  breadcrumbCircleActive: {
    backgroundColor: '#6366F1',
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  breadcrumbTextActive: {
    color: '#FFFFFF',
  },
  breadcrumbLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  breadcrumbLabelActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  breadcrumbLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },

  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight:'600'
  },

  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  profilePlaceholderContent: {
    alignItems: 'center',
    position: 'relative',
  },
  addIconContainer: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#6366F1',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  ethnicityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  languagesHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  interestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 5,
    gap: 8,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dropdownOptionTextSelected: {
    color: '#6366F1',
    fontWeight: '500',
  },

  languageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginRight: 8,
  },
  addLanguageButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addLanguageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  languageTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  languageTagText: {
    fontSize: 14,
    color: '#059669',
    marginRight: 6,
  },
  removeLanguageButton: {
    padding: 2,
  },

  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  interestTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  interestTagSelected: {
    backgroundColor: '#F59E0B',
  },
  interestTagText: {
    fontSize: 14,
    color: '#D97706',
  },
  interestTagTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  interestTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  interestTagWrapper: {
    // This wrapper can be used for additional styling if needed
  },

  customInterestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customInterestInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginRight: 8,
  },
  addInterestButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addInterestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  bioContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 12,
    paddingTop: 0,
  },
  bioInput: {
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },

  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },

  // ... existing styles continue unchanged ...
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    borderRadius: 16,
  },
  uploadingBlur: {
    flex: 1,
    borderRadius: 16,
  },
  uploadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  uploadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  imagePreviewLoading: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  loadingImageText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadButton: {
    marginBottom: 12,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(63, 63, 63, 0.8)',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  formBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  formGradient: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapperValid: {
    borderColor: '#10B981',
  },
  inputWrapperInvalid: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  validIcon: {
    marginLeft: 8,
  },
  validationText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxContainer: {
    gap: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#F3F4F6',
    borderColor: '#6366F1',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  linkText: {
    color: '#6366F1',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: 'white',
    paddingVertical: 16,
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  switchContainer: {
    marginTop: 20,
  },
  switchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  switchGradient: {
    padding: 20,
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  switchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  switchButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  addImageButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
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
  addImageButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePreview: {
    marginTop: 12,
    alignItems: 'center',
  },
  profilePreviewLoading: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default AuthForm;
