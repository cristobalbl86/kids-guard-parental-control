# Google Play Store Deployment Guide

Complete guide to deploying Kids Guard to the Google Play Store using GitHub Actions CI/CD.

## Table of Contents

1. [Google Play Console Setup](#google-play-console-setup)
2. [Generate Release Keystore](#generate-release-keystore)
3. [Configure GitHub Secrets](#configure-github-secrets)
4. [Deploy Using GitHub Actions](#deploy-using-github-actions)
5. [Manual Deployment](#manual-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Google Play Console Setup

### Step 1: Create a Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Pay the one-time $25 registration fee
4. Complete your developer profile

### Step 2: Create a New App

1. In Play Console, click **Create app**
2. Fill in app details:
   - **App name**: Kids Guard - Parental Control
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (or Paid if monetizing beyond ads)
3. Complete the **Declarations** and click **Create app**

### Step 3: Set Up Your App

Before you can publish, complete these required sections:

#### A. App Content
- **Privacy Policy**: Required (host your privacy policy and provide URL)
- **App access**: If requires login, provide test credentials
- **Ads**: Declare that your app contains ads (AdMob)
- **Target audience**: Set appropriate age ratings
- **Content ratings**: Complete IARC questionnaire

#### B. Store Presence
- **App details**: Short description, full description
- **Graphics**: See [Icon Resources Guide](#) for assets
  - App icon (512x512 PNG)
  - Feature graphic (1024x500 JPG/PNG)
  - Screenshots (minimum 2, up to 8)
  - Privacy policy URL

#### C. Countries/Regions
- Select countries where you want to distribute the app

### Step 4: Create a Service Account (for CI/CD)

To enable automated deployment, you need a service account:

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select or create a project linked to your Play Console
3. Go to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**:
   - **Name**: `github-actions-play-deploy`
   - **Description**: Service account for GitHub Actions Play Store deployment
5. Click **Create and Continue**
6. Grant **Service Account User** role
7. Click **Done**

#### Generate Service Account Key

1. Click on the newly created service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create** - a JSON file will download
6. **IMPORTANT**: Keep this file secure! You'll need it for GitHub Secrets

#### Link Service Account to Play Console

1. Go back to [Google Play Console](https://play.google.com/console)
2. Go to **Setup** > **API access**
3. Click **Choose a project to link** and link your Cloud project
4. Under **Service accounts**, find your service account
5. Click **Manage Play Console permissions**
6. Grant these permissions:
   - **Releases**: Create and manage releases
   - **App access**: View app information
   - **Release management**: Manage releases to testing tracks
7. Click **Invite user**
8. Click **Send invite**

---

## Generate Release Keystore

You need a release keystore to sign your app. **Never lose this file!**

### Generate Keystore

```bash
# Navigate to android/app directory
cd android/app

# Generate keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore \
  -alias kidsguard-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be prompted for:
- **Keystore password**: Create a strong password (save it!)
- **Key password**: Create a strong password (save it!)
- **Name**: Your name or company name
- **Organization**: Your organization
- **City, State, Country**: Your location

### Backup Your Keystore

**CRITICAL**: Store these securely (password manager, encrypted backup):
- `release.keystore` file
- Keystore password
- Key password

If you lose these, you cannot update your app on Play Store.

### Convert Keystore to Base64 (for GitHub Secrets)

```bash
# On macOS/Linux:
base64 -i android/app/release.keystore -o keystore.base64.txt

# On Windows (PowerShell):
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android\app\release.keystore")) | Out-File -FilePath keystore.base64.txt
```

---

## Configure GitHub Secrets

Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

Add these secrets:

### 1. RELEASE_KEYSTORE_BASE64
- **Value**: Contents of `keystore.base64.txt`
- Paste the entire base64-encoded string

### 2. RELEASE_STORE_PASSWORD
- **Value**: Your keystore password

### 3. RELEASE_KEY_PASSWORD
- **Value**: Your key password

### 4. GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
- **Value**: Contents of the service account JSON file you downloaded earlier
- Open the JSON file and paste the entire contents

**Security Note**: These secrets are encrypted and only accessible to GitHub Actions workflows.

---

## Deploy Using GitHub Actions

### Automated Deployment Options

The workflow supports two deployment methods:

#### Option 1: Manual Workflow Dispatch

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to Google Play Store** workflow
3. Click **Run workflow**
4. Select release track:
   - **internal**: Internal testing (up to 100 testers)
   - **alpha**: Closed testing (limited testers)
   - **beta**: Open or closed testing
   - **production**: Public release
5. Click **Run workflow**

#### Option 2: Git Tag (Automated)

Create and push a version tag:

```bash
# Example: version 1.0.0
git tag v1.0.0
git push origin v1.0.0
```

This will automatically trigger deployment to the **internal** track.

### Workflow Steps

The GitHub Actions workflow will:

1. ✅ Run all tests
2. 🔧 Set `USE_TEST_ADS: false` for production
3. 🔐 Decode and configure keystore
4. 📦 Build Android App Bundle (AAB)
5. 🚀 Upload to Google Play Console
6. ✅ Deploy to selected track

### First Deployment

For your **first deployment** to Google Play:

1. You must manually upload the first AAB through the Play Console
2. Go to **Play Console** > **Production** > **Create new release**
3. Upload the AAB from GitHub Actions artifacts or build locally
4. Complete all store listing requirements
5. Submit for review

After the first release is live, GitHub Actions can handle all future updates.

---

## Manual Deployment

If you prefer manual deployment:

### Build the AAB Locally

```bash
# Generate release keystore (first time only)
cd android/app
keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore \
  -alias kidsguard-release \
  -keyalg RSA -keysize 2048 -validity 10000

# Create gradle.properties with credentials
cd ..
echo "RELEASE_STORE_PASSWORD=your_password" >> gradle.properties
echo "RELEASE_KEY_PASSWORD=your_password" >> gradle.properties

# Set production config
node scripts/prepare-production.js

# Build AAB
cd android
./gradlew bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### Upload to Play Console

1. Go to [Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Release** > **Testing** > **Internal testing** (or other track)
4. Click **Create new release**
5. Upload the AAB file
6. Add release notes
7. Click **Review release**
8. Click **Start rollout**

---

## Version Management

### Update Version for New Releases

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.kidsguard"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 2        // Increment for each release
    versionName "1.0.1"  // Semantic versioning
}
```

**Rules**:
- `versionCode`: Must increment with each release (integer)
- `versionName`: User-facing version (string)

### Release Notes

Add release notes to `RELEASE_NOTES.md` or edit in Play Console before each release.

---

## Deployment Tracks

Google Play offers different release tracks:

| Track | Purpose | Audience |
|-------|---------|----------|
| **Internal** | Quick testing | Up to 100 internal testers |
| **Alpha** | Closed testing | Selected testers (opt-in) |
| **Beta** | Pre-release testing | Broader testing group |
| **Production** | Public release | All users |

### Recommended Flow

1. **Internal**: Test new builds
2. **Alpha/Beta**: Gather user feedback
3. **Production**: Roll out gradually (10% → 50% → 100%)

---

## Troubleshooting

### "Unauthorized" Error During Upload

- Verify service account has correct permissions in Play Console
- Ensure service account JSON is valid in GitHub Secrets
- Re-invite service account if needed

### "Version code X has already been used"

- Increment `versionCode` in `build.gradle`
- Each upload must have a unique version code

### "Missing required fields in store listing"

- Complete all sections in Play Console:
  - App content (privacy policy, ads, ratings)
  - Store presence (descriptions, graphics)
  - Countries/regions

### Build Fails with Keystore Error

- Verify `RELEASE_KEYSTORE_BASE64` secret is correctly set
- Ensure `RELEASE_STORE_PASSWORD` and `RELEASE_KEY_PASSWORD` match keystore

### AdMob Warnings

If you see AdMob configuration warnings during build:
- Ensure `AndroidManifest.xml` has correct AdMob App ID
- Verify AdMob account is set up and app is registered

---

## Post-Deployment

### Monitor Release

1. Go to Play Console > **Release** > **[Your Track]**
2. Monitor crash reports and ANRs in **Vitals**
3. Check user reviews in **Reviews**

### Gradual Rollout (Production)

For production releases:
1. Start with 10% rollout
2. Monitor for 24-48 hours
3. Increase to 50%, then 100% if stable

### Update Testing Tracks

After production release:
- Promote internal → alpha → beta → production
- Or upload new builds to test next features

---

## Security Best Practices

1. **Never commit**:
   - `release.keystore`
   - `gradle.properties` with passwords
   - Service account JSON

2. **Add to `.gitignore`**:
   ```
   android/app/release.keystore
   android/gradle.properties
   keystore.base64.txt
   google-play-service-account.json
   ```

3. **Rotate secrets** if compromised

4. **Use different keystores** for different apps

---

## Additional Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Documentation](https://developer.android.com/guide/app-bundle)
- [GitHub Actions for Android](https://docs.github.com/en/actions/deployment/deploying-to-your-cloud-provider/deploying-to-google-kubernetes-engine)
- [Upload to Play Store Action](https://github.com/r0adkll/upload-google-play)

---

## Checklist

Before first deployment:

- [ ] Google Play Developer account created
- [ ] App created in Play Console
- [ ] Privacy policy URL added
- [ ] App content sections completed
- [ ] Screenshots and graphics uploaded
- [ ] Release keystore generated and backed up
- [ ] Service account created with permissions
- [ ] GitHub Secrets configured
- [ ] Version code and name updated
- [ ] Production config tested locally
- [ ] First AAB uploaded manually to Play Console
