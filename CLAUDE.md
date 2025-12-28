# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kids guard - Parental control** is a React Native parental control application for Android that allows parents to control and lock device settings (volume and brightness). The app was migrated from Expo to React Native CLI to enable native control capabilities and includes AdMob interstitial ads for monetization.

**Key Purpose**: Enable parents to set and lock volume/brightness levels that children cannot override, with enforcement happening at the native Android level.

**Monetization**: Interstitial ads shown once every 6 hours when the app comes to foreground or after setup completion.

**GitHub Repository**: kids-guard-parental-control

## Build and Run Commands

### Development
```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android

# View Android logs
npx react-native log-android

# Run linting
npm run lint

# Run tests
npm test
```

### Clean Build (When Dependencies or Native Code Changes)
```bash
# On Windows:
cd android
.\gradlew.bat clean
cd ..
npm install
npx react-native run-android

# On macOS/Linux:
cd android
./gradlew clean
cd ..
npm install
npx react-native run-android
```

### Prerequisites
- Node.js 18+
- Android Studio with Android SDK (API 33+)
- Android device/emulator running
- React Native development environment configured

## Architecture

### High-Level Structure

This app follows a **hybrid architecture** with React Native JavaScript UI communicating with native Android modules for hardware control:

```
React Native (JavaScript)
  ├── Screens (UI Components)
  ├── Utils (Business Logic)
  │   ├── storage.js - AsyncStorage + Keychain + Ad Timing
  │   ├── volumeControl.js - Bridge to VolumeControlModule
  │   ├── brightnessControl.js - Bridge to BrightnessControlModule
  │   └── admobControl.js - AdMob SDK integration
  ├── Config
  │   └── admob.js - AdMob configuration (App ID, Ad Unit ID)
  └── Native Bridge (NativeModules)
         ↓
Native Android (Java/Kotlin)
  ├── VolumeControlModule.java - AudioManager + ContentObserver
  ├── BrightnessControlModule.java - System brightness control
  ├── VolumeControlPackage.java - Package registration
  └── MainApplication.kt - Registers native modules

Third-Party SDKs
  └── Google Mobile Ads SDK - Interstitial ad delivery
```

### Critical Architecture Details

#### 1. Native Module Communication Pattern
**Bidirectional communication** between JavaScript and native code:
- **JS → Native**: `NativeModules.VolumeControl.setVolume(50)`
- **Native → JS**: `NativeEventEmitter` sends enforcement notifications

#### 2. Volume Enforcement Strategy
Uses Android's **ContentObserver pattern** for instant enforcement:
- `VolumeControlModule.java` registers a ContentObserver on the system volume settings URI
- When hardware volume buttons are pressed, the observer detects the change **instantly**
- The module automatically reverts to the enforced volume level
- Happens in native code (no JavaScript event loop delays)

**Critical**: ContentObserver runs on the **main UI thread handler** to ensure immediate enforcement.

#### 3. Brightness Enforcement Strategy
Uses a **dual-layer approach**:
- **Window-level**: Sets window brightness (always works, no permission needed)
- **System-level**: Sets system brightness if `WRITE_SETTINGS` permission granted
- **JavaScript polling**: 2-second interval detects manual changes and re-enforces

**Why polling for brightness but not volume?**
- Android has no ContentObserver for brightness changes
- Volume changes trigger system callbacks, brightness does not
- 2-second polling is acceptable tradeoff

#### 4. Secure Storage Pattern
**Two storage mechanisms** for different security needs:
- **react-native-keychain**: Sensitive data (parent PIN) - hardware-encrypted
- **AsyncStorage**: Non-sensitive settings (volume/brightness preferences)

```javascript
// PIN stored with service identifier
await Keychain.setGenericPassword('PIN', value, { service: 'parent_pin' })
```

#### 5. Navigation Flow Architecture
**Conditional navigation** based on setup state:
```
isSetupComplete = false:
  Welcome → ParentVerification → SetupPIN

isSetupComplete = true:
  Home → PINEntry → ParentSettings
```

State managed in `App.tsx` with `isSetupComplete` controlling which navigation stack is mounted.

#### 6. AdMob Monetization Architecture
**Interstitial ad system** with time-based frequency control:
- **6-hour interval**: Ads shown maximum once every 6 hours
- **Timestamp tracking**: Uses AsyncStorage to persist last ad shown time
- **AppState listener**: Detects app foreground events to trigger ad display
- **Initialization triggers**: Shows ad after app initialization and after PIN setup completion
- **Test mode**: Configured via `src/config/admob.js` to use test ad units during development

