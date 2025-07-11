import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import FloatingNavButton from '@/components/ui/FloatingNavButton';
import { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { usePathname } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();
  const [showNav, setShowNav] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // List of main tab routes and chat detail route
  const tabRoutes = ['/', '/discover', '/groups', '/events', '/chat', '/profile'];
  const isTabPage = tabRoutes.includes(pathname);
  const isChatDetail = pathname.startsWith('/chat/');
  const isDashboard = pathname === '/' || pathname === '/index' || pathname === '/(tabs)' || pathname === '/(tabs)/index';

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
      {/* Slide-in horizontal nav bar */}
      {showNav && !isTabPage && !isChatDetail && (
        <View style={slideNavStyles.overlay} pointerEvents="box-none">
          <TouchableOpacity style={slideNavStyles.overlayBg} onPress={() => setShowNav(false)} pointerEvents="auto" />
          <View style={slideNavStyles.navBar} pointerEvents="auto">
            {!isDashboard && (
              <TouchableOpacity style={slideNavStyles.navButton} onPress={() => { setShowNav(false); router.push('/'); }}><Text>Home</Text></TouchableOpacity>
            )}
            <TouchableOpacity style={slideNavStyles.navButton} onPress={() => { setShowNav(false); router.push('/discover'); }}><Text>Discover</Text></TouchableOpacity>
            <TouchableOpacity style={slideNavStyles.navButton} onPress={() => { setShowNav(false); router.push('/groups'); }}><Text>Groups</Text></TouchableOpacity>
            <TouchableOpacity style={slideNavStyles.navButton} onPress={() => { setShowNav(false); router.push('/events'); }}><Text>Events</Text></TouchableOpacity>
            <TouchableOpacity style={slideNavStyles.navButton} onPress={() => { setShowNav(false); router.push('/chat'); }}><Text>Chat</Text></TouchableOpacity>
            <TouchableOpacity style={slideNavStyles.navButton} onPress={() => { setShowNav(false); router.push('/profile'); }}><Text>Profile</Text></TouchableOpacity>
          </View>
        </View>
      )}
      {/* Floating nav button always above overlay */}
      {!isTabPage && !isChatDetail && <FloatingNavButton onPress={() => setShowNav(v => !v)} />}
    </>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  navBar: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    width: '90%',
    alignItems: 'center',
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    width: 120,
    alignItems: 'center',
  },
});

const slideNavStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'transparent',
    zIndex: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  overlayBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 201,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 202,
  },
  navButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    minWidth: 48,
    alignItems: 'center',
    marginHorizontal: 4,
  },
});