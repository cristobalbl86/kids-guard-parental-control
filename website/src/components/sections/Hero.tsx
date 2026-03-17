'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Star } from 'lucide-react';
import { APP_META } from '@/lib/constants';
import { PlayStoreBadge } from '@/components/ui/PlayStoreBadge';
import { PhoneMockup } from '@/components/ui/PhoneMockup';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-brand-bg to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(74,144,226,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(74,144,226,0.1),rgba(0,0,0,0))]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary text-sm font-medium mb-6"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Free on Google Play
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-jakarta)] leading-tight mb-6"
            >
              <span className="text-brand-text dark:text-white">Take control of</span>
              <br />
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                your child&apos;s device
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Lock volume levels, set screen time limits, and protect settings with a
              hardware-encrypted PIN. Real enforcement at the Android system level.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <PlayStoreBadge size="lg" />
              <div className="text-sm text-slate-500 dark:text-slate-500">
                <span>Android {APP_META.minAndroid}</span>
                <span className="mx-2">|</span>
                <span>English & Spanish</span>
              </div>
            </motion.div>
          </div>

          {/* Right column - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PhoneMockup>
                <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 dark:from-brand-primary/30 dark:to-brand-secondary/30 flex flex-col items-center justify-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" className="w-9 h-9 text-white fill-current">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-brand-text dark:text-white text-center">
                    Kids Guard
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                    Parental Control
                  </p>
                  <div className="mt-6 space-y-2 w-full">
                    <div className="h-3 rounded-full bg-brand-primary/30 w-3/4 mx-auto" />
                    <div className="h-3 rounded-full bg-brand-secondary/30 w-2/3 mx-auto" />
                    <div className="h-3 rounded-full bg-brand-accent/30 w-1/2 mx-auto" />
                  </div>
                </div>
              </PhoneMockup>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <a
              href="#features"
              className="flex flex-col items-center gap-2 text-slate-400 hover:text-brand-primary transition-colors"
            >
              <span className="text-xs font-medium">Scroll to explore</span>
              <ArrowDown className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
