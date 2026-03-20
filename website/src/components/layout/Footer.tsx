'use client';

import { Shield, Heart } from 'lucide-react';
import { APP_META } from '@/lib/constants';
import { PlayStoreBadge } from '@/components/ui/PlayStoreBadge';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

export function Footer() {
  const { locale, t } = useLanguage();
  const privacyHref = locale === 'es' ? '/privacidad' : '/privacy';

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-white">
                {APP_META.name}
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">{APP_META.tagline}</p>
            <PlayStoreBadge size="sm" />
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t.footer.product}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  {t.nav.features}
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="hover:text-white transition-colors">
                  {t.nav.benefits}
                </Link>
              </li>
              <li>
                <Link href="/#screenshots" className="hover:text-white transition-colors">
                  {t.nav.screenshots}
                </Link>
              </li>
              <li>
                <Link href="/#tech" className="hover:text-white transition-colors">
                  {t.nav.techStack}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={privacyHref} className="hover:text-white transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t.footer.developer}</h4>
            <ul className="space-y-2 text-sm">
              <li>{APP_META.developer.name}</li>
              <li>
                <a
                  href={`mailto:${APP_META.developer.email}`}
                  className="hover:text-white transition-colors"
                >
                  {APP_META.developer.email}
                </a>
              </li>
              <li>
                <a
                  href={APP_META.developer.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} {APP_META.developer.name}. {t.footer.allRightsReserved}</p>
          <p className="flex items-center gap-1">
            {t.footer.madeWith} <Heart className="w-3.5 h-3.5 text-brand-error fill-brand-error" /> {t.footer.forFamilies}
          </p>
        </div>
      </div>
    </footer>
  );
}
