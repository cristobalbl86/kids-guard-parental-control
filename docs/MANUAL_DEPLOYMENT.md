# Manual Deployment Guide

Complete guide for manually building and deploying your app to Google Play Store.

## Overview

This guide covers manual deployment without CI/CD automation. Use this approach:
- For your first release
- When you don't need automated deployments
- To test the release process before setting up CI/CD

---

## Prerequisites

Before you start:

- ✅ Google Play Console app created
- ✅ Privacy policy and store listing completed
- ✅ Release keystore generated
- ✅ Keystore password saved

---

## Step 1: Configure Release Signing

### Create gradle.properties

Create `android/gradle.properties` with your keystore passwords:

```properties
RELEASE_STORE_PASSWORD=your_keystore_password
RELEASE_KEY_PASSWORD=your_key_password
```

**Replace** `your_keystore_password` and `your_key_password` with your actual passwords.

**Security Note**: This file is in `.gitignore` and won't be committed to Git.

### Verify Keystore Location

Ensure your keystore exists at:
```
android/app/release.keystore
```

If not, generate it:
```powershell
.\scripts\generate-keystore.ps1
```

---

## Step 2: Set Production Configuration

The app needs to use production ads (not test ads) for release:

```powershell
# From project root
node scripts/prepare-production.js
```

This automatically sets `USE_TEST_ADS: false` in `src/config/admob.js`.

---

## Step 3: Update Version (For Subsequent Releases)

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.kidsguard"
    versionCode 1        // Increment this (2, 3, 4...)
    versionName "1.0.0"  // Update version (1.0.1, 1.1.0, etc.)
}
```

**Rules**:
- `versionCode`: Must increase with every release (integer)
- `versionName`: User-facing version string

**For first release**: Leave as `versionCode 1` and `versionName "1.0.0"`

---

## Step 4: Build Release AAB

### Clean Previous Builds

```powershell
cd android
.\gradlew.bat clean
```

### Build Android App Bundle

```powershell
.\gradlew.bat bundleRelease
```

**Expected output**:
```
BUILD SUCCESSFUL in Xm Xs
```

**Output location**:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Common Build Errors

**Error: "Keystore password incorrect"**
- Solution: Check passwords in `android/gradle.properties`

**Error: "SDK not found"**
- Solution: Open Android Studio, let it sync
- Or set `ANDROID_HOME` environment variable

**Error: API level errors**
- Solution: Ensure `compileSdkVersion = 35` in `android/build.gradle`

---

## Step 5: Upload to Play Console

### First Release: Internal Testing Required

**Important**: For your FIRST release, you MUST use Internal Testing track.

1. Go to [Play Console](https://play.google.com/console)
2. Select your app: **Kids Guard - Parental Control**
3. Left sidebar: **Testing** → **Internal testing**
4. Click **Testers** tab
5. Click **Create email list**
6. Add your email address (required)
7. Click **Save**

### Create Release

1. Go to **Releases** tab in Internal testing
2. Click **Create new release**
3. Under **App bundles**, click **Upload**
4. Select: `android/app/build/outputs/bundle/release/app-release.aab`
5. Wait for upload and processing (~2-3 minutes)

**Google will process your bundle**:
- ✅ Scans for malware
- ✅ Validates signing
- ✅ Checks API level (must be 35+)
- ✅ Optimizes for different devices

### Add Release Notes

In the **Release notes** field:

```
Initial release

