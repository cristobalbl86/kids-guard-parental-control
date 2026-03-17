'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS, APP_META } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg shadow-sm border-b border-slate-200/50 dark:border-slate-800/50'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-[family-name:var(--font-jakarta)] font-bold text-lg">
            {APP_META.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
          <ThemeToggle />
          <a
            href={APP_META.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Download
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-200 dark:bg-slate-700"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-primary"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-primary"
                >
                  {link.label}
                </Link>
              )
            )}
            <a
              href={APP_META.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-lg bg-brand-primary text-white text-sm font-medium"
            >
              Download on Google Play
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
