import type { Metadata } from 'next';
import { APP_META } from '@/lib/constants';
import { PrivacyPageContent } from '@/components/sections/PrivacyPageContent';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${APP_META.fullName}.`,
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
