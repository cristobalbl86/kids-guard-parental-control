'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn('w-9 h-9', className)} />;
  }

  const toggle = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center',
        'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600',
        'transition-colors text-xs font-bold',
        className
      )}
      aria-label={locale === 'en' ? 'Cambiar a español' : 'Switch to English'}
      title={locale === 'en' ? 'Español' : 'English'}
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </button>
  );
}
