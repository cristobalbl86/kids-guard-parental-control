'use client';

import { Check, Users, Baby } from 'lucide-react';
import { BENEFITS } from '@/lib/constants';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { cn } from '@/lib/utils';

export function Benefits() {
  return (
    <section id="benefits" className="py-20 md:py-28 bg-brand-bg dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary text-sm font-medium mb-4">
              Benefits
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] mb-4">
              Good for parents. Good for kids.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Setting healthy boundaries helps the whole family. Here&apos;s how Kids Guard benefits
              everyone.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Parents column */}
          <AnimatedSection delay={0.1}>
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-jakarta)]">
                  For Parents
                </h3>
              </div>
              <ul className="space-y-4">
                {BENEFITS.parents.map((benefit) => (
                  <li key={benefit.title} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <Check className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-text dark:text-white">{benefit.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {benefit.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Kids column */}
          <AnimatedSection delay={0.2}>
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40',
                    'flex items-center justify-center'
                  )}
                >
                  <Baby className="w-5 h-5 text-brand-secondary" />
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-jakarta)]">
                  For Kids
                </h3>
              </div>
              <ul className="space-y-4">
                {BENEFITS.kids.map((benefit) => (
                  <li key={benefit.title} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <Check className="w-5 h-5 text-brand-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-text dark:text-white">{benefit.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {benefit.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
