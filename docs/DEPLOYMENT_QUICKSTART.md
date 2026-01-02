# Deployment Quick Start Guide

Fast track guide to deploy Kids Guard to Google Play Store using GitHub Actions.

## Overview

This repo is configured for automated deployment to Google Play Store via GitHub Actions. The workflow:
- ✅ Runs all tests
- 🔧 Automatically sets `USE_TEST_ADS: false` for production
- 🔐 Signs with your release keystore
- 📦 Builds Android App Bundle (AAB)
- 🚀 Uploads to Google Play Console

## Prerequisites Checklist

- [ ] Google Play Developer account ($25 one-time fee)
- [ ] App created in Play Console
- [ ] Release keystore generated
- [ ] Service account created with Play Console access
- [ ] App icons and graphics ready
- [ ] GitHub repository access

## Step-by-Step Setup

### 1. Generate Release Keystore (5 minutes)

#### Option A: Automated Script (Recommended for Windows)

From project root in PowerShell:

```powershell
.\scripts\generate-keystore.ps1
```

This automatically finds `keytool.exe` and generates the keystore at `android\app\release.keystore`.

#### Option B: Manual Command

**Windows PowerShell** (single line - easier to copy):

```powershell
cd android\app
& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias kidsguard-release -keyalg RSA -keysize 2048 -validity 10000
```

**macOS/Linux**:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias kidsguard-release -keyalg RSA -keysize 2048 -validity 10000
```

**Note**: If `keytool` is not found on Windows, the path may be different. Common locations:
- `C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe`
- `C:\Program Files\Android\Android Studio\jre\bin\keytool.exe`
- `%JAVA_HOME%\bin\keytool.exe`

Use the automated script to find it automatically.

**You'll be prompted for**:
- Keystore password (create a strong one)
- Key password (create a strong one)
- Name, organization, location info

**Save these SECURELY** (password manager recommended):
- Keystore password
- Key password
- `android\app\release.keystore` file (backup to secure location)

### 2. Create Google Play Service Account (15 minutes)

**Important**: You need a Google Cloud project first!

#### A. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the **project dropdown** at top (or "Select a project")
3. Click **"NEW PROJECT"**
4. Enter project name: `Kids Guard App`
5. Click **"CREATE"** and wait ~30 seconds
6. **Select the project** from dropdown

#### B. Enable Play Developer API

1. Search for "Google Play Android Developer API"
2. Click **"ENABLE"**

#### C. Create Service Account

1. Go to **IAM & Admin** > **Service Accounts** (left menu)
2. Click **"CREATE SERVICE ACCOUNT"**
3. Fill in:
   - Name: `github-actions-play-deploy`
   - Description: `Service account for CI/CD`
4. Click **"CREATE AND CONTINUE"**
5. Skip optional steps, click **"DONE"**

#### D. Download JSON Key

1. Click on the service account you just created
2. Go to **KEYS** tab
3. Click **"ADD KEY"** > **"Create new key"**
4. Select **JSON** format
5. Click **"CREATE"** - JSON file downloads

**Save this JSON file securely - you'll need it for GitHub Secrets!**

#### E. Link to Play Console

1. Go to [Play Console](https://play.google.com/console)
2. Go to **Setup** > **API access** (under Settings)
3. Click **"Link a Google Cloud project"**
4. Select your project (`Kids Guard App`)
5. Click **"Link"**

#### F. Grant Permissions

1. Under **Service accounts**, find `github-actions-play-deploy`
2. Click **"Manage Play Console permissions"**
3. Grant these permissions:
   - ✅ View app information
   - ✅ Create and edit draft releases
   - ✅ Release apps
   - ✅ Manage testing tracks
4. Click **"Invite user"** → **"Send invite"**

**Detailed guide**: [GOOGLE_PLAY_DEPLOYMENT.md](./GOOGLE_PLAY_DEPLOYMENT.md#step-4-create-a-service-account-for-cicd)

### 3. Configure GitHub Secrets (5 minutes)

Go to your repo > **Settings** > **Secrets and variables** > **Actions**

Add these 4 secrets:

#### a. RELEASE_KEYSTORE_BASE64

**Windows PowerShell** (from project root):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android\app\release.keystore")) | Out-File keystore.base64.txt
```

**macOS/Linux**:

```bash
base64 -i android/app/release.keystore -o keystore.base64.txt
```

Then:
1. Open `keystore.base64.txt`
2. Copy the **entire contents** (it will be a very long string)
3. Paste into GitHub Secret value

#### b. RELEASE_STORE_PASSWORD
Your keystore password

#### c. RELEASE_KEY_PASSWORD
Your key password

#### d. GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
Copy entire contents of service account JSON file

### 4. Prepare App Assets (15 minutes)

Download or create:
- **App icon** (512x512 PNG)
- **Feature graphic** (1024x500 JPG/PNG)
- **Screenshots** (at least 2, 1080x1920 px)

**Free icon sources**:
- https://www.flaticon.com (search: "parental control shield")
- https://icons8.com (search: "child protection")

**Guide**: [APP_ICONS_GUIDE.md](./APP_ICONS_GUIDE.md)

### 5. Complete Play Console Listing (30 minutes)

