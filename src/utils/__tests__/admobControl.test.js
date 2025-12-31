// Mock dependencies BEFORE imports
jest.mock('react-native-google-mobile-ads', () => ({
  InterstitialAd: {
    createForAdRequest: jest.fn(),
  },
  AdEventType: {
    LOADED: 'loaded',
    ERROR: 'error',
    OPENED: 'opened',
    CLOSED: 'closed',
  },
  TestIds: {
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  },
}));

jest.mock('../../config/admob', () => ({
  USE_TEST_ADS: true,
  APP_ID: 'test-app-id',
  AD_UNIT_ID: 'test-ad-unit-id',
}));

jest.mock('../storage', () => ({
  canShowAd: jest.fn(),
  saveLastAdShownTime: jest.fn(),
}));

import {InterstitialAd, AdEventType, TestIds} from 'react-native-google-mobile-ads';
import {canShowAd, saveLastAdShownTime} from '../storage';
import {
  initializeAdMob,
  showInterstitialIfEligible,
  isAdLoaded,
  __resetAdMobForTesting,
} from '../admobControl';

describe('AdMob Control', () => {
  let mockInterstitial;
  let mockEventListeners;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // CRITICAL: Reset module state to prevent test contamination
    __resetAdMobForTesting();

    // Setup event listeners storage
    mockEventListeners = {};

    // Create mock interstitial ad
    mockInterstitial = {
      load: jest.fn().mockResolvedValue(undefined),
      show: jest.fn().mockResolvedValue(undefined),
      addAdEventListener: jest.fn((eventType, callback) => {
        mockEventListeners[eventType] = callback;
      }),
    };

    // Mock InterstitialAd.createForAdRequest
    InterstitialAd.createForAdRequest.mockReturnValue(mockInterstitial);

    // Mock storage functions
    canShowAd.mockResolvedValue(true);
    saveLastAdShownTime.mockResolvedValue(undefined);

    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe('initializeAdMob', () => {
    it('should initialize AdMob and create interstitial ad', async () => {
      const result = await initializeAdMob();

      expect(InterstitialAd.createForAdRequest).toHaveBeenCalledWith(
        TestIds.INTERSTITIAL
      );
      expect(mockInterstitial.load).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should use test ad unit when USE_TEST_ADS is true', async () => {
      await initializeAdMob();

      expect(InterstitialAd.createForAdRequest).toHaveBeenCalledWith(
        TestIds.INTERSTITIAL
      );
    });

    it('should setup event listeners', async () => {
      await initializeAdMob();

      expect(mockInterstitial.addAdEventListener).toHaveBeenCalledWith(
        AdEventType.LOADED,
        expect.any(Function)
      );
      expect(mockInterstitial.addAdEventListener).toHaveBeenCalledWith(
        AdEventType.ERROR,
        expect.any(Function)
      );
      expect(mockInterstitial.addAdEventListener).toHaveBeenCalledWith(
        AdEventType.OPENED,
        expect.any(Function)
      );
      expect(mockInterstitial.addAdEventListener).toHaveBeenCalledWith(
        AdEventType.CLOSED,
        expect.any(Function)
      );
    });

    it('should return true even if initial ad load fails (non-blocking)', async () => {
      mockInterstitial.load.mockRejectedValue(new Error('Load failed'));

      const result = await initializeAdMob();

      // Initialization succeeds even if ad loading fails - ad loading is non-blocking
      expect(result).toBe(true);
    });
  });

  describe('Event Listeners', () => {
    it('should save timestamp when ad is closed', async () => {
      await initializeAdMob();
      await mockEventListeners[AdEventType.CLOSED]();

      expect(saveLastAdShownTime).toHaveBeenCalled();
    });

    it('should preload next ad after closing', async () => {
      await initializeAdMob();
      mockInterstitial.load.mockClear();

      await mockEventListeners[AdEventType.CLOSED]();

      expect(mockInterstitial.load).toHaveBeenCalled();
    });

    it('should retry loading ad after error with delay', async () => {
      jest.useFakeTimers();

      await initializeAdMob();
      mockInterstitial.load.mockClear();

      mockEventListeners[AdEventType.ERROR]({message: 'Load failed'});

      expect(mockInterstitial.load).not.toHaveBeenCalled();

      jest.advanceTimersByTime(30000);

      expect(mockInterstitial.load).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('showInterstitialIfEligible', () => {
    it('should check eligibility before showing ad', async () => {
      await initializeAdMob();
      mockEventListeners[AdEventType.LOADED]();

      await showInterstitialIfEligible();

      expect(canShowAd).toHaveBeenCalled();
    });

    it('should show ad when eligible and loaded', async () => {
      await initializeAdMob();
      mockEventListeners[AdEventType.LOADED]();

      const result = await showInterstitialIfEligible();

      expect(mockInterstitial.show).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not show ad when not eligible (6-hour interval)', async () => {
      canShowAd.mockResolvedValue(false);

      await initializeAdMob();
      mockEventListeners[AdEventType.LOADED]();

      const result = await showInterstitialIfEligible();

      expect(mockInterstitial.show).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should not show ad when AdMob not initialized', async () => {
      const result = await showInterstitialIfEligible();

      expect(mockInterstitial.show).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle show errors gracefully', async () => {
      mockInterstitial.show.mockRejectedValue(new Error('Show failed'));

      await initializeAdMob();
      mockEventListeners[AdEventType.LOADED]();

      const result = await showInterstitialIfEligible();

      expect(result).toBe(false);
    });
  });

  describe('isAdLoaded', () => {
    it('should return false initially', () => {
      expect(isAdLoaded()).toBe(false);
    });

    it('should return true after ad loads', async () => {
      await initializeAdMob();
      mockEventListeners[AdEventType.LOADED]();

      expect(isAdLoaded()).toBe(true);
    });

    it('should return false after ad is closed', async () => {
      await initializeAdMob();
      mockEventListeners[AdEventType.LOADED]();
      await mockEventListeners[AdEventType.CLOSED]();

      expect(isAdLoaded()).toBe(false);
    });
  });

  describe('Minimum View Time Tracking', () => {
    it('should log when minimum view time is reached', async () => {
      jest.useFakeTimers();

      await initializeAdMob();
      mockEventListeners[AdEventType.OPENED]();

      jest.advanceTimersByTime(10000);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[AdMob] Minimum view time met')
      );

      jest.useRealTimers();
    });

    it('should stop timer when ad is closed early', async () => {
      jest.useFakeTimers();

      await initializeAdMob();
      mockEventListeners[AdEventType.OPENED]();

      jest.advanceTimersByTime(5000);
      await mockEventListeners[AdEventType.CLOSED]();

      const minViewTimeCallsBefore = console.log.mock.calls.filter(call =>
        call[0] && call[0].includes('Minimum view time met')
      ).length;

      jest.advanceTimersByTime(10000);

      const minViewTimeCallsAfter = console.log.mock.calls.filter(call =>
        call[0] && call[0].includes('Minimum view time met')
      ).length;

      expect(minViewTimeCallsAfter).toBe(minViewTimeCallsBefore);

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors in eligibility check', async () => {
      canShowAd.mockRejectedValue(new Error('Storage error'));

      await initializeAdMob();
      mockEventListeners[AdEventType.LOADED]();

      const result = await showInterstitialIfEligible();

      expect(result).toBe(false);
    });

    it('should handle ad loading failures gracefully (non-blocking)', async () => {
      mockInterstitial.load.mockRejectedValue(new Error('Network error'));

      const result = await initializeAdMob();

      // Initialization succeeds even if ad loading fails - ad loading is non-blocking
      // Errors are logged but don't block the app
      expect(result).toBe(true);
    });
  });
});
