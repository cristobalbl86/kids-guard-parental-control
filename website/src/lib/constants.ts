export const APP_META = {
  name: 'Kids Guard',
  fullName: 'Kids Guard - Parental Control',
  tagline: 'Take control of your child\'s device. Set limits that stick.',
  description:
    'Free Android parental control app. Lock device volume, set screen time limits, and protect settings with a hardware-encrypted PIN.',
  version: '1.1.5',
  packageId: 'com.kidsguard',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.kidsguard',
  developer: {
    name: 'Cristobal Buenrostro Lopez',
    email: 'cristobalbtech@gmail.com',
    github: 'https://github.com/cristobalbl86',
  },
  minAndroid: '6.0+',
  languages: ['English', 'Spanish'],
};

export const COLORS = {
  primary: '#4A90E2',
  secondary: '#50C878',
  accent: '#F5A623',
  error: '#E74C3C',
  background: '#F5F7FA',
  text: '#2C3E50',
};

export const FEATURES = [
  {
    id: 'volume',
    title: 'Volume Control',
    description:
      'Lock device volume at any level. Native Android enforcement instantly reverts unauthorized changes — even when kids press hardware buttons.',
    icon: 'Volume2' as const,
  },
  {
    id: 'screen-time',
    title: 'Screen Time Limits',
    description:
      'Set daily limits from 15 minutes to 8 hours. A full-screen lock overlay activates automatically when time expires.',
    icon: 'Timer' as const,
  },
  {
    id: 'pin',
    title: 'PIN Protection',
    description:
      '4-digit PIN stored with hardware-level encryption. Exponential lockout after failed attempts prevents brute-force access.',
    icon: 'Lock' as const,
  },
  {
    id: 'verification',
    title: 'Parent Verification',
    description:
      'A simple math problem during setup ensures only adults can configure parental controls. Kids can\'t bypass it.',
    icon: 'ShieldCheck' as const,
  },
  {
    id: 'background',
    title: 'Background Enforcement',
    description:
      'Runs as a foreground service to keep settings enforced. Automatically restarts after device reboot.',
    icon: 'RefreshCcw' as const,
  },
  {
    id: 'bilingual',
    title: 'Bilingual Support',
    description:
      'Full English and Spanish support with automatic device language detection. No configuration needed.',
    icon: 'Languages' as const,
  },
];

export const BENEFITS = {
  parents: [
    {
      title: 'Real Enforcement',
      description: 'Volume locks at the native level — changes are reverted instantly, not after a delay.',
    },
    {
      title: 'Peace of Mind',
      description: 'Set it and forget it. Controls stay active even when the app is in the background.',
    },
    {
      title: 'Easy Setup',
      description: 'Get up and running in under a minute. No accounts, no cloud, no complexity.',
    },
    {
      title: 'Secure by Design',
      description: 'PIN is hardware-encrypted. No data leaves the device. Fully GDPR/COPPA compliant.',
    },
    {
      title: 'Free to Use',
      description: 'All features available for free. No premium tiers or hidden paywalls.',
    },
  ],
  kids: [
    {
      title: 'Consistent Rules',
      description: 'Clear, predictable limits help kids understand boundaries.',
    },
    {
      title: 'Fair Time Management',
      description: 'Screen time limits encourage balanced device usage and healthier habits.',
    },
    {
      title: 'Device Still Usable',
      description: 'Kids can use their device normally within the limits set by parents.',
    },
    {
      title: 'No Surprises',
      description: 'Remaining screen time is visible, so kids can plan their usage.',
    },
  ],
};

export const TECH_STACK = [
  {
    name: 'React Native',
    description: 'Cross-platform mobile framework',
    icon: 'Smartphone' as const,
  },
  {
    name: 'Java',
    description: 'Native Android modules',
    icon: 'Code' as const,
  },
  {
    name: 'Kotlin',
    description: 'Android application layer',
    icon: 'FileCode' as const,
  },
  {
    name: 'Material Design 3',
    description: 'Modern UI components',
    icon: 'Palette' as const,
  },
  {
    name: 'Hardware Encryption',
    description: 'Android Keychain storage',
    icon: 'KeyRound' as const,
  },
  {
    name: 'i18n Localization',
    description: 'Multi-language support',
    icon: 'Globe' as const,
  },
  {
    name: 'TypeScript',
    description: 'Type-safe development',
    icon: 'Braces' as const,
  },
  {
    name: 'ContentObserver',
    description: 'Real-time system monitoring',
    icon: 'Eye' as const,
  },
];

export const SCREENSHOTS = [
  { id: 1, label: 'Welcome Screen', file: '/images/screenshots/screenshot-1.svg' },
  { id: 2, label: 'Home Dashboard', file: '/images/screenshots/screenshot-2.svg' },
  { id: 3, label: 'Parent Settings', file: '/images/screenshots/screenshot-3.svg' },
  { id: 4, label: 'Screen Time', file: '/images/screenshots/screenshot-4.svg' },
  { id: 5, label: 'PIN Entry', file: '/images/screenshots/screenshot-5.svg' },
];

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Screenshots', href: '#screenshots' },
  { label: 'Tech Stack', href: '#tech' },
  { label: 'Contact', href: '/contact' },
];
