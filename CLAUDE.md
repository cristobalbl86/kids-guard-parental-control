# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Family Helper RN** is a React Native parental control application that allows parents to control and lock device settings (volume and brightness) on Android devices. The app has been migrated from Expo to React Native CLI to enable real native control capabilities.

**Key Purpose**: Enable parents to set and lock volume/brightness levels that children cannot override, with enforcement happening at the native Android level.

## Build and Run Commands

### Development
```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android
# OR: npx react-native run-android

# View Android logs
npx react-native log-android

# Run linting
npm run lint

# Run tests
npm test
```

### Clean Build (When Dependencies Change)
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

This app follows a **hybrid architecture** with React Native JavaScript UI layer communicating with native Android modules for hardware control:

```
React Native (JavaScript)
  ├── Screens (UI Components)
  ├── Utils (Business Logic)
  │   ├── storage.js - AsyncStorage + Keychain
  │   ├── volumeControl.js - Bridge to VolumeControlModule
  │   └── brightnessControl.js - Bridge to BrightnessControlModule
  └── Native Bridge (NativeModules)
         ↓
Native Android (Java)
  ├── VolumeControlModule.java - AudioManager + ContentObserver
  ├── BrightnessControlModule.java - System brightness control
  └── MainApplication.kt - Registers native modules
```

### Critical Architecture Details

#### 1. Native Module Communication Pattern
The app uses **bidirectional communication** between JavaScript and native code:
- **JS → Native**: Call methods via `NativeModules.VolumeControl.setVolume(50)`
- **Native → JS**: Send events via `NativeEventEmitter` for enforcement notifications

#### 2. Volume Enforcement Strategy
Volume enforcement uses Android's **ContentObserver pattern**:
- `VolumeControlModule.java` registers a ContentObserver on the system volume settings URI
- When hardware volume buttons are pressed, the observer detects the change **instantly**
- The module automatically reverts to the enforced volume level
- This happens in native code for maximum reliability (no JavaScript event loop delays)

#### 3. Brightness Enforcement Strategy
Brightness uses a **dual-layer approach**:
- **Window-level**: `BrightnessControlModule.java` sets window brightness (always works, no permission needed)
- **System-level**: Also sets system brightness if `WRITE_SETTINGS` permission granted
- **JavaScript polling**: `brightnessControl.js` runs a 2-second interval to detect manual changes and re-enforce

**Why polling for brightness but not volume?**
- Android has no ContentObserver for brightness changes
- Volume changes trigger system callbacks, brightness does not
- 2-second polling is acceptable tradeoff for brightness enforcement

#### 4. Secure Storage Pattern
The app uses **two storage mechanisms** for different security needs:
- **react-native-keychain**: For sensitive data (parent PIN) - hardware-encrypted
- **AsyncStorage**: For non-sensitive settings (volume/brightness preferences)

Migration note: Previously used Expo SecureStore, now uses react-native-keychain with service-specific storage:
```javascript
// PIN stored with service identifier
await Keychain.setGenericPassword('PIN', value, { service: 'parent_pin' })
```

#### 5. Navigation Flow Architecture
The app uses **conditional navigation** based on setup state:
```
isSetupComplete = false:
  Welcome → ParentVerification → SetupPIN

isSetupComplete = true:
  Home → PINEntry → ParentSettings
```

State managed in `App.tsx` with `isSetupComplete` controlling which navigation stack is mounted.

## Native Modules

### VolumeControlModule.java
**Location**: `android/app/src/main/java/com/familyhelperrn/VolumeControlModule.java`

**Key Methods**:
- `setVolume(int)`: Set system volume 0-100%
- `getVolume()`: Get current system volume
- `startEnforcing(int)`: Lock volume at specific level (starts ContentObserver)
- `stopEnforcing()`: Unlock volume (removes ContentObserver)
- `isEnforcingVolume()`: Check enforcement status

**Critical Implementation Detail**:
The ContentObserver runs on the **main UI thread handler** to ensure immediate enforcement. Do not move to background thread or enforcement will be delayed.

