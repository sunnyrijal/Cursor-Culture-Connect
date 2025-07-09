import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="my-hub" options={{ presentation: 'modal' }} />
        <Stack.Screen name="my-university" options={{ presentation: 'modal' }} />
        <Stack.Screen name="group/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="event/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile/public/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}