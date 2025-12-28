import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';
import AdMobConfig from '../config/admob';
import {canShowAd, saveLastAdShownTime} from './storage';

let interstitial = null;
let adLoaded = false;
let admobInitialized = false;
let isShowingAd = false;
let minimumViewTimeMs = 10000; // 10 seconds

// Get ad unit ID from config
const getAdUnitId = () => {
  const useTestAds = AdMobConfig.USE_TEST_ADS;

  if (useTestAds || __DEV__) {
    console.log('[AdMob] Using test ad unit');
    return TestIds.INTERSTITIAL;
  }

  const adUnitId = AdMobConfig.AD_UNIT_ID;
  console.log('[AdMob] Using production ad unit:', adUnitId);
  return adUnitId;
};

// Initialize AdMob SDK and create interstitial ad
export const initializeAdMob = async () => {
  if (admobInitialized) {
    console.log('[AdMob] Already initialized - skipping duplicate call');
    return true;
  }

  try {
    console.log('[AdMob] Initializing AdMob...');

    // Create the interstitial ad
    const adUnitId = getAdUnitId();
    interstitial = InterstitialAd.createForAdRequest(adUnitId);

    // Set up event listeners
    setupAdEventListeners();

    // Load the first ad
    await loadInterstitialAd();

    admobInitialized = true;
    console.log('[AdMob] AdMob initialized successfully');
    return true;
  } catch (error) {
    console.error('[AdMob] Error initializing AdMob:', error);
    return false;
  }
};

// Set up event listeners for the interstitial ad
const setupAdEventListeners = () => {
  if (!interstitial) return;

  // Ad loaded successfully
  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    adLoaded = true;
    console.log('[AdMob] Interstitial ad loaded');
  });

  // Ad failed to load
  interstitial.addAdEventListener(AdEventType.ERROR, error => {
    adLoaded = false;
    console.error('[AdMob] Ad failed to load:', error);

    // Retry loading after 30 seconds
    setTimeout(() => {
      console.log('[AdMob] Retrying ad load...');
      loadInterstitialAd();
    }, 30000);
  });

  // Ad opened (shown to user)
  interstitial.addAdEventListener(AdEventType.OPENED, () => {
    isShowingAd = true;
    console.log('[AdMob] Ad opened');

    // Start minimum view time countdown
    enforceMinimumViewTime();
  });

  // Ad closed (user dismissed)
  interstitial.addAdEventListener(AdEventType.CLOSED, async () => {
    isShowingAd = false;
    adLoaded = false;
    console.log('[AdMob] Ad closed');

    // Save the timestamp when ad was shown
    await saveLastAdShownTime();

    // Preload the next ad
    await loadInterstitialAd();
  });
};

// Enforce minimum 10-second view time
const enforceMinimumViewTime = () => {
  let secondsElapsed = 0;
  let canSkip = false;

  const timer = setInterval(() => {
    secondsElapsed++;

    if (secondsElapsed >= 10) {
      canSkip = true;
      clearInterval(timer);
      console.log('[AdMob] Minimum view time met - user can skip');
    }

    if (!isShowingAd) {
      clearInterval(timer);
    }
  }, 1000);
};

// Load interstitial ad
const loadInterstitialAd = async () => {
  if (!interstitial) {
    console.warn('[AdMob] Cannot load ad - interstitial not initialized');
    return false;
  }

  if (adLoaded) {
    console.log('[AdMob] Ad already loaded');
    return true;
  }

  try {
    console.log('[AdMob] Loading interstitial ad...');
    await interstitial.load();
    return true;
  } catch (error) {
    console.error('[AdMob] Error loading ad:', error);
    return false;
  }
};

// Show interstitial ad if eligible (checks 6-hour interval)
export const showInterstitialIfEligible = async () => {
  try {
    console.log('[AdMob] Checking if eligible to show ad...');

    // Check if ad module is initialized
    if (!admobInitialized || !interstitial) {
      console.log('[AdMob] AdMob not initialized yet');
      return false;
    }

    // Check if ad is already showing
    if (isShowingAd) {
      console.log('[AdMob] Ad already showing');
      return false;
    }

    // Check 6-hour interval
    const eligible = await canShowAd();
    if (!eligible) {
      console.log('[AdMob] Not eligible to show ad (6-hour interval not met)');
      return false;
    }

    // Check if ad is loaded
    if (!adLoaded) {
      console.log('[AdMob] Ad not loaded yet, attempting to load...');
      const loaded = await loadInterstitialAd();
      if (!loaded) {
        console.log('[AdMob] Failed to load ad');
        return false;
      }
      // Wait a bit for the ad to fully load
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Show the ad
    console.log('[AdMob] Showing interstitial ad...');
    await interstitial.show();
    return true;
  } catch (error) {
    console.error('[AdMob] Error showing interstitial ad:', error);
    return false;
  }
};

// Force show ad (for testing purposes - bypasses time check)
export const forceShowAd = async () => {
  if (!adLoaded) {
    console.log('[AdMob] Loading ad for forced show...');
    await loadInterstitialAd();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (adLoaded && interstitial) {
    console.log('[AdMob] Force showing ad...');
    await interstitial.show();
  }
};

// Check if ad is ready to show
export const isAdLoaded = () => {
  return adLoaded;
};
