import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { router, Stack } from 'expo-router';
import { theme } from '@/components/theme';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, isLoading } = useAuth();

  // Debug current navigation state
  useEffect(() => {
    console.log('Login screen rendered');
    console.log('Authentication state:', { isAuthenticated, isLoading });
  }, []);

  // Check if already authenticated on component mount
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('Already authenticated in Login screen, navigating to home tab');
      // Navigate to the explicit tabs route to avoid navigation loops
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      console.log('Attempting login with email:', email);
      const success = await login(email, password);

      if (!success) {
        console.log('Login failed in login screen');
        setError('Invalid email or password');
        setIsSubmitting(false);
      } else {
        console.log('Login successful in login screen');
        
        // Navigate to the explicit tabs route to avoid navigation loops
        console.log('Navigating to /(tabs) after successful login');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 300);
      }
    } catch (error) {
      console.error('Login error in login screen:', error);
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
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to connect with your cultural community</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
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
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
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
            
            <TouchableOpacity 
              onPress={() => Alert.alert('Reset Password', 'Feature coming soon!')}
              disabled={isSubmitting}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <Button
              title={isSubmitting ? '' : "Login"}
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={isSubmitting}
            >
              {isSubmitting && <ActivityIndicator color="white" />}
            </Button>
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/signup')}
                disabled={isSubmitting}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
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
    marginBottom: 24,
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
  forgotPassword: {
    color: theme.primary,
    textAlign: 'right',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  loginButton: { 
    height: 50, 
    borderRadius: 8, 
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  signupLink: {
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