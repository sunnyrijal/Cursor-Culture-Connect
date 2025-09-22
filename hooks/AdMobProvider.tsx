
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { SocketProvider } from '@/hooks/useSocket';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL, API_URL } from '@/contexts/axiosConfig';
import getDecodedToken from '@/utils/getMyData';
import { Platform } from 'react-native';
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";

const queryClient = new QueryClient();

// AdMob Initialization Component
function AdMobProvider({ children }: { children: React.ReactNode }) {
  const [adMobInitialized, setAdMobInitialized] = useState(false);
  const [adMobError, setAdMobError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎯 AdMob Provider: Starting initialization');
    let mounted = true;
    
    const initializeAdMob = async () => {
      try {
        console.log('🎯 AdMob: Setting request configuration...');
        
        // Configure AdMob settings
        await mobileAds().setRequestConfiguration({
          maxAdContentRating: MaxAdContentRating.PG,
          tagForChildDirectedTreatment: false,
          tagForUnderAgeOfConsent: false,
          testDeviceIdentifiers: __DEV__ ? ["EMULATOR"] : [], // Only use test devices in development
        });

        console.log('🎯 AdMob: Request configuration set successfully');

        if (!mounted) {
          console.log('🎯 AdMob: Component unmounted before initialization');
          return;
        }

        console.log('🎯 AdMob: Initializing mobile ads...');
        await mobileAds().initialize();
        
        if (mounted) {
          console.log('✅ AdMob: Initialized successfully');
          setAdMobInitialized(true);
        }

      } catch (error: any) {
        console.error('❌ AdMob initialization failed:', error);
        console.error('❌ AdMob error details:', error.message);
        
        if (mounted) {
          setAdMobError(error.message || 'AdMob initialization failed');
          // Don't block app loading due to AdMob issues
          setAdMobInitialized(true);
        }
      }
    };

    initializeAdMob();

    return () => {
      console.log('🎯 AdMob Provider: Cleanup - component unmounting');
      mounted = false;
    };
  }, []);

  // You can optionally show loading state or handle errors here
  // For now, we'll render children regardless of AdMob status to not block the app
  return <>{children}</>;
}
export default AdMobProvider