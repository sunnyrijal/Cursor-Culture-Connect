import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

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
  
  const [isSignup, setIsSignup] = useState<boolean>(initialMode === 'signup');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login, signup } = useAuth();
  const router = useRouter();

  const validateSignupForm = () => {
    if (!fullName.trim()) return "Full name is required";
    if (!email.trim()) return "Email is required";
    if (!email.endsWith('.edu')) return "Only .edu email addresses are allowed";
    if (!password.trim()) return "Password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!university.trim()) return "University name is required";
    if (!state.trim()) return "State is required";
    if (!city.trim()) return "City is required";
    if (!mobileNumber.trim()) return "Mobile number is required";
    if (!dateOfBirth.trim()) return "Date of birth is required";
    return null;
  };
  
  const validateLoginForm = () => {
    if (!email.trim()) return "Email is required";
    if (!email.endsWith('.edu')) return "Only .edu email addresses are allowed";
    if (!password.trim()) return "Password is required";
    return null;
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validate form based on mode
    let validationError = null;
    if (isSignup) {
      validationError = validateSignupForm();
    } else {
      validationError = validateLoginForm();
    }
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      if (isSignup) {
        // Create additional data object for signup
        const additionalData = {
          fullName,
          university,
          state,
          city,
          mobileNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined
        };
        
        // Pass all the signup data to the signup function
        // The updated signup function should handle this data
        await signup(email, password);
        
        console.log('User registered successfully');
      } else {
        await login(email, password);
        console.log('User logged in successfully');
      }
      
      // Navigate to home screen on success
      router.replace('/(tabs)');
    } catch (err) {
      const errorMessage = (err as Error).message || 'Authentication failed';
      setError(errorMessage);
      console.error('Auth error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{isSignup ? 'Sign Up' : 'Login'}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        {isSignup && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            editable={!loading}
          />
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        
        {isSignup && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="University/College Name"
              value={university}
              onChangeText={setUniversity}
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="State"
              value={state}
              onChangeText={setState}
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (MM/DD/YYYY)"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              keyboardType="numbers-and-punctuation"
              editable={!loading}
            />
          </>
        )}
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isSignup ? 'Sign Up' : 'Login'}</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setIsSignup(!isSignup)} disabled={loading}>
          <Text style={styles.switchText}>
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#7cb0ff',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  switchText: {
    marginTop: 20,
    color: '#007bff',
    textAlign: 'center',
    fontSize: 16,
  },
  error: {
    color: '#ff3b30',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default AuthForm;