**Ad Display Flow**:
```
App Foreground / Setup Complete
  ↓
showInterstitialIfEligible()
  ↓
Check canShowAd() (6-hour interval)
  ↓
Show ad if eligible
  ↓
Save timestamp via saveLastAdShownTime()
  ↓
Preload next ad
```

**Important**: Ad SDK requires minSdkVersion 23 (Android 6.0+). 10-second minimum view time is tracked but not enforced (AdMob SDK limitation).

## Native Modules

### VolumeControlModule.java
**Location**: `android/app/src/main/java/com/kidsguard/VolumeControlModule.java`

**Key Methods**:
- `setVolume(int)`: Set system volume 0-100%
- `getVolume()`: Get current system volume
- `startEnforcing(int)`: Lock volume at specific level (starts ContentObserver)
- `stopEnforcing()`: Unlock volume (removes ContentObserver)
- `isEnforcingVolume()`: Check enforcement status

### BrightnessControlModule.java
**Location**: `android/app/src/main/java/com/kidsguard/BrightnessControlModule.java`

**Key Methods**:
- `setBrightness(int)`: Set screen brightness 0-100%
- `getBrightness()`: Get current brightness
- `startEnforcing(int)`: Lock brightness (starts monitoring)
- `stopEnforcing()`: Unlock brightness
- `checkWriteSettingsPermission()`: Check if system brightness permission granted
- `requestWriteSettingsPermission()`: Open settings for user to grant permission

**Important**: Window brightness works immediately. System brightness requires `WRITE_SETTINGS` permission granted by user in Settings.

### Module Registration
Modules are registered in `MainApplication.kt`:
```kotlin
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add(VolumeControlPackage())
    }
```

VolumeControlPackage registers both modules:
```java
modules.add(new VolumeControlModule(reactContext));
modules.add(new BrightnessControlModule(reactContext));
```

**Adding a new native module**:
1. Create module class extending `ReactContextBaseJavaModule`
2. Add to `VolumeControlPackage.java` or create new package
3. If new package, register in `MainApplication.kt`
4. Clean rebuild: `cd android && .\gradlew.bat clean` (Windows) or `./gradlew clean` (macOS/Linux)

## Required Permissions

Defined in `android/app/src/main/AndroidManifest.xml`:

- **MODIFY_AUDIO_SETTINGS**: Required for volume control
- **WRITE_SETTINGS**: System-level brightness (runtime permission, user must grant in Settings)
- **FOREGROUND_SERVICE**: For persistent background monitoring
- **POST_NOTIFICATIONS**: Foreground service notification (Android 13+)
- **RECEIVE_BOOT_COMPLETED**: Auto-start enforcement after device reboot
- **WAKE_LOCK**: Prevent enforcement service from sleeping
- **REQUEST_IGNORE_BATTERY_OPTIMIZATIONS**: Prevent Android from killing enforcement

**Note**: `WRITE_SETTINGS` cannot be requested via standard permission dialog. The app directs users to Settings to grant it manually.

## Code Patterns and Conventions

### Storage Keys Pattern
All storage keys centralized in `src/utils/storage.js`:
```javascript
const KEYS = {
  FIRST_LAUNCH: 'first_launch',
  PIN: 'parent_pin',
  VOLUME_SETTINGS: 'volume_settings',
  // ...
}
```
**Never hardcode storage keys** - always import from `KEYS` object.

### Settings Object Pattern
Volume and brightness settings follow consistent structure:
```javascript
{
  volume: 50,      // 0-100
  locked: false    // true = enforcing
}
```

### PIN Verification with Lockout
`storage.js` implements **exponential backoff lockout**:
- After 5 failed attempts: 60 seconds lockout
- After 10 failed attempts: 120 seconds lockout
- Pattern: `Math.pow(2, Math.floor(attempts / 5)) * 60 * 1000`

**Important**: `verifyPIN()` throws errors for lockout - callers must handle exceptions.

### Brightness Value Conversion
BrightnessControlModule uses **quadratic curve (Gamma 2.0)** for perception matching:
- User percent (0-100) → System value: `normalizedValue = (percent/100)^2`
- System value → User percent: `percent = sqrt(normalizedValue) * 100`

This matches Android's slider behavior where 50% appears perceptually half bright.

