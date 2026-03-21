'use client';

import { useState } from 'react';
import { SCREENSHOTS } from '@/lib/constants';
import { PhoneMockup } from '@/components/ui/PhoneMockup';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useLanguage } from '@/lib/LanguageContext';

interface ScreenshotImageProps {
  src: string;
  alt: string;
  label: string;
  replacePlaceholder: string;
}

function ScreenshotImage({ src, alt, label, replacePlaceholder }: ScreenshotImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="text-center p-4">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-[10px] text-slate-400 mt-1">{replacePlaceholder}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain"
      onError={() => setHasError(true)}
    />
  );
}

export function Screenshots() {
  const { t } = useLanguage();

  return (
    <section id="screenshots" className="py-20 md:py-28 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-sm font-medium mb-4">
              {t.screenshots.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] mb-4">
              {t.screenshots.title}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t.screenshots.description}
            </p>
          </div>
        </AnimatedSection>

        {/* Horizontal scroll area */}
        <div className="overflow-x-auto screenshot-scroll pb-6 -mx-4 px-4">
          <div className="flex gap-8 min-w-max justify-center">
            {SCREENSHOTS.map((screenshot, i) => (
              <AnimatedSection key={screenshot.id} delay={i * 0.1}>
                <div className="flex flex-col items-center gap-4">
                  <PhoneMockup size="md">
                    <ScreenshotImage
                      src={screenshot.file}
                      alt={t.screenshots.labels[i]}
                      label={t.screenshots.labels[i]}
                      replacePlaceholder={t.screenshots.replaceWithScreenshot}
                    />
                  </PhoneMockup>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {t.screenshots.labels[i]}
                  </span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <AnimatedSection delay={0.3}>
          <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-4">
            {t.screenshots.scrollHint}
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
