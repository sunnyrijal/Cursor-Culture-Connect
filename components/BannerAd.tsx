import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const LIVE_BANNER_ID = "ca-app-pub-4289098365837690/4760411931"; 

const BANNER_ID = __DEV__ ? TestIds.BANNER : LIVE_BANNER_ID;

const AdMobScreen = () => {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => console.log('Banner ad loaded')}
        onAdFailedToLoad={(error) => console.log('Banner ad failed:', error)}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
});

export default AdMobScreen;