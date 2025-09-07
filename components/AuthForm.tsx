'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Users,
  Heart,
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

import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image } from 'react-native';
import { Plus, X, ImageIcon } from 'lucide-react-native'; // Add ImageIcon import

//@ts-ignore
import logo from '../assets/logo.png';
import { uploadFile } from '@/contexts/file.api';
import TermsModal from './TermsModal';

const { width, height } = Dimensions.get('window');

const ETHNICITY_OPTIONS = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Middle Eastern or North African',
  'Mixed Race',
  'Other',
  'Prefer not to say',
];

interface AuthFormProps {
  initialMode?: 'login' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Step 1 - Required fields
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [university, setUniversity] = useState<string>('');
  const [classYear, setClassYear] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');

  // Step 2 - Optional profile fields
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [pronouns, setPronouns] = useState<string>('');
  const [ethnicity, setEthnicity] = useState<string[]>([]);
  const [countryOfOrigin, setCountryOfOrigin] = useState<string>('');
  const [location, setLocation] = useState<{ city: string; state: string }>({
    city: '',
    state: '',
  });
  const [languagesSpoken, setLanguagesSpoken] = useState<string>('');
  const [interests, setInterests] = useState<string>('');

  // Legal checkboxes
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(false);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const uploadFileMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
      setProfilePicture(data.url); // Set the uploaded image URL to profilePicture
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
        aspect: [1, 1], // Square aspect for profile pictures
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        console.log('Asset details:', asset);

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
    console.log(profilePicture)
    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <Text style={styles.inputLabel}>Profile Picture</Text>