In [Play Console](https://play.google.com/console), complete:

1. **App content**:
   - Privacy policy URL
   - Declare ads present (AdMob)
   - Target audience and content ratings

2. **Store presence**:
   - Short description (80 chars)
   - Full description
   - Upload app icon, feature graphic, screenshots

3. **Countries/regions**: Select distribution countries

### 6. First Deployment (Manual)

For the first release, manually upload AAB to establish the app:

```bash
# Build production AAB locally
npm run build:prod:windows  # Windows
npm run build:prod          # macOS/Linux
```

Upload AAB:
1. Play Console > **Testing** > **Internal testing**
2. Create new release
3. Upload: `android/app/build/outputs/bundle/release/app-release.aab`
4. Add release notes
5. Review and start rollout

### 7. Automated Deployments

After first manual upload, use GitHub Actions for all future releases:

#### Method 1: Manual Trigger

1. Go to **Actions** tab
2. Select **Deploy to Google Play Store**
3. Click **Run workflow**
4. Select track (internal/alpha/beta/production)
5. Click **Run workflow**

#### Method 2: Git Tags (Automated)

```bash
# Update version in android/app/build.gradle first
# Then create and push tag:

git tag v1.0.1
git push origin v1.0.1
```

Workflow automatically deploys to **internal** track.

---

## Configuration Details

### Dynamic Config Handling

The repo keeps `USE_TEST_ADS: true` committed for development. The deployment workflow automatically changes it to `false` using:

```bash
node scripts/prepare-production.js
```

This script runs during CI/CD before building.

### Local Production Build

To test production config locally:

```bash
# Set production config
node scripts/prepare-production.js

# Build AAB
cd android
.\gradlew.bat bundleRelease  # Windows
./gradlew bundleRelease       # macOS/Linux
```

**Important**: Remember to revert changes after testing:
```bash
git checkout src/config/admob.js
```

Or keep `USE_TEST_ADS: true` in repo and only use production script in CI/CD.

---

## Version Management

Before each release, update `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2        // Increment by 1 each release
    versionName "1.0.1"  // User-facing version
}
```

**Rules**:
- `versionCode`: Must increase monotonically (1, 2, 3, ...)
- `versionName`: Semantic versioning (1.0.0, 1.0.1, 1.1.0, 2.0.0)

---

## Release Tracks

| Track | Purpose | When to Use |
|-------|---------|-------------|
| **Internal** | Quick testing | Every build, CI/CD default |
| **Alpha** | Closed beta | Pre-release testing with select users |
| **Beta** | Open beta | Broader testing before production |
| **Production** | Public release | After thorough testing |

**Recommended flow**:
1. Deploy to **internal** via CI/CD
2. Test thoroughly
3. Promote to **alpha/beta** via Play Console
4. After user testing, promote to **production**

---

## Workflow File Location

The deployment workflow is at:
```
.github/workflows/deploy-playstore.yml
```

**Triggers**:
- Manual workflow dispatch
- Git tags matching `v*.*.*`

---

## Common Issues

### "Unauthorized" during upload
- Verify service account has Play Console permissions
- Re-invite service account if needed

### "Version code already used"
- Increment `versionCode` in `build.gradle`

### Build fails with keystore error
- Check GitHub Secrets are correctly set
- Verify base64 encoding of keystore

### AdMob still showing test ads
- Ensure `prepare-production.js` runs before build
- Check workflow logs for "Set USE_TEST_ADS to false"

---

## Testing Before Production

### Local Production Build Test

1. Build production AAB:
   ```bash
   npm run build:prod:windows
   ```

2. Extract and install APK from AAB:
   ```bash
   # Requires bundletool: https://github.com/google/bundletool
   bundletool build-apks \
     --bundle=android/app/build/outputs/bundle/release/app-release.aab \
     --output=app.apks \
     --mode=universal

   # Extract and install
   unzip app.apks -d apks
   adb install apks/universal.apk
   ```

3. Verify:
   - Production ads show (not test ads)
   - App functions correctly
   - No crashes

### CI/CD Test

1. Push to test branch
2. Manually trigger workflow
3. Select **internal** track
4. Download from Play Console internal testing
5. Install and test on device

---

## Security Checklist

Before committing:

- [ ] `release.keystore` NOT in git
- [ ] `android/gradle.properties` NOT in git
- [ ] Service account JSON NOT in git
- [ ] Keystore passwords NOT hardcoded anywhere
- [ ] All secrets configured in GitHub Secrets
- [ ] `.gitignore` includes sensitive files

---

## Next Steps After First Deployment

1. **Set up staged rollout**: Start production releases at 10% → 50% → 100%
2. **Monitor vitals**: Check Play Console for crashes and ANRs
3. **Collect feedback**: Review user reviews and ratings
4. **Plan updates**: Use internal → alpha → beta → production flow

---

## Support Documentation

| Topic | Document |
|-------|----------|
| **Full deployment guide** | [GOOGLE_PLAY_DEPLOYMENT.md](./GOOGLE_PLAY_DEPLOYMENT.md) |
| **App icons and graphics** | [APP_ICONS_GUIDE.md](./APP_ICONS_GUIDE.md) |
| **Manual release builds** | [RELEASE_BUILD.md](./RELEASE_BUILD.md) |

---

## TL;DR - Minimum Steps

1. Create Play Console app
2. Generate keystore: `keytool -genkeypair ...`
3. Create service account + JSON key
4. Add 4 GitHub Secrets (keystore, passwords, service account)
5. Upload first AAB manually to Play Console
6. Future deployments: `git tag v1.0.1 && git push origin v1.0.1`

**Done!** GitHub Actions handles the rest.