Features:
• Lock device volume at safe levels
• Control screen brightness
• PIN-protected parent settings
• Simple and easy to use parental control
```

### Review Release

1. Click **Review release**
2. Check for errors or warnings:
   - ❌ **Error**: Must fix before proceeding
   - ⚠️ **Warning**: Can proceed but should address

**Common Errors**:
- "API level X required" → Update `targetSdkVersion` in build.gradle
- "Signed in debug mode" → Check `gradle.properties` has correct passwords
- "Missing privacy policy" → Add privacy policy URL in Play Console

### Start Rollout

1. After reviewing, click **Start rollout to Internal testing**
2. Confirm the rollout

---

## Step 6: Wait for Google Review

### First Release Review

For your **first app release**, Google reviews:
- App content compliance
- Policy violations
- Security issues
- Functionality

**Timeline**: 1-7 days (usually 1-2 days for internal testing)

You'll receive an email when:
- ✅ Review is complete
- ✅ App is available on Internal testing track
- ❌ Review is rejected (with reasons)

### Check Review Status

1. Play Console → Your App → **Dashboard**
2. Look for **Review status** card
3. Statuses:
   - **In review**: Google is reviewing
   - **Approved**: Ready to use
   - **Rejected**: Check email for issues

---

## Step 7: Test on Internal Track

Once approved:

### Install Internal Testing Build

1. Open the email from Google Play
2. Click the **opt-in link**
3. Or go to Play Console → Internal testing → **Testers** tab
4. Copy the **opt-in URL**
5. Open on your Android device
6. Install and test the app

### Verify Production Behavior

Test:
- ✅ Production ads show (not test ads with Google branding)
- ✅ All features work correctly
- ✅ No crashes or errors
- ✅ PIN protection works
- ✅ Volume/brightness controls function

---

## Step 8: Promote to Production

Once internal testing is successful:

### Promote Release

1. Go to **Production** track in Play Console
2. Click **Create new release** or **Promote release**
3. Select the internal testing release to promote
4. Review the release

### Select Countries

1. In the **Countries/regions** section
2. Click **Add countries/regions**
3. Select countries where you want the app available:
   - **All countries** (recommended for maximum reach)
   - **Specific countries** (e.g., US, UK, Canada, etc.)
4. Click **Add**

### Choose Rollout Percentage

For first production release:
- **Start at 10%**: Gradual rollout to catch issues early
- **Monitor for 24-48 hours**: Check crash reports and reviews
- **Increase to 50%**: If stable
- **Increase to 100%**: Full rollout

Or:
- **100% immediately**: If you're confident from internal testing

### Submit for Production Review

1. Click **Review release**
2. Check warnings/errors
3. Click **Start rollout to Production**

**Production Review Timeline**: 3-7 days (sometimes longer)

---

## Step 9: Monitor After Production Release

### Check Vitals

1. Play Console → Your App → **Vitals**
2. Monitor:
   - **Crash rate**: Should be < 1%
   - **ANR rate**: Should be < 0.5%
   - **Battery usage**: Should be low

### Respond to Reviews

1. Play Console → **Ratings and reviews**
2. Respond to user feedback
3. Address common issues in updates

### Track Installations

1. Play Console → **Statistics**
2. Monitor:
   - Installations per day
   - Active users
   - Uninstalls

---

## Subsequent Releases

For future updates:

### Update Version

```gradle
// android/app/build.gradle
defaultConfig {
    versionCode 2        // Increment: 2, 3, 4...
    versionName "1.0.1"  // Update: 1.0.1, 1.1.0, 2.0.0
}
```

### Build and Upload

```powershell
# Set production config
node scripts/prepare-production.js

# Build
cd android
.\gradlew.bat clean
.\gradlew.bat bundleRelease
cd ..
```

### Skip Internal Testing

After first release approval, you can release directly to Production:

1. Go to **Production** track
2. Create new release
3. Upload AAB
4. Add release notes (describe what changed)
5. Rollout

---

## Troubleshooting

### Build Issues

**"Could not find or load main class org.gradle.wrapper.GradleWrapperMain"**
```powershell
# Re-download Gradle wrapper
cd android
.\gradlew.bat wrapper --gradle-version 8.3
```

**"Execution failed for task ':app:packageRelease'"**
```powershell
# Clean and rebuild
.\gradlew.bat clean
.\gradlew.bat bundleRelease
```

### Upload Issues

**"You uploaded an APK or AAB signed in debug mode"**
- Check `android/gradle.properties` has correct passwords
- Verify keystore exists at `android/app/release.keystore`
- Rebuild: `.\gradlew.bat clean bundleRelease`

**"Version code X has already been used"**
- Increment `versionCode` in `android/app/build.gradle`
- Must be higher than any previous release

**"API level X required"**
- Ensure `targetSdkVersion = 35` in `android/build.gradle`
- Rebuild with new target

### Review Issues

**"Policy violation: Misleading claims"**
- Ensure app description is accurate
- Don't promise features that don't exist
- Update store listing if needed

**"Privacy policy required"**
- Add privacy policy URL in Play Console
- Policy must be publicly accessible

**"Content rating required"**
- Complete IARC content rating questionnaire
- In Play Console → Policy → Content ratings

---

## Release Checklist

Before each release:

### Build Checklist
- [ ] `versionCode` incremented
- [ ] `versionName` updated
- [ ] Production config set (`USE_TEST_ADS: false`)
- [ ] `gradle.properties` has correct passwords
- [ ] Clean build completed successfully
- [ ] AAB file generated

### Play Console Checklist
- [ ] Release notes written
- [ ] Screenshots updated (if UI changed)
- [ ] Privacy policy accessible
- [ ] Store listing accurate
- [ ] Countries selected
- [ ] Rollout percentage chosen

### Testing Checklist
- [ ] Internal testing approved (first time)
- [ ] App installs correctly
- [ ] Production ads display
- [ ] No crashes on startup
- [ ] Key features tested
- [ ] Performance is acceptable

### Post-Release Checklist
- [ ] Monitor crash reports (first 24 hours)
- [ ] Check user reviews
- [ ] Respond to early feedback
- [ ] Increase rollout if stable

---

## Best Practices

### Versioning Strategy

Use semantic versioning:
- **Major**: `2.0.0` - Major new features or breaking changes
- **Minor**: `1.1.0` - New features, non-breaking
- **Patch**: `1.0.1` - Bug fixes only

### Release Notes

Good release notes:
```
Version 1.1.0

New Features:
• Added schedule-based volume control
• Improved brightness enforcement

Bug Fixes:
• Fixed crash on startup for some devices
• Corrected ad display frequency

Performance:
• Reduced battery usage by 15%
```

### Gradual Rollout

Always use gradual rollout for Production:
1. **Day 1**: 10% rollout
2. **Day 2-3**: Monitor crashes, increase to 50%
3. **Day 4-5**: If stable, increase to 100%

### Backup

Before each release:
- ✅ Commit all code changes to Git
- ✅ Tag the release: `git tag v1.0.0`
- ✅ Backup keystore file securely
- ✅ Save keystore passwords

---

## Quick Reference

### Build Commands

```powershell
# Production build
node scripts/prepare-production.js
cd android
.\gradlew.bat clean
.\gradlew.bat bundleRelease
cd ..
```

### File Locations

```
Release AAB:        android/app/build/outputs/bundle/release/app-release.aab
Release Keystore:   android/app/release.keystore
Gradle Properties:  android/gradle.properties
Version Config:     android/app/build.gradle
```

### Play Console Links

- **Internal testing**: Testing → Internal testing
- **Production**: Production → Releases
- **Vitals**: Monitor and improve → Vitals
- **Reviews**: Ratings and reviews

---

## Next Steps

After successful manual deployment:

1. **Monitor your app** for first week
2. **Gather user feedback** and plan updates
3. **Consider setting up CI/CD** for automated deployments
   - See [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
   - Configure GitHub Actions for automatic releases

---

## Support

- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Release Documentation**: https://developer.android.com/studio/publish
- **Version Requirements**: https://developer.android.com/distribute/best-practices/develop/target-sdk

---

**Ready to release?** Follow the steps above and you'll have your app live on Google Play!
