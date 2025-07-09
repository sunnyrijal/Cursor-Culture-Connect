import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import { theme } from '@/components/theme';

export default function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Culture Connect</Text>
      <Text style={styles.subtitle}>Connect with different cultures and events wherever you are.</Text>
      <Button title="Login" onPress={() => router.replace('/')} style={styles.loginButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.primary, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: theme.textSecondary, marginBottom: 32, textAlign: 'center' },
  loginButton: { width: 200, height: 48, borderRadius: 24, marginTop: 8 },
}); 