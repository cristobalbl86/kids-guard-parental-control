'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { PlayStoreBadge } from '@/components/ui/PlayStoreBadge';
import { APP_META } from '@/lib/constants';
import { Shield } from 'lucide-react';

export function DownloadCTA() {
  return (
    <section id="download" className="py-20 md:py-28 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary to-blue-700 p-10 md:p-16 text-center text-white">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-9 h-9" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] mb-4">
                Ready to protect your child&apos;s device?
              </h2>

              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                Download Kids Guard for free. Set up in under a minute.
                No accounts, no cloud, no complexity.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <PlayStoreBadge size="lg" />
                <span className="text-sm text-blue-200">
                  Android {APP_META.minAndroid} required
                </span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
