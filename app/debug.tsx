import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '@/components/theme';
import * as api from '@/data/api';

export default function DebugScreen() {
  const [result, setResult] = useState<string>('No result yet');
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('test@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [name, setName] = useState<string>('Test User');

  const testRegister = async () => {
    setLoading(true);
    setResult('Testing register...');
    
    try {
      const response = await api.register({
        email,
        password,
        name
      });
      
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Registration error:', error);
      setResult(`Error: ${error.message || 'Unknown error'}\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const response = await api.login({
        email,
        password
      });
      
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Login error:', error);
      setResult(`Error: ${error.message || 'Unknown error'}\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetCurrentUser = async () => {
    setLoading(true);
    setResult('Testing getCurrentUser...');
    
    try {
      const response = await api.getCurrentUser();
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Get user error:', error);
      setResult(`Error: ${error.message || 'Unknown error'}\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testAPIUrl = async () => {
    setLoading(true);
    setResult('Testing API URL...');
    
    try {
      const apiUrl = (api as any).API_URL;
      setResult(`API URL: ${apiUrl}`);
    } catch (error) {
      setResult(`Error getting API URL: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'API Debug',
          headerShown: true,
        }}
      />
      
      <Text style={styles.title}>API Debug</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={testRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Register</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={testLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={testGetCurrentUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Get User</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={testAPIUrl}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Check API URL</Text>
        </TouchableOpacity>
      </View>
      
      {loading && (
        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
      )}
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Result:</Text>
        <ScrollView style={styles.resultScroll}>
          <Text style={styles.resultText}>{result}</Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: theme.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.text,
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    color: theme.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    backgroundColor: theme.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  resultContainer: {
    flex: 1,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: theme.cardBackground,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.text,
  },
  resultScroll: {
    maxHeight: 300,
  },
  resultText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: theme.text,
    fontSize: 12,
  },
}); 