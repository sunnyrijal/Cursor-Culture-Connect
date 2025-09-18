'use client';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateEventModal } from '@/components/CreateEventModal';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { ShareCultureModal } from '@/components/ShareCultureModal';
import { CulturalStoriesModal } from '@/components/CulturalStoriesModal';
import { currentUser } from '@/data/mockData';
import { theme, spacing } from '@/components/theme';
import Header from '@/components/home/Header';
import UserStat from '@/components/home/UserStat';
import CulturalExperiences from '@/components/home/CulturalExperiences';
import UpcommingEvents from '@/components/home/UpcommingEvents';
import QuickActions from '@/components/home/QuickActions';
import WelcomeCenter from '@/components/home/WelcomeMesage';
import { CreateQuickEventModal } from '@/components/CreateQuickEventModal';
import AutoplayVideo from '@/components/home/VideoCard';
import { Image } from 'react-native';
import getDecodedToken from '@/utils/getMyData';
import { useQuery } from '@tanstack/react-query';
import DiscoverNativeAd from '@/components/NativeAd';

import mobileAds, { MaxAdContentRating, TestIds } from "react-native-google-mobile-ads";
// Optional (iOS ATT prompt). If you want it, install: npx expo install expo-tracking-transparency
// import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync, PermissionStatus } from "expo-tracking-transparency";


export default function Dashboard() {
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateQuickEventModal, setShowCreateQuickEventModal] =
    useState(false);

   const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });
  console.log(myData)

//   useEffect(() => {
//   let mounted = true;

//   (async () => {
//     try {
//       // If you want to request ATT on iOS first, uncomment this block:
//       // if (Platform.OS === "ios") {
//       //   const { status } = await getTrackingPermissionsAsync();
//       //   if (status === PermissionStatus.UNDETERMINED) {
//       //     await requestTrackingPermissionsAsync();
//       //   }
//       // }

//       await mobileAds()
//         .setRequestConfiguration({
//           maxAdContentRating: MaxAdContentRating.PG,
//           tagForChildDirectedTreatment: false,
//           tagForUnderAgeOfConsent: false,
//           // Add your device ID here later for realistic test ads
//           testDeviceIdentifiers: ["EMULATOR"],
//         });

//       if (!mounted) return;
//       await mobileAds().initialize();
//     } catch (e) {
//       console.warn("AdMob init failed", e);
//     }
//   })();

//   return () => {
//     mounted = false;
//   };
// }, []);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showStoriesModal, setShowStoriesModal] = useState(false);
  const [showShareCultureModal, setShowShareCultureModal] = useState(false);

  const handleCreateEvent = (eventData: any) => {
    setShowCreateEventModal(false);
  };

  const handleCreateQuickEvent = (eventData: any) => {
    setShowCreateQuickEventModal(false);
  };

  const handleCreateGroup = (groupData: any) => {
    setShowCreateGroupModal(false);
  };

  const handleShareStory = (storyData: any) => {
    setShowShareCultureModal(false);
  };

  const handlePostStory = () => {
    setShowStoriesModal(false);
    setShowShareCultureModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header setShowStoriesModal={setShowStoriesModal} />

        <UserStat currentUser={currentUser} />


        <QuickActions />
    <AutoplayVideo source={require('../../assets/trivo.mp4')} style={{}} />

        <CulturalExperiences />

        {/* <DiscoverNativeAd /> */}

        <UpcommingEvents />
      </ScrollView>

      {/* Modals */}
      <CreateEventModal
        visible={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onSubmit={handleCreateEvent}
      />

      <CreateQuickEventModal
        visible={showCreateQuickEventModal}
        onClose={() => setShowCreateQuickEventModal(false)}
        onSubmit={handleCreateQuickEvent}
      />
      <CreateGroupModal
        visible={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSubmit={handleCreateGroup}
      />
      <ShareCultureModal
        visible={showShareCultureModal}
        onClose={() => setShowShareCultureModal(false)}
        onSubmit={handleShareStory}
      />
      <CulturalStoriesModal
        visible={showStoriesModal}
        onClose={() => setShowStoriesModal(false)}
        onPostStory={handlePostStory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },

  // WELCOME CENTER
  welcomeCenterContainer: {
    alignItems: 'center',
    marginVertical: 32,
    paddingHorizontal: 20,
  },
  welcomeCenterTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: -0.5,
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: 'System',
    // Subtle text shadow for depth
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeCenterTitleIndented: {
    marginLeft: 16,
    color: '#4A5568', // Slightly lighter for visual hierarchy
    fontSize: 26,
    fontWeight: '600',
    marginTop: 2,
    // Different shadow for secondary text
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },

  // Alternative version with background card
  welcomeCenterContainerCard: {
    alignItems: 'center',
    marginVertical: 32,
    marginHorizontal: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    // Neumorphism effect
    shadowColor: '#E2E8F0',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 0,
    // Inner highlight
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
});
