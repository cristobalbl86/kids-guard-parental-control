'use client';

import {
  Smartphone,
  Code,
  FileCode,
  Palette,
  KeyRound,
  Globe,
  Braces,
  Eye,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TECH_STACK } from '@/lib/constants';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  Code,
  FileCode,
  Palette,
  KeyRound,
  Globe,
  Braces,
  Eye,
};

export function TechStack() {
  const { t } = useLanguage();

  return (
    <section id="tech" className="py-20 md:py-28 bg-brand-bg dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium mb-4">
              {t.techStack.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] mb-4">
              {t.techStack.title}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t.techStack.description}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {TECH_STACK.map((tech, i) => {
            const IconComponent = ICON_MAP[tech.icon];
            return (
              <AnimatedSection key={tech.name} delay={i * 0.05}>
                <div
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl',
                    'bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700',
                    'hover:shadow-md transition-shadow'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    {IconComponent && <IconComponent className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-brand-text dark:text-white truncate">
                      {tech.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {tech.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
