import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from './theme';
import { useAuth } from '@/data/authContext';
import { useGroups } from '@/data/groupContext';
import { useEvents } from '@/data/eventContext';
import { useActivities } from '@/data/activityContext';
import { useChat } from '@/data/chatContext';

export default function ApiTestScreen() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{[key: string]: {success: boolean; message: string}}>({});
  const [loading, setLoading] = useState<boolean>(false);

  const auth = useAuth();
  const groups = useGroups();
  const events = useEvents();
  const activities = useActivities();
  const chat = useChat();

  // Test functions
  const tests = {
    'auth-status': async () => {
      return {
        success: true,
        message: `Authentication status: ${auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}\n${auth.user ? `User: ${auth.user.name} (${auth.user.email})` : 'No user data'}`
      };
    },
    'fetch-groups': async () => {
      try {
        await groups.fetchGroups();
        return {
          success: true,
          message: `Successfully fetched ${groups.groups.length} groups\n${groups.groups.map(g => g.name).join(', ')}`
        };
      } catch (error) {
        return { 
          success: false, 
          message: `Error fetching groups: ${error.message}` 
        };
      }
    },
    'fetch-user-groups': async () => {
      try {
        await groups.fetchUserGroups();
        return {
          success: true,
          message: `Successfully fetched ${groups.userGroups.length} user groups\n${groups.userGroups.map(g => g.name).join(', ')}`
        };
      } catch (error) {
        return { 
          success: false, 
          message: `Error fetching user groups: ${error.message}` 
        };
      }
    },
    'fetch-events': async () => {
      try {
        await events.fetchEvents();
        return {
          success: true,
          message: `Successfully fetched ${events.events.length} events\n${events.events.map(e => e.title).join(', ')}`
        };
      } catch (error) {
        return { 
          success: false, 
          message: `Error fetching events: ${error.message}` 
        };
      }
    },
    'fetch-user-events': async () => {
      try {
        await events.fetchUserEvents();
        return {
          success: true,
          message: `Successfully fetched ${events.userEvents.length} user events\n${events.userEvents.map(e => e.title).join(', ')}`
        };
      } catch (error) {
        return { 
          success: false, 
          message: `Error fetching user events: ${error.message}` 
        };
      }
    },
    'fetch-activities': async () => {
      try {
        await activities.fetchActivities();
        return {
          success: true,
          message: `Successfully fetched ${activities.activities.length} activities\n${activities.activities.map(a => a.name).join(', ')}`
        };
      } catch (error) {
        return { 
          success: false, 
          message: `Error fetching activities: ${error.message}` 
        };
      }
    },
    'fetch-user-preferences': async () => {
      try {
        await activities.fetchUserPreferences();
        return {
          success: true,
          message: `Successfully fetched ${activities.userPreferences.length} user preferences`
        };
      } catch (error) {
        return { 
          success: false, 
          message: `Error fetching user preferences: ${error.message}` 
        };
      }
    },
    'fetch-conversations': async () => {
      try {
        await chat.fetchConversations();
        return {
          success: true,
          message: `Successfully fetched ${chat.conversations.length} conversations`
        };
      } catch (error) {
        return { 
          success: false, 
          message: `Error fetching conversations: ${error.message}` 
        };
      }
    },
  };

  const runTest = async (testId: string) => {
    setActiveTest(testId);
    setLoading(true);
    try {
      const result = await tests[testId]();
      setTestResults(prev => ({
        ...prev,
        [testId]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          success: false,
          message: `Unexpected error: ${error.message}`
        }
      }));
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    const results = {};

    for (const [testId, testFn] of Object.entries(tests)) {
      try {
        results[testId] = await testFn();
      } catch (error) {
        results[testId] = {
          success: false,
          message: `Unexpected error: ${error.message}`
        };
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Tests</Text>
      <Text style={styles.subtitle}>Test your backend API connections</Text>
      
      <ScrollView style={styles.testsContainer}>
        {Object.keys(tests).map(testId => (
          <View key={testId} style={styles.testRow}>
            <TouchableOpacity 
              style={[
                styles.runButton, 
                testResults[testId] && (testResults[testId].success ? styles.successButton : styles.errorButton)
              ]}
              onPress={() => runTest(testId)}
              disabled={loading}
            >
              {loading && activeTest === testId ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {testId}
                </Text>
              )}
            </TouchableOpacity>
            
            {testResults[testId] && (
              <View style={styles.resultContainer}>
                <Text style={[
                  styles.resultText, 
                  testResults[testId].success ? styles.successText : styles.errorText
                ]}>
                  {testResults[testId].message}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.runAllButton, loading && styles.disabledButton]} 
        onPress={runAllTests}
        disabled={loading}
      >
        {loading && !activeTest ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.runAllText}>Run All Tests</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  testsContainer: {
    flex: 1,
  },
  testRow: {
    marginBottom: 16,
  },
  runButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButton: {
    backgroundColor: theme.success || '#4caf50',
  },
  errorButton: {
    backgroundColor: theme.error || '#f44336',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  successText: {
    color: theme.success || '#4caf50',
  },
  errorText: {
    color: theme.error || '#f44336',
  },
  runAllButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  runAllText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 