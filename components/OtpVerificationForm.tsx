'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Shield,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {
  resendOTP,
  ResendOTPData,
  verifyOTP,
  VerifyOTPData,
} from '@/contexts/emailVerification.api';

const { width, height } = Dimensions.get('window');

const OtpVerificationForm: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();

  const inputRefs = useRef<TextInput[]>([]);

  const { mutate: verifyOTPMutate, isPending: isVerifying } = useMutation({
    mutationFn: (data: VerifyOTPData) => verifyOTP(data),
    onSuccess: (data) => {
      console.log('✅ OTP verified successfully:', data);
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      console.error('❌ Error verifying OTP:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    },
  });

  const { mutate: resendOTPMutate, isPending: isResending } = useMutation({
    mutationFn: (data: ResendOTPData) => resendOTP(data),
    onSuccess: (data) => {
      console.log('✅ OTP resent successfully:', data);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
      setFocusedInput(0);
    },
    onError: (error: any) => {
      console.error('❌ Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    },
  });

  // Simplified animations - smaller values and gentler timing
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(20); // Reduced from 50
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    // Gentle fade in with smaller movement
    formOpacity.value = withTiming(1, { duration: 400, easing: Easing.ease });
    formTranslateY.value = withTiming(0, { duration: 400, easing: Easing.ease });

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
  }, [emailParam]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedInput(index + 1);
    }

    if (value && index === 5 && newOtp.every((digit) => digit !== '')) {
      setTimeout(() => handleSubmit(newOtp), 300);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedInput(index - 1);
    }
  };

  const handleSubmit = (otpArray?: string[]) => {
    const currentOtp = otpArray || otp;
    const otpString = currentOtp.join('');

    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    
    // Subtle button press animation - smaller scale change
    buttonScale.value = withSequence(
      withTiming(0.98, { duration: 80 }), // Reduced from 0.95
      withTiming(1, { duration: 80 })
    );

    const payload: VerifyOTPData = {
      email: email.trim(),
      otp: otpString,
    };

    verifyOTPMutate(payload);
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;

    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }

    const payload: ResendOTPData = {
      email: email.trim(),
    };

    resendOTPMutate(payload);
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderOtpInput = (index: number) => {
    const isFocused = focusedInput === index;
    const hasValue = otp[index] !== '';

    return (
      <View
        key={index}
        style={[
          styles.otpInputContainer,
          isFocused && styles.otpInputFocused,
          hasValue && styles.otpInputFilled,
        ]}
      >
        <TextInput
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref;
          }}
          style={[
            styles.otpInput,
            isFocused && styles.otpInputTextFocused,
            hasValue && styles.otpInputTextFilled,
          ]}
          value={otp[index]}
          onChangeText={(value) => handleOtpChange(value, index)}
          onKeyPress={({ nativeEvent }) =>
            handleKeyPress(nativeEvent.key, index)
          }
          onFocus={() => setFocusedInput(index)}
          keyboardType="numeric"
          maxLength={1}
          selectTextOnFocus
          editable={!isVerifying}
          textAlign="center"
        />

        {hasValue && (
          <View style={styles.otpCheckIcon}>
            <CheckCircle size={12} color="#10B981" />
          </View>
        )}
      </View>
    );
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Removed rotating particles and complex animations */}

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
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']}
              style={styles.backButtonGradient}
            >
              <ArrowLeft size={20} color="#6366F1" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Simplified header - no complex animations */}
          <View style={styles.headerContainer}>
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
                    <Shield size={24} color="white" />
                  </LinearGradient>
                </View>

                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>
                  We've sent a 6-digit verification code to
                </Text>
                <Text style={styles.emailText}>{email || emailParam}</Text>
              </View>
            </LinearGradient>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
                style={styles.errorGradient}
              >
                <AlertCircle size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </LinearGradient>
            </View>
          ) : null}

          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <BlurView intensity={20} style={styles.blurView}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 1)', 'rgba(248, 250, 252, 1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.formGradient}
              >
                <View style={styles.emailInputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.emailInputWrapper}>
                    <TextInput
                      style={styles.emailInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isVerifying}
                    />
                  </View>
                </View>

                <Text style={styles.otpLabel}>Enter Verification Code</Text>

                <View style={styles.otpContainer}>
                  {[0, 1, 2, 3, 4, 5].map(renderOtpInput)}
                </View>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendLabel}>
                    Didn't receive the code?
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resendCooldown > 0 || isResending}
                    style={styles.resendButton}
                  >
                    <Text
                      style={[
                        styles.resendButtonText,
                        (resendCooldown > 0 || isResending) &&
                          styles.resendButtonTextDisabled,
                      ]}
                    >
                      {isResending
                        ? 'Sending...'
                        : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isVerifying && styles.disabledButton,
              ]}
              onPress={() => handleSubmit()}
              disabled={
                isVerifying ||
                otp.some((digit) => digit === '') ||
                !email.trim()
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isVerifying ||
                  otp.some((digit) => digit === '') ||
                  !email.trim()
                    ? ['#CBD5E1', '#94A3B8']
                    : ['#8B5CF6', '#6366F1', '#3B82F6']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {isVerifying ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.loadingText}>Verifying...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Verify Code</Text>
                    <View style={styles.buttonIcon}>
                      <CheckCircle size={16} color="white" />
                    </View>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OtpVerificationForm;

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
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: 120,
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
    fontSize: 28,
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
    lineHeight: 20,
    fontWeight: '500',
  },
  emailText: {
    fontSize: 16,
    color: '#6366F1',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
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
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  emailInputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emailInputWrapper: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  emailInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    borderRadius: 16,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 32,
  },
  otpInputContainer: {
    width: 48,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
  otpInputFocused: {
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
  otpInputFilled: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  otpInputTextFocused: {
    color: '#6366F1',
  },
  otpInputTextFilled: {
    color: '#10B981',
  },
  otpCheckIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resendContainer: {
    alignItems: 'center',
    gap: 8,
  },
  resendLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  resendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
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
});