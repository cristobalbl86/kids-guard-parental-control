# Building a Release APK/AAB

This guide explains how to build a release APK or AAB for the Kids Guard app.

## Prerequisites

- Node.js 18+
- Android Studio with Android SDK (API 35+)
- React Native development environment configured
- Release keystore generated

## Important: API Level Requirement

Google Play requires apps to target **API level 35** (Android 15).

The app is already configured for API 35 in `android/build.gradle`:
```gradle
compileSdkVersion = 35
targetSdkVersion = 35
```

## Quick Build for Play Store

### Step 1: Configure Signing

Create `android/gradle.properties` with your keystore passwords:

```properties
RELEASE_STORE_PASSWORD=your_keystore_password
RELEASE_KEY_PASSWORD=your_key_password
```

**Security**: This file is in `.gitignore` and won't be committed.

### Step 2: Set Production Config

```bash
# Set USE_TEST_ADS to false
node scripts/prepare-production.js
```

### Step 3: Build AAB (Recommended for Play Store)

```bash
# From project root
cd android
.\gradlew.bat clean              # Windows
.\gradlew.bat bundleRelease      # Windows

./gradlew clean                  # macOS/Linux
./gradlew bundleRelease          # macOS/Linux
```

The AAB will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

**Why AAB?** Google Play requires AAB format for new apps. AAB is smaller and optimized per device.

## Production Build (With Custom Keystore)

For Google Play Store submission, you need a properly signed APK.

### Step 1: Generate a Release Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/release.keystore \
  -alias kidsguard-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be prompted to enter:
- Keystore password
- Key password
- Your name, organization, city, state, and country code

**IMPORTANT**: Store this keystore and passwords securely. If you lose them, you cannot update your app on Google Play.

### Step 2: Configure Signing in build.gradle

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('release.keystore')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'kidsguard-release'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true  // Enable ProGuard for smaller APK
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

### Step 3: Secure Your Credentials (Recommended)

Instead of hardcoding passwords, use `gradle.properties`:

1. Create or edit `android/gradle.properties`:
```properties
RELEASE_STORE_PASSWORD=your_store_password
RELEASE_KEY_PASSWORD=your_key_password
```

2. Update `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('release.keystore')
        storePassword RELEASE_STORE_PASSWORD
        keyAlias 'kidsguard-release'
        keyPassword RELEASE_KEY_PASSWORD
    }
}
```

3. Add `android/gradle.properties` to `.gitignore` to avoid committing passwords.

### Step 4: Build the Release APK

```bash
# Clean previous builds
cd android
.\gradlew.bat clean        # Windows
./gradlew clean            # macOS/Linux

# Build release APK
.\gradlew.bat assembleRelease   # Windows
./gradlew assembleRelease       # macOS/Linux
```

## Building an Android App Bundle (AAB)

Google Play now requires AAB format instead of APK for new apps:

```bash
cd android
.\gradlew.bat bundleRelease   # Windows
./gradlew bundleRelease       # macOS/Linux
```

The bundle will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Pre-Build Checklist

Before building for production:

1. **AdMob Configuration**: Set `USE_TEST_ADS: false` in `src/config/admob.js`
2. **Version Update**: Update `versionCode` and `versionName` in `android/app/build.gradle`
3. **App Icons**: Ensure production icons are in `android/app/src/main/res/`
4. **ProGuard Rules**: Review `android/app/proguard-rules.pro` if enabling minification

## Verifying the APK

After building, you can verify the APK is properly signed:

```bash
# Check APK signing info
keytool -printcert -jarfile android/app/build/outputs/apk/release/app-release.apk

# Or using apksigner (requires Android SDK build-tools)
apksigner verify --print-certs android/app/build/outputs/apk/release/app-release.apk
```

## Installing the Release APK

To install on a connected device:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

Or navigate to the APK file and transfer it to your device.

## Troubleshooting

### Build fails with "keystore not found"
- Ensure the keystore file exists at the specified path
- Check that the path in `build.gradle` is correct

### "Keystore was tampered with, or password was incorrect"
- Verify the keystore password is correct
- Ensure the keystore file hasn't been corrupted

### App crashes on startup
- Check that AdMob App ID in `AndroidManifest.xml` matches `src/config/admob.js`
- Review logcat output: `npx react-native log-android`

### ProGuard issues
- If the app crashes with minification enabled, add necessary rules to `proguard-rules.pro`
- Test thoroughly before submitting to Play Store
