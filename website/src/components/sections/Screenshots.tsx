'use client';

import { SCREENSHOTS } from '@/lib/constants';
import { PhoneMockup } from '@/components/ui/PhoneMockup';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function Screenshots() {
  return (
    <section id="screenshots" className="py-20 md:py-28 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-sm font-medium mb-4">
              Screenshots
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] mb-4">
              See it in action
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A clean, intuitive interface designed for parents. No clutter, no confusion &mdash; just
              the controls you need.
            </p>
          </div>
        </AnimatedSection>

        {/* Horizontal scroll area */}
        <div className="overflow-x-auto screenshot-scroll pb-6 -mx-4 px-4">
          <div className="flex gap-8 min-w-max justify-center">
            {SCREENSHOTS.map((screenshot, i) => (
              <AnimatedSection key={screenshot.id} delay={i * 0.1}>
                <div className="flex flex-col items-center gap-4">
                  <PhoneMockup>
                    <img
                      src={screenshot.file}
                      alt={screenshot.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Show placeholder if image not found
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.classList.add(
                          'flex',
                          'items-center',
                          'justify-center',
                          'bg-gradient-to-br'
                        );
                        const placeholder = document.createElement('div');
                        placeholder.className =
                          'text-center p-4';
                        placeholder.innerHTML = `
                          <div class="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center mx-auto mb-3">
                            <svg class="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p class="text-xs font-medium text-slate-500">${screenshot.label}</p>
                          <p class="text-[10px] text-slate-400 mt-1">Replace with screenshot</p>
                        `;
                        target.parentElement!.appendChild(placeholder);
                      }}
                    />
                  </PhoneMockup>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {screenshot.label}
                  </span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <AnimatedSection delay={0.3}>
          <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-4">
            Scroll horizontally to see more screens
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
