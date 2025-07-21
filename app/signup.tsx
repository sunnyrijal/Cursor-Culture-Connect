import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { router, Stack } from 'expo-router';
import { theme } from '@/components/theme';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [culturalBackground, setCulturalBackground] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { signup, isAuthenticated, isLoading } = useAuth();

  // Debug current navigation state
  useEffect(() => {
    console.log('Signup screen rendered');
    console.log('Authentication state:', { isAuthenticated, isLoading });
  }, []);

  // Check if already authenticated on component mount
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('Already authenticated in Signup screen, navigating to home tab');
      // Navigate to the explicit tabs route to avoid navigation loops
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword || !fullName) {
      setError('Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Check for .edu email domain
    if (!email.toLowerCase().endsWith('.edu')) {
      setError('Only .edu email addresses are allowed to register');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setError('');
    setIsSubmitting(true);

    try {
      console.log('Attempting signup with email:', email);
      const userData = {
        username,
        email,
        password,
        fullName,
        university: university || undefined,
        culturalBackground: culturalBackground || undefined
      };

      const success = await signup(userData);

      if (!success) {
        console.log('Signup failed in signup screen');
        setError('Registration failed. Email or username may already be in use.');
        setIsSubmitting(false);
      } else {
        console.log('Signup successful in signup screen');
        console.log('Navigating to /(tabs) after successful signup');
        // Navigate to the explicit tabs route to avoid navigation loops
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 300);
      }
    } catch (error) {
      console.error('Registration error in signup screen:', error);
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Stack.Screen 
          options={{
            headerShown: true,
            title: "",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={isSubmitting}>
                <ArrowLeft size={24} color={theme.text} />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: theme.background,
            },
            headerShadowVisible: false,
          }}
        />
        
        <View style={styles.container}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the cultural community and connect with others</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textPlaceholder}
                value={fullName}
                onChangeText={setFullName}
                editable={!isSubmitting}
              />
            </View>
            
            {/* Username */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username*</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor={theme.textPlaceholder}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                editable={!isSubmitting}
              />
            </View>
            
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.textPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!isSubmitting}
              />
              <Text style={styles.helperText}>Only .edu email addresses are allowed</Text>
            </View>
            
            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password*</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  placeholderTextColor={theme.textPlaceholder}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password*</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textPlaceholder}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={theme.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {/* University */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>University (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your university"
                placeholderTextColor={theme.textPlaceholder}
                value={university}
                onChangeText={setUniversity}
                editable={!isSubmitting}
              />
            </View>
            
            {/* Cultural Background */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cultural Background (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your cultural background"
                placeholderTextColor={theme.textPlaceholder}
                value={culturalBackground}
                onChangeText={setCulturalBackground}
                editable={!isSubmitting}
              />
            </View>
            
            <Button
              title={isSubmitting ? '' : "Sign Up"}
              onPress={handleSignup}
              style={styles.signupButton}
              disabled={isSubmitting}
            >
              {isSubmitting && <ActivityIndicator color="white" />}
            </Button>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')} disabled={isSubmitting}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: theme.background,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  backButton: {
    marginLeft: 8,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: theme.text, 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: theme.textSecondary, 
    marginBottom: 32, 
    textAlign: 'center',
    maxWidth: 300,
  },
  form: {
    width: '100%',
    maxWidth: 350,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: theme.text,
    backgroundColor: theme.cardBackground,
  },
  helperText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.cardBackground,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    color: theme.text,
  },
  eyeIcon: {
    padding: 12,
  },
  signupButton: { 
    height: 50, 
    borderRadius: 8,
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: theme.error || '#f44336',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 