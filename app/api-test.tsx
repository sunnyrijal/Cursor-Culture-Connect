import React from 'react';
import { Stack } from 'expo-router';
import ApiTestScreen from '@/components/ApiTestScreen';

export default function ApiTestPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'API Testing',
          headerShown: true,
        }}
      />
      <ApiTestScreen />
    </>
  );
} 