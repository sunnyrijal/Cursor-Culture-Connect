'use client';

import React, { useState, useEffect } from 'react';
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
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Sparkles,
  CheckCircle,
  AlertCircle,
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
import { useQueries, useQuery } from '@tanstack/react-query';
import { getUniversities } from '@/contexts/university.api';
import UniversityDropdown from './UniversityDropdown';

const { width, height } = Dimensions.get('window');

interface AuthFormProps {
  initialMode?: 'login' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login' }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [university, setUniversity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: getUniversities,
  });

  console.log(universities);

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

  const validateField = (field: string, value: string) => {
    let isValid = false;
    switch (field) {
      case 'email':
        isValid =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.includes('.edu');
        break;

      case 'password':
        isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(
          value
        );
        break;
      case 'fullName':
        isValid = value.trim().length >= 2;
        break;
      case 'mobileNumber':
        isValid = /^([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value);
        break;
      default:
        isValid = value.trim().length > 0;
    }

    setFieldValidation((prev) => ({ ...prev, [field]: isValid }));
    return isValid;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    try {
      if (isSignup) {
        // Prepare signup data
        const signupData = {
          email,
          password,
          confirmPassword,
          fullName,
          university,
          state,
          city,
          mobileNumber,
          // dateOfBirth,
        };

        console.log('Signup data:', signupData);
        await signup(
          fullName,
          email,
          password,
          confirmPassword,
          state,
          city,
          university,
          mobileNumber
        );
      } else {
        // Prepare login data
        const loginData = {
          email,
          password,
        };

        console.log('Login data:', loginData);
        await login(email, password);
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      console.log(err);

      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    // Clear form when switching modes
    if (!isSignup) {
      setFullName('');
      setUniversity('');
      setState('');
      setCity('');
      setMobileNumber('');
      setDateOfBirth('');
      setConfirmPassword('');
    }
  };

  const renderAnimatedInput = (
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
      <Animated.View style={[styles.inputContainer, { opacity: formOpacity }]}>
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
            onChangeText={(text) => {
              onChangeText(text);
              if (text) validateField(inputKey, text);
            }}
            onFocus={() => setFocusedInput(inputKey)}
            onBlur={() => {
              setFocusedInput('');
              if (value) validateField(inputKey, value);
            }}
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
            {inputKey === 'email' && 'Please enter a valid .edu email address'}
            {inputKey === 'password' &&
              'Password must be 8+ chars with uppercase, lowercase & number'}
            {inputKey === 'fullName' && 'Name must be at least 2 characters'}
            {inputKey === 'mobileNumber' && 'Please enter a valid phone number'}
            {inputKey !== 'email' &&
              inputKey !== 'password' &&
              inputKey !== 'fullName' &&
              inputKey !== 'mobileNumber' &&
              'This field is required'}
          </Text>
        )}
      </Animated.View>
    );
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
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
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Animated Background */}
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Floating Particles */}
      <Animated.View style={[styles.particleContainer, particleAnimatedStyle]}>
        <Animated.View style={[styles.backgroundOrb, backgroundAnimatedStyle]}>
          {[...Array(12)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.particle,
                {
                  top: `${10 + (index % 4) * 20}%`,
                  left: `${5 + (index % 3) * 30}%`,
                  animationDelay: `${index * 200}ms`,
                },
              ]}
            >
              <Sparkles
                size={8 + (index % 3) * 2}
                color="rgba(99, 102, 241, 0.3)"
              />
            </View>
          ))}
        </Animated.View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 1)', 'rgba(248, 250, 252, 1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                  >
                    <GraduationCap size={24} color="white" />
                  </LinearGradient>
                </View>

                <Text style={styles.title}>
                  {isSignup ? 'Join the Community' : 'Welcome Back'}
                </Text>
                <Text style={styles.subtitle}>
                  {isSignup
                    ? 'Create your account and start connecting with students worldwide'
                    : 'Sign in to continue your cultural journey'}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Error Message */}
          {error ? (
            <Animated.View style={styles.errorContainer}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
                style={styles.errorGradient}
              >
                <AlertCircle size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </LinearGradient>
            </Animated.View>
          ) : null}

          {/* Form Container */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <BlurView intensity={20} style={styles.blurView}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 1)', 'rgba(248, 250, 252, 1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.formGradient}
              >
                {isSignup &&
                  renderAnimatedInput(
                    User,
                    'Full Name',
                    fullName,
                    setFullName,
                    'Enter your full name',
                    'fullName',
                    {
                      autoCapitalize: 'words',
                      autoComplete: 'name',
                    }
                  )}

                {renderAnimatedInput(
                  Mail,
                  'Email',
                  email,
                  setEmail,
                  'Enter your .edu email',
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

                {isSignup && (
                  <>
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
                        label="University"
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

                    <View style={styles.rowContainer}>
                      <View style={styles.halfWidth}>
                        {renderAnimatedInput(
                          MapPin,
                          'State',
                          state,
                          setState,
                          'State',
                          'state',
                          {
                            autoCapitalize: 'words',
                          }
                        )}
                      </View>
                      <View style={styles.halfWidth}>
                        {renderAnimatedInput(
                          MapPin,
                          'City',
                          city,
                          setCity,
                          'City',
                          'city',
                          {
                            autoCapitalize: 'words',
                          }
                        )}
                      </View>
                    </View>

                    {renderAnimatedInput(
                      Phone,
                      'Mobile Number',
                      mobileNumber,
                      setMobileNumber,
                      '(123) 456-7890',
                      'mobileNumber',
                      { keyboardType: 'phone-pad', maxLength: 14 }
                    )}

                    {/* {renderAnimatedInput(
                      Calendar,
                      'Date of Birth',
                      dateOfBirth,
                      (text) => {
                        const cleaned = text.replace(/\D/g, '');
                        let formatted = cleaned;
                        if (cleaned.length >= 4) {
                          formatted =
                            cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                        }
                        if (cleaned.length >= 6) {
                          formatted =
                            cleaned.slice(0, 4) +
                            '-' +
                            cleaned.slice(4, 6) +
                            '-' +
                            cleaned.slice(6, 8);
                        }
                        setDateOfBirth(formatted);
                      },
                      'YYYY-MM-DD',
                      'dateOfBirth',
                      { keyboardType: 'numeric', maxLength: 10 }
                    )} */}
                  </>
                )}
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Primary Button */}
          <Animated.View style={buttonAnimatedStyle}>
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
                      {isSignup ? 'Create Account' : 'Sign In'}
                    </Text>
                    <View style={styles.buttonIcon}>
                      <Sparkles size={16} color="white" />
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
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AuthForm;

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
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  backgroundOrb: {
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    zIndex: 1,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: 60,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  headerGradient: {
    padding: 24,
    borderRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    fontWeight: '500',
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  errorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  formContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 25,
      },
      android: {
        elevation: 12,
      },
    }),
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
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'rgba(226, 232, 240, 0.8)',
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
  inputWrapperFocused: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputWrapperValid: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  inputWrapperInvalid: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  validIcon: {
    marginLeft: 8,
  },
  validationText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  primaryButton: {
    marginHorizontal: 20,
    height: 60,
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  disabledButton: {
    ...Platform.select({
      ios: {
        shadowColor: '#9CA3AF',
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  switchBlur: {
    borderRadius: 20,
  },
  switchGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  switchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  switchButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  switchButtonText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
  },
});
