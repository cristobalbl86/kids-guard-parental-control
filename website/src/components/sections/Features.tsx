'use client';

import { FEATURES } from '@/lib/constants';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useLanguage } from '@/lib/LanguageContext';

export function Features() {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 md:py-28 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-4">
              {t.features.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] mb-4">
              {t.features.title}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t.features.description}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <AnimatedSection key={feature.id} delay={i * 0.1}>
              <FeatureCard
                title={t.features.items[i].title}
                description={t.features.items[i].description}
                icon={feature.icon}
                index={i}
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