### AdMob Configuration Pattern
Ad configuration centralized in `src/config/admob.js`:
```javascript
const AdMobConfig = {
  USE_TEST_ADS: true,  // Set to false for production
  APP_ID: 'ca-app-pub-...',
  AD_UNIT_ID: 'ca-app-pub-...',
};
```

**Important**:
- Set `USE_TEST_ADS: false` for production builds
- App ID must match the one in `AndroidManifest.xml`
- Test ad units are automatically used in `__DEV__` mode

### Ad Timing Storage
Ad timestamps stored in AsyncStorage with these keys:
```javascript
KEYS.LAST_AD_SHOWN = 'last_ad_shown'
```

**Ad timing functions** in `storage.js`:
- `saveLastAdShownTime()`: Save current timestamp after ad shown
- `getLastAdShownTime()`: Retrieve last ad timestamp (throws on error)
- `canShowAd()`: Check if 6 hours have elapsed (returns false on error)

**Error handling**: Conservative approach - if storage fails, `canShowAd()` returns `false` to prevent ad spam.

## Common Development Tasks

### Testing Native Modules

```bash
# Enable verbose logging
npx react-native log-android

# In JavaScript code
console.log('Setting volume to 50...');
await VolumeControl.setVolume(50);
console.log('Volume set successfully');

# Check Android logs for TAG = "VolumeControlModule" or "BrightnessControlModule"
```

For native Java/Kotlin changes:
1. Edit `.java` or `.kt` file
2. Run clean build (see commands above)
3. Metro bundler does NOT pick up native changes automatically

### Adding Storage Keys

1. Add to `KEYS` object in `src/utils/storage.js`
2. Create getter/setter functions following existing patterns
3. Use AsyncStorage for non-sensitive data, Keychain for sensitive data

### Testing AdMob Integration

**Viewing ad events in logs**:
```bash
npx react-native log-android | grep AdMob
```

**Force showing ads (bypasses 6-hour check)**:
```javascript
import { forceShowAd } from './src/utils/admobControl';
await forceShowAd();  // For testing only
```

**Testing ad timing logic**:
```javascript
import { canShowAd, saveLastAdShownTime } from './src/utils/storage';

// Check if eligible
const eligible = await canShowAd();  // Returns true if 6+ hours elapsed

// Manually save timestamp (simulates ad shown)
await saveLastAdShownTime();
```

**Unit testing with AdMob**:
- Use `__resetAdMobForTesting()` in test setup to clear module state
- Mock `react-native-google-mobile-ads` module in test files
- See `src/utils/__tests__/admobControl.test.js` for examples

**Important**: Always use test ad units during development. Set `USE_TEST_ADS: true` in `src/config/admob.js`.

## Key Dependencies

### Core React Native
- `react-native`: 0.73.6
- `react`: 18.2.0

### Navigation
- `@react-navigation/native`: ^6.1.17
- `@react-navigation/stack`: ^6.3.29

### UI Components
- `react-native-paper`: ^5.14.5
- `react-native-vector-icons`: ^10.3.0

### Storage & Security
- `@react-native-async-storage/async-storage`: ^2.2.0
- `react-native-keychain`: ^10.0.0 (hardware-encrypted PIN storage)

### Device Control
- Custom native modules (VolumeControlModule, BrightnessControlModule)

### Monetization
- `react-native-google-mobile-ads`: ^14.2.4
  - **Minimum SDK**: Android API 23 (Android 6.0+)
  - **Purpose**: Interstitial ad delivery
  - **Configuration**: `src/config/admob.js` + `AndroidManifest.xml`

### Localization
- `i18n-js`: ^4.5.1
- `react-native-localize`: ^3.6.0

### Testing
- `jest`: ^29.6.3
- `@testing-library/react-native`: ^13.3.3

**Important version notes**:
- Google Mobile Ads v14.2.4 is compatible with Kotlin 1.9.22 (later versions require Kotlin 2.x which conflicts with other RN libraries)
- minSdkVersion must be 23+ (changed from 21) due to Google Mobile Ads SDK requirement

## Migration Notes (Expo → React Native CLI)

### Replaced Dependencies
- `expo-secure-store` → `react-native-keychain`
- `expo-brightness` → Custom `BrightnessControlModule.java`
- `expo-task-manager` → Native foreground service pattern (not yet implemented)

### API Changes
```javascript
// OLD (Expo):
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('PIN', value);

// NEW (React Native CLI):
import * as Keychain from 'react-native-keychain';
await Keychain.setGenericPassword('PIN', value, { service: 'parent_pin' });
```

