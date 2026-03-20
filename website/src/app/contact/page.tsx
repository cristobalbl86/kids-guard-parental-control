import type { Metadata } from 'next';
import { APP_META } from '@/lib/constants';
import { ContactPageContent } from '@/components/sections/ContactPageContent';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the developer of ${APP_META.fullName}.`,
};

export default function ContactPage() {
  return <ContactPageContent />;
}