        {/* Show upload options only if no profile picture is set */}
        {!profilePicture && !uploadFileMutation.isPending && (
          <TouchableOpacity
            style={[
              styles.uploadButton,
              uploadFileMutation.isPending && styles.uploadButtonDisabled,
            ]}
            onPress={pickImage}
            disabled={loading || uploadFileMutation.isPending}
          >
            <LinearGradient
              colors={
                uploadFileMutation.isPending
                  ? ['#9CA3AF', '#6B7280']
                  : ['#6366F1', '#8B5CF6']
              }
              style={styles.uploadButtonGradient}
            >
              <View style={styles.buttonContent}>
                <ImageIcon size={20} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Profile Picture Preview */}
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

  // Add function to remove image
  const removeProfileImage = () => {
    setProfilePicture('');
  };

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: getUniversities,
  });


  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null)

  const openLegalModal = (type: "terms" | "privacy") => {
    setModalType(type)
    setShowModal(true)
  }

  const closeLegalModal = () => {
    setShowModal(false)
    setModalType(null)
  }

  const [isSignup, setIsSignup] = useState<boolean>(initialMode === 'signup');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [fieldValidation, setFieldValidation] = useState<{
    [key: string]: boolean;
  }>({});

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

    // Continuous background rotation
    backgroundRotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1, // infinite repeat
      false
    );
  }, []);

  useEffect(() => {
    // Mode switch animation
    formTranslateY.value = withSequence(
      withTiming(20, { duration: 200 }),
      withTiming(0, { duration: 400 })
    );
  }, [isSignup]);

  const validateField = (field: string, value: string | string[] | boolean) => {
    let isValid = false;

    switch (field) {
      case 'email':
        isValid =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string) &&
          (value as string).includes('.edu'); // College email validation
        break;
      case 'password':
        isValid = (value as string).length >= 8;
        break;
      case 'confirmPassword':
        isValid = value === password;
        break;
      case 'firstName':
      case 'lastName':
        isValid = (value as string).length >= 2;
        break;
      case 'university':
        isValid = (value as string).length >= 2;
        break;
      case 'dateOfBirth':
        isValid = /^\d{4}-\d{2}-\d{2}$/.test(value as string);
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

  const handleSubmit = async () => {
    if (isSignup && currentStep === 1) {
      // Validate step 1 fields
      const step1Valid = [
        validateField('firstName', firstName),
        validateField('lastName', lastName),
        validateField('email', email),
        validateField('password', password),
        validateField('confirmPassword', confirmPassword),
        validateField('university', university),
        validateField('classYear', classYear),
        validateField('dateOfBirth', dateOfBirth),
      ].every(Boolean);

      if (step1Valid) {
        setCurrentStep(2);
        return;
      } else {
        setError('Please fill in all required fields correctly.');
        return;
      }
    }

    if (isSignup && currentStep === 2) {
      // Validate legal checkboxes
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
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          dateOfBirth,
          classYear,
          university,
          profilePicture,
          pronouns,
          ethnicity,
          countryOfOrigin,
          city: location.city,
          state: location.state,
          languagesSpoken: languagesSpoken
            .split(',')
            .map((lang) => lang.trim())
            .filter(Boolean),
          interests: interests
            .split(',')
            .map((interest) => interest.trim())
            .filter(Boolean),
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

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setCurrentStep(1);
    setError('');
    // Reset all fields
    setFirstName('');
    setLastName('');
    setUniversity('');
    setClassYear('');
    setDateOfBirth('');
    setProfilePicture('');
    setPronouns('');
    setEthnicity([]);
    setCountryOfOrigin('');
    setLocation({ city: '', state: '' });
    setLanguagesSpoken('');
    setInterests('');
    setConfirmPassword('');
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setMarketingOptIn(false);
  };

  const toggleEthnicity = (option: string) => {
    setEthnicity((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const renderAnimatedInput = useCallback(
    (
      icon: any,
      label: string,
      value: string,
      onChangeText: (text: string) => void,
      placeholder: string,
      inputKey: string,
      options: any = {}
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

            {/* <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
              onChangeText={onChangeText}
            onFocus={() => setFocusedInput(inputKey)}
            onBlur={() => {
              setFocusedInput('');
              if (value) validateField(inputKey, value);
            }}
            editable={!loading}
            placeholderTextColor="#9CA3AF"
            {...options}
          /> */}

            <TextInput
              style={styles.input}
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText} // <-- Just this, no validation
              // onFocus={() => setFocusedInput(inputKey)}
              // onBlur={() => {
              //   setFocusedInput('');
              //   if (value) validateField(inputKey, value); // Validate only when user finishes typing
              // }}
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

  const renderClassYearInput = () => {
    return (
      renderAnimatedInput(
        Calendar,
        'Class Year *',
        classYear,
        setClassYear,
        'e.g., Freshman, 2025',
        'classYear',
        {
          keyboardType: 'default',
        }
      )
    );
  };

  const renderEthnicitySelection = () => {
    return (
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
        <Text style={styles.inputLabel}>Ethnicity (Select all that apply)</Text>
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
              onPress={() => openLegalModal("terms")}
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
              onPress={() => openLegalModal("privacy")}
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
            Send me updates about events and news
          </Text>
        </TouchableOpacity>
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
      {/* Background */}
      <Animated.View style={[styles.backgroundContainer]}>
        <View style={styles.backgroundGradient} />
      </Animated.View>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} />
            </View>
            <Text style={styles.title}>
              {isSignup
                ? currentStep === 1
                  ? 'Create Account'
                  : 'Complete Profile'
                : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignup
                ? currentStep === 1
                  ? 'Step 1 of 2: Basic Information'
                  : 'Step 2 of 2: Profile Details (Optional)'
                : 'Sign in to continue'}
            </Text>
          </Animated.View>

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
                  </>
                )}

                {/* Signup Step 1 */}
                {isSignup && currentStep === 1 && (
                  <>
                    {renderAnimatedInput(
                      User,
                      'First Name',
                      firstName,
                      setFirstName,
                      'Enter your first name',
                      'firstName',
                      {
                        autoCapitalize: 'words',
                        autoComplete: 'given-name',
                      }
                    )}

                    {renderAnimatedInput(
                      User,
                      'Last Name',
                      lastName,
                      setLastName,
                      'Enter your last name',
                      'lastName',
                      {
                        autoCapitalize: 'words',
                        autoComplete: 'family-name',
                      }
                    )}

                    {renderAnimatedInput(
                      Mail,
                      'College Email',
                      email,
                      setEmail,
                      'Enter your college email (.edu)',
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

                    {renderAnimatedInput(
                      Lock,
                      'Confirm Password',
                      confirmPassword,
                      setConfirmPassword,
                      'Confirm your password',
                      'confirmPassword',
                      {
                        secureTextEntry: !showConfirmPassword,
                        autoComplete: 'password',
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
                        label="College / University"
                        placeholder="Search or enter your university name"
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

                    {renderClassYearInput()}

                    {renderAnimatedInput(
                      Calendar,
                      'Date of Birth',
                      dateOfBirth,
                      setDateOfBirth,
                      'YYYY-MM-DD',
                      'dateOfBirth',
                      {
                        placeholder: 'YYYY-MM-DD',
                        maxLength: 10,
                      }
                    )}
                  </>
                )}

                {/* Signup Step 2 */}
                {isSignup && currentStep === 2 && (
                  <>
                    {/* {renderAnimatedInput(
                      Camera,
                      'Profile Picture URL (Optional)',
                      profilePicture,
                      setProfilePicture,
                      'Enter image URL',
                      'profilePicture'
                    )} */}

                    {renderProfilePictureInput()}

                    {renderAnimatedInput(
                      Users,
                      'Pronouns (Optional)',
                      pronouns,
                      setPronouns,
                      'e.g., he/him, she/her, they/them',
                      'pronouns'
                    )}

                    {renderEthnicitySelection()}

                    {renderAnimatedInput(
                      Globe,
                      'Country of Origin (Optional)',
                      countryOfOrigin,
                      setCountryOfOrigin,
                      'Enter your country of origin',
                      'countryOfOrigin'
                    )}

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

                    {renderAnimatedInput(
                      Globe,
                      'Languages Spoken (Optional)',
                      languagesSpoken,
                      setLanguagesSpoken,
                      'e.g., English, Spanish, French',
                      'languagesSpoken'
                    )}

                    {renderAnimatedInput(
                      Heart,
                      'Interests/Hobbies (Optional)',
                      interests,
                      setInterests,
                      'e.g., Music, Sports, Reading',
                      'interests'
                    )}

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
                    : ['#6366F1', '#8B5CF6', '#EC4899']
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
  uploadButtonDisabled: {
    opacity: 0.7,
  },

  // Loading overlay styles
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

  // Loading image placeholder styles
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
    backgroundColor: '#FAFAFA', // Light shade of white
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
    gap: 12,
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