### Volume Control: Mock → Real
Expo version had **mock** volume control. React Native CLI version has **real** Android AudioManager integration.

### Not Yet Migrated
- **Foreground Service**: App doesn't yet implement persistent foreground service for 24/7 enforcement. Volume uses ContentObserver (instant), brightness uses JavaScript polling (2-second intervals). For production, implement native foreground service using `@notifee/react-native`.

## Troubleshooting

### Build Fails After Adding Native Code
```bash
# Clean everything and rebuild
cd android
.\gradlew.bat clean  # Windows
./gradlew clean      # macOS/Linux
cd ..
rm -rf node_modules  # macOS/Linux
rmdir /s /q node_modules  # Windows
npm install
npx react-native run-android
```

### Metro Bundler Issues
```bash
# Clear Metro cache
npx react-native start --reset-cache

# In separate terminal
npx react-native run-android
```

### Native Module Not Found
1. Verify module in `VolumeControlPackage.java`
2. Verify package registered in `MainApplication.kt`
3. Clean rebuild
4. Check module name spelling (case-sensitive)

### Volume/Brightness Not Enforcing

**Volume issues**:
- Check `MODIFY_AUDIO_SETTINGS` permission in manifest
- Check logs for "Volume observer registered"
- Ensure `startEnforcing()` called, not just `setVolume()`

**Brightness issues**:
- Check `WRITE_SETTINGS` permission granted
- Window brightness works without permission, system brightness needs it
- Check logs for polling every 2 seconds

### App Killed in Background
For production:
1. Implement native foreground service
2. Show persistent notification (required)
3. Request battery optimization exemption

### AdMob Ads Not Showing

**Check initialization**:
- Verify `initializeAdMob()` called in `App.tsx`
- Check logs for "[AdMob] AdMob initialized successfully"
- Ensure no initialization errors in logs

**Check eligibility**:
- Ads only show once every 6 hours
- Use `forceShowAd()` for testing (bypasses time check)
- Check logs for "[AdMob] Eligible to show ad" or "[AdMob] Too soon to show ad"

**Check test mode**:
- Development: Set `USE_TEST_ADS: true` in `src/config/admob.js`
- Production: Set `USE_TEST_ADS: false`
- Test ads have Google branding and show immediately

**Check minSdkVersion**:
- Must be API 23+ in `android/build.gradle`
- If you see "version 21 cannot be smaller than version 23", update minSdkVersion

**Check App ID in manifest**:
- `AndroidManifest.xml` must have `com.google.android.gms.ads.APPLICATION_ID` metadata
- Value must match `APP_ID` in `src/config/admob.js`

**Common issues**:
- Ad not loaded: Wait for LOADED event, check logs for "Interstitial ad loaded"
- Network errors: Test ads require internet connection
- Frequency limit: Clear app data or wait 6 hours between ad displays

## Important Files Reference

| File | Purpose |
|------|---------|
| `App.tsx` | Root component, navigation, initialization, AdMob integration |
| `src/screens/HomeScreen.js` | Main screen showing lock status |
| `src/screens/ParentSettingsScreen.js` | Control panel for settings |
| `src/utils/storage.js` | Data persistence (Keychain + AsyncStorage + Ad timing) |
| `src/utils/volumeControl.js` | JS bridge to VolumeControlModule |
| `src/utils/brightnessControl.js` | JS bridge to BrightnessControlModule |
| `src/utils/admobControl.js` | AdMob SDK integration and ad display logic |
| `src/config/admob.js` | AdMob configuration (App ID, Ad Unit ID, test mode) |
| `src/utils/__tests__/admobControl.test.js` | Unit tests for AdMob functionality |
| `android/app/src/main/java/com/kidsguard/VolumeControlModule.java` | Native volume control |
| `android/app/src/main/java/com/kidsguard/BrightnessControlModule.java` | Native brightness control |
| `android/app/src/main/java/com/kidsguard/VolumeControlPackage.java` | Package registration |
| `android/app/src/main/java/com/kidsguard/MainApplication.kt` | Module registration |
| `android/app/src/main/AndroidManifest.xml` | Permissions, config, AdMob App ID |

## Package Structure

- **Android package**: `com.kidsguard`
- **App display name**: "Kids guard - Parental control"
- **NPM package name**: `kids-guard-parental-control`
- **Main component name**: `kids-guard-parental-control`
