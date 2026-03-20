import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { APP_META } from '@/lib/constants';
import { LanguageProvider } from '@/lib/LanguageContext';

export const metadata: Metadata = {
  title: {
    default: `${APP_META.fullName} | Lock Volume & Screen Time on Android`,
    template: `%s | ${APP_META.fullName}`,
  },
  description: APP_META.description,
  keywords: [
    'parental control',
    'android',
    'volume lock',
    'screen time',
    'kids safety',
    'parental controls app',
    'child device management',
  ],
  authors: [{ name: APP_META.developer.name }],
  openGraph: {
    title: APP_META.fullName,
    description: APP_META.description,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_META.fullName,
    description: APP_META.description,
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Plus+Jakarta+Sans:wght@400..800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                  var locale = localStorage.getItem('locale');
                  if (locale === 'en' || locale === 'es') {
                    document.documentElement.lang = locale;
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-brand-bg text-brand-text dark:bg-slate-950 dark:text-slate-200 antialiased">
        <LanguageProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