### BrightnessControlModule.java
**Location**: `android/app/src/main/java/com/familyhelperrn/BrightnessControlModule.java`

**Key Methods**:
- `setBrightness(int)`: Set screen brightness 0-100%
- `getBrightness()`: Get current brightness
- `checkWriteSettingsPermission()`: Check if system brightness permission granted

**Important**: This module can **only set window brightness** directly. System brightness requires the WRITE_SETTINGS permission which must be requested at runtime and granted by user navigating to Settings.

### Module Registration
Both modules are registered in `MainApplication.kt`:
```kotlin
override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(
        VolumeControlModule(reactContext),
        BrightnessControlModule(reactContext)
    )
}
```

**If you add a new native module**, you must:
1. Create the module class extending `ReactContextBaseJavaModule`
2. Create a package class extending `ReactPackage` (or add to existing VolumeControlPackage)
3. Register in `MainApplication.kt` `createNativeModules()`
4. Rebuild with `cd android && .\gradlew.bat clean` (Windows) or `cd android && ./gradlew clean` (macOS/Linux)

## Required Permissions

Defined in `android/app/src/main/AndroidManifest.xml`:

- **MODIFY_AUDIO_SETTINGS**: Required for volume control
- **WRITE_SETTINGS**: Required for system-level brightness (runtime permission)
- **FOREGROUND_SERVICE**: For persistent background monitoring
- **POST_NOTIFICATIONS**: Required for foreground service notification (Android 13+)
- **RECEIVE_BOOT_COMPLETED**: Auto-start enforcement after device reboot
- **WAKE_LOCK**: Prevent enforcement service from sleeping
- **REQUEST_IGNORE_BATTERY_OPTIMIZATIONS**: Prevent Android from killing enforcement

**Note**: WRITE_SETTINGS is a special permission that cannot be requested via standard permission dialog. The app must direct users to Settings to grant it manually.

## Code Patterns and Conventions

### Storage Keys Pattern
All storage keys are centralized in `src/utils/storage.js`:
```javascript
const KEYS = {
  FIRST_LAUNCH: 'first_launch',
  PIN: 'parent_pin',
  VOLUME_SETTINGS: 'volume_settings',
  // ...
}
```
**Never hardcode storage keys** elsewhere - always import from `KEYS` object.

### Settings Object Pattern
Volume and brightness settings follow consistent structure:
```javascript
{
  volume: 50,      // 0-100
  locked: false    // true = enforcing
}
```
When modifying one control system, apply same pattern to the other.

### PIN Verification with Lockout
`storage.js` implements **exponential backoff lockout**:
- After 5 failed attempts: Lock out for 60 seconds
- After 10 failed attempts: Lock out for 120 seconds
- Pattern: `Math.pow(2, Math.floor(attempts / 5)) * 60 * 1000`

**Important**: `verifyPIN()` throws errors for lockout - callers must handle the exception and display the message to users.

## Common Development Tasks

### Adding a New Control Feature

If adding a new device control (e.g., WiFi lock, app restrictions):

1. **Create native module** in `android/app/src/main/java/com/familyhelperrn/`:
   ```java
   public class NewControlModule extends ReactContextBaseJavaModule {
       @ReactMethod
       public void setNewSetting(int value, Promise promise) { }
   }
   ```

2. **Register module** in `VolumeControlPackage.java` or create new package

3. **Create JavaScript utility** in `src/utils/newControl.js`:
   ```javascript
   import { NativeModules } from 'react-native';
   const { NewControl } = NativeModules;

   export const setNewSetting = async (value) => {
       return await NewControl.setNewSetting(value);
   };
   ```

4. **Add storage helpers** to `src/utils/storage.js` for persisting settings

5. **Update UI** in `ParentSettingsScreen.js` to expose the control

### Testing Native Modules

To test native modules during development:

```bash
# Enable verbose logging
npx react-native log-android

# In JavaScript code, add console.log before/after native calls
console.log('Setting volume to 50...');
await VolumeControl.setVolume(50);
console.log('Volume set successfully');

# Check Android logs for native-side logging
# Look for TAG = "VolumeControlModule" or "BrightnessControlModule"
```

