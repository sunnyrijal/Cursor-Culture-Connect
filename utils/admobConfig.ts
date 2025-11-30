import { TestIds } from 'react-native-google-mobile-ads';

const IS_PRODUCTION = process.env.EAS_BUILD_PROFILE === 'production' || !__DEV__;

const PRODUCTION_IDS = {
  bannerAndroid: 'ca-app-pub-4289098365837690~2373905837',
  bannerIOS: 'ca-app-pub-4289098365837690~7227081496',    
  interstitialAndroid: 'ca-app-pub-4289098365837690/1111111111',
  interstitialIOS: 'ca-app-pub-4289098365837690/2222222222',
  rewardedAndroid: 'ca-app-pub-4289098365837690/3333333333',
  rewardedIOS: 'ca-app-pub-4289098365837690/4444444444',
};

/**
 * Development Ad Unit IDs (Google's Safe Test IDs)
 * These never show real ads - safe for testing
 */
const DEVELOPMENT_IDS = {
  bannerAndroid: TestIds.BANNER,
  bannerIOS: TestIds.BANNER,
  interstitialAndroid: TestIds.INTERSTITIAL,
  interstitialIOS: TestIds.INTERSTITIAL,
  rewardedAndroid: TestIds.REWARDED,
  rewardedIOS: TestIds.REWARDED,
};

/**
 * Select appropriate IDs based on environment
 */
export const ADMOB_CONFIG = IS_PRODUCTION ? PRODUCTION_IDS : DEVELOPMENT_IDS;

/**
 * Helper function to get correct unit ID for current platform
 * @param adType - 'banner', 'interstitial', 'rewarded'
 * @returns Unit ID for current platform
 */
import { Platform } from 'react-native';

export function getAdUnitId(adType: 'banner' | 'interstitial' | 'rewarded'): string {
  const isPlatformAndroid = Platform.OS === 'android';
  
  const adTypeMap = {
    banner: isPlatformAndroid ? 'bannerAndroid' : 'bannerIOS',
    interstitial: isPlatformAndroid ? 'interstitialAndroid' : 'interstitialIOS',
    rewarded: isPlatformAndroid ? 'rewardedAndroid' : 'rewardedIOS',
  } as const;

  return ADMOB_CONFIG[adTypeMap[adType] as keyof typeof ADMOB_CONFIG];
}

/**
 * Log current AdMob configuration
 * Useful for debugging
 */
export function logAdMobConfig(): void {
  console.log('📊 AdMob Configuration:');
  console.log(`   Environment: ${IS_PRODUCTION ? '🏭 PRODUCTION' : '🔬 DEVELOPMENT'}`);
  console.log(`   Banner Android: ${ADMOB_CONFIG.bannerAndroid}`);
  console.log(`   Banner iOS: ${ADMOB_CONFIG.bannerIOS}`);
  console.log(`   Using Test IDs: ${!IS_PRODUCTION ? '✅ Yes' : '❌ No'}`);
}

if (!IS_PRODUCTION) {
  console.log('✅ AdMob is running in DEVELOPMENT mode with safe TestIds');
}
