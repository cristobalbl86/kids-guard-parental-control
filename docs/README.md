# Kids Guard Documentation

Complete documentation for building, testing, and deploying the Kids Guard parental control app.

## Quick Links

### Getting Started
- **[CLAUDE.md](../CLAUDE.md)** - Project overview and development guide
- **[Main README](../README.md)** - Repository information

### Building & Deployment
- **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** - ⭐ Fast track to Google Play deployment (START HERE)
- **[GOOGLE_PLAY_DEPLOYMENT.md](./GOOGLE_PLAY_DEPLOYMENT.md)** - Complete Google Play setup and CI/CD guide
- **[RELEASE_BUILD.md](./RELEASE_BUILD.md)** - Manual release build instructions
- **[APP_ICONS_GUIDE.md](./APP_ICONS_GUIDE.md)** - App icons and graphics resources

## Documentation Overview

### For First-Time Deployment

If you're deploying to Google Play Store for the first time:

1. **Start here**: [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
   - Minimum steps to get deployed
   - Step-by-step checklist
   - Takes ~60 minutes total

2. **Need more details?**: [GOOGLE_PLAY_DEPLOYMENT.md](./GOOGLE_PLAY_DEPLOYMENT.md)
   - Complete Play Console setup
   - Service account creation
   - GitHub Actions configuration
   - Troubleshooting

3. **Need app icons?**: [APP_ICONS_GUIDE.md](./APP_ICONS_GUIDE.md)
   - Free icon resources
   - Icon generation tools
   - Play Store graphics requirements

### For Manual Builds

If you want to build release APKs locally without CI/CD:

- **[RELEASE_BUILD.md](./RELEASE_BUILD.md)**
  - Local release build instructions
  - Keystore generation
  - APK vs AAB
  - Installation steps

## CI/CD Pipeline

### Automated Deployment Workflow

The repo includes GitHub Actions workflow for automated deployment:

**Location**: `.github/workflows/deploy-playstore.yml`

**What it does**:
1. Runs all tests
2. Sets `USE_TEST_ADS: false` automatically
3. Signs with release keystore
4. Builds Android App Bundle (AAB)
5. Uploads to Google Play Console

**Trigger methods**:
- Manual: Actions tab → "Deploy to Google Play Store" → Run workflow
- Automatic: Push git tag (e.g., `git tag v1.0.1 && git push origin v1.0.1`)

### Configuration Management

**Development** (in repo):
- `src/config/admob.js` has `USE_TEST_ADS: true`
- Developers see test ads

**Production** (CI/CD):
- `scripts/prepare-production.js` automatically sets `USE_TEST_ADS: false`
- Production builds show real ads
- No manual config changes needed

## Project Structure

```
kids-guard-parental-control/
├── .github/
│   └── workflows/
│       ├── deploy-playstore.yml    # Play Store deployment
│       ├── pr-tests.yml             # PR test automation
│       ├── required-tests.yml       # Required status checks
│       └── test-suites.yml          # Parallel test suites
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/kidsguard/  # Native modules
│   │   │   └── AndroidManifest.xml  # Permissions, AdMob config
│   │   └── build.gradle             # Version, signing config
│   └── build.gradle                 # Android build config
├── docs/                            # This folder
│   ├── README.md                    # This file
│   ├── DEPLOYMENT_QUICKSTART.md     # Fast deployment guide
│   ├── GOOGLE_PLAY_DEPLOYMENT.md    # Full deployment docs
│   ├── RELEASE_BUILD.md             # Manual build guide
│   └── APP_ICONS_GUIDE.md           # Icon resources
├── scripts/
│   └── prepare-production.js        # Production config script
├── src/
│   ├── config/
│   │   └── admob.js                 # AdMob configuration
│   ├── screens/                     # React Native UI
│   ├── utils/                       # Business logic
│   │   ├── storage.js               # Data persistence
│   │   ├── volumeControl.js         # Volume enforcement
│   │   ├── brightnessControl.js     # Brightness enforcement
│   │   └── admobControl.js          # Ad display logic
│   └── App.tsx                      # Main app component
└── CLAUDE.md                        # Development guide
```

## Key Technologies

- **React Native 0.73.6** - Cross-platform mobile framework
- **Native Android Modules** - Volume/brightness control
- **Google Mobile Ads (AdMob)** - Monetization
- **GitHub Actions** - CI/CD automation
- **React Native Keychain** - Secure PIN storage
- **Jest** - Testing framework

## Testing

### Run Tests Locally

```bash
# All tests
npm test

# Specific test suites
npm run test:storage
npm run test:screens
npm run test:utils

# CI mode (for pre-deployment testing)
npm run test:ci
```

### GitHub Actions Tests

All PRs to `main` automatically run:
- Full test suite (130+ tests)
- Parallel test execution
- Coverage reporting

## Build Commands

### Development

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android
```

### Production

```bash
# Build production AAB (Windows)
npm run build:prod:windows

# Build production AAB (macOS/Linux)
npm run build:prod
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Environment Configuration

### AdMob Test/Production Ads

Controlled in `src/config/admob.js`:

```javascript
const AdMobConfig = {
  USE_TEST_ADS: true,  // true = test ads, false = production ads
  APP_ID: 'ca-app-pub-...',
  AD_UNIT_ID: 'ca-app-pub-...',
};
```

**Important**: Keep `USE_TEST_ADS: true` in repository. CI/CD automatically sets it to `false` for production builds.

### Ad Display Logic

- **Frequency**: Max once every 6 hours
- **Triggers**: App foreground, setup completion
- **Storage**: Last shown timestamp in AsyncStorage

See `src/utils/admobControl.js` for implementation.

## Version Management

Update before each release in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2        // Increment by 1 (required)
    versionName "1.0.1"  // User-facing version
}
```

## Release Process

### Standard Release Flow

1. **Develop** on feature branch
2. **Test** locally: `npm run test:ci`
3. **PR to main** → GitHub Actions runs tests
4. **Merge** after approval
5. **Update version** in `build.gradle`
6. **Tag release**: `git tag v1.0.1 && git push origin v1.0.1`
7. **GitHub Actions** builds and deploys to Play Store internal track
8. **Test** on internal track
9. **Promote** to beta → production via Play Console

### Hotfix Release

1. Create hotfix branch from main
2. Fix issue + increment `versionCode`
3. Test thoroughly
4. Merge to main
5. Tag and deploy: `git tag v1.0.2 && git push origin v1.0.2`

## Security

### Sensitive Files (Never Commit)

These are in `.gitignore`:
- `android/app/release.keystore`
- `android/gradle.properties` (with passwords)
- `keystore.base64.txt`
- `google-play-service-account.json`

### GitHub Secrets Required

- `RELEASE_KEYSTORE_BASE64`
- `RELEASE_STORE_PASSWORD`
- `RELEASE_KEY_PASSWORD`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Test ads in production | Set `USE_TEST_ADS: false` or use production build script |
| Version code conflict | Increment `versionCode` in build.gradle |
| Keystore error in CI | Verify GitHub Secrets are correctly set |
| "Unauthorized" upload | Check service account permissions in Play Console |
| App crashes on release | Disable ProGuard or add rules to `proguard-rules.pro` |

See individual docs for detailed troubleshooting.

## Contributing

### Development Workflow

1. Create feature branch
2. Make changes
3. Add/update tests
4. Run `npm run test:ci` locally
5. Submit PR
6. Wait for GitHub Actions to pass
7. Request review

### Code Standards

- ESLint: `npm run lint`
- Tests required for new features
- Follow existing patterns in CLAUDE.md

## Support & Resources

### Internal Documentation
- [CLAUDE.md](../CLAUDE.md) - Complete dev guide
- Architecture diagrams
- Native module details
- Common patterns

### External Resources
- [React Native Docs](https://reactnative.dev)
- [Google Play Console](https://play.google.com/console)
- [AdMob Documentation](https://developers.google.com/admob)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

## FAQ

**Q: Do I need to manually change `USE_TEST_ADS` before deploying?**
A: No, the CI/CD workflow (`prepare-production.js`) does it automatically.

**Q: Can I deploy directly to production?**
A: Yes, but recommended flow is internal → alpha → beta → production.

**Q: How do I test production ads locally?**
A: Build with `npm run build:prod:windows` and install the APK manually.

**Q: What if I lose my keystore?**
A: You cannot update your app on Play Store. You'd have to publish as a new app. Always back up your keystore!

**Q: How often should I update the app?**
A: Release bug fixes immediately. Plan feature updates every 2-4 weeks based on user feedback.

---

## Quick Reference

### Deploy to Play Store
```bash
git tag v1.0.1
git push origin v1.0.1
```

### Build Locally (Windows)
```bash
npm run build:prod:windows
```

### Run Tests
```bash
npm run test:ci
```

### Update Version
Edit `android/app/build.gradle`:
- Increment `versionCode`
- Update `versionName`

---

**Ready to deploy?** Start with [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