For native Java changes:
1. Edit `.java` file
2. Run `cd android && .\gradlew.bat clean` (Windows) or `cd android && ./gradlew clean` (macOS/Linux)
3. Rebuild with `npx react-native run-android`
4. Metro bundler does NOT pick up native changes automatically

## Migration Notes (Expo → React Native CLI)

This project was migrated from Expo to React Native CLI. Key changes:

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
The Expo version had **mock** volume control (console.log only). The React Native CLI version has **real** Android AudioManager integration that actually works.

### What's Not Yet Migrated
- **Foreground Service**: The app does not yet implement a persistent foreground service for 24/7 enforcement. Volume enforcement uses ContentObserver (instant), brightness uses JavaScript polling (2-second intervals). For production, implement a native foreground service using `@notifee/react-native`.

## Troubleshooting

### Build Fails After Adding Native Code
```bash
# On Windows:
cd android
.\gradlew.bat clean
cd ..
rmdir /s /q node_modules
npm install
npx react-native run-android

# On macOS/Linux:
cd android
./gradlew clean
cd ..
rm -rf node_modules
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
1. Verify module is registered in `MainApplication.kt`
2. Check `VolumeControlPackage.java` includes the module
3. Clean and rebuild: `cd android && .\gradlew.bat clean` (Windows) or `cd android && ./gradlew clean` (macOS/Linux)
4. Check for typos in module name (case-sensitive)

### Volume/Brightness Not Enforcing
**Volume issues**:
- Check `MODIFY_AUDIO_SETTINGS` permission in manifest
- Verify ContentObserver is registered (check logs for "Volume observer registered")
- Ensure `startEnforcing()` was called, not just `setVolume()`

**Brightness issues**:
- Check `WRITE_SETTINGS` permission granted (runtime permission)
- Window brightness always works, system brightness needs permission
- Verify JavaScript polling interval is running (check logs every 2 seconds)

### App Killed in Background
Android's battery optimization kills apps aggressively. For production:
1. Implement native foreground service
2. Show persistent notification (required for foreground service)
3. Request battery optimization exemption: `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`

## Important Files Reference

| File | Purpose |
|------|---------|
| `App.tsx` | Root component, navigation setup, initialization |
| `src/screens/HomeScreen.js` | Main screen showing current lock status |
| `src/screens/ParentSettingsScreen.js` | Control panel for volume/brightness settings |
| `src/utils/storage.js` | All data persistence (Keychain + AsyncStorage) |
| `src/utils/volumeControl.js` | JavaScript bridge to VolumeControlModule |
| `src/utils/brightnessControl.js` | JavaScript bridge to BrightnessControlModule |
| `android/app/src/main/java/com/familyhelperrn/VolumeControlModule.java` | Native volume control implementation |
| `android/app/src/main/java/com/familyhelperrn/BrightnessControlModule.java` | Native brightness control implementation |
| `android/app/src/main/java/com/familyhelperrn/MainApplication.kt` | Native module registration |
| `android/app/src/main/AndroidManifest.xml` | Permissions and app configuration |

## Testing Checklist

When making changes, verify:

**Basic Functionality**:
- [ ] App builds and launches without errors
- [ ] Initial setup flow works (Welcome → Verification → PIN setup)
- [ ] PIN verification works and is stored securely

**Volume Control**:
- [ ] Setting volume actually changes device volume
- [ ] Locking volume starts enforcement
- [ ] Pressing hardware volume buttons triggers auto-revert
- [ ] Console shows "Volume enforced" messages

**Brightness Control**:
- [ ] Setting brightness actually changes screen brightness
- [ ] Locking brightness starts enforcement (2-second polling)
- [ ] Manually changing brightness reverts after ~2 seconds
- [ ] Console shows "Brightness enforced" messages

**Persistence**:
- [ ] Closing and reopening app maintains settings
- [ ] Enforcement continues after app restart
- [ ] PIN is not lost after app restart
