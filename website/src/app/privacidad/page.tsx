import type { Metadata } from 'next';
import { APP_META } from '@/lib/constants';
import { PrivacyPageContent } from '@/components/sections/PrivacyPageContent';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: `Política de Privacidad de ${APP_META.fullName}.`,
};

export default function PrivacidadPage() {
  return <PrivacyPageContent locale="es" />;
}
