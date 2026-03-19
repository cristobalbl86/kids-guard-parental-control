'use client';

import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  index: number;
}

const iconColors = [
  'bg-blue-100 text-brand-primary dark:bg-blue-900/40',
  'bg-green-100 text-brand-secondary dark:bg-green-900/40',
  'bg-orange-100 text-brand-accent dark:bg-orange-900/40',
  'bg-purple-100 text-purple-600 dark:bg-purple-900/40',
  'bg-rose-100 text-rose-600 dark:bg-rose-900/40',
  'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40',
];

export function FeatureCard({ title, description, icon, index }: FeatureCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[icon] as React.ComponentType<{ className?: string }> | undefined;

  return (
    <div
      className={cn(
        'group p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700',
        'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
        'cursor-default'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
          iconColors[index % iconColors.length]
        )}
      >
        {IconComponent && <IconComponent className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-semibold font-[family-name:var(--font-jakarta)] mb-2 text-brand-text dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
