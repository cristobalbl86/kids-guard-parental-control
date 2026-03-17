import type { Metadata } from 'next';
import { Mail, Github, User, MapPin } from 'lucide-react';
import { APP_META } from '@/lib/constants';
import { ContactForm } from '@/components/ui/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the developer of ${APP_META.fullName}.`,
};

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-4">
            Contact
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-jakarta)] mb-4">
            Get in touch
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have questions, feedback, or suggestions? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Developer card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 sticky top-24">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-blue-600 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-xl font-bold font-[family-name:var(--font-jakarta)] mb-1">
                {APP_META.developer.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Independent Developer
              </p>

              <div className="space-y-4">
                <a
                  href={`mailto:${APP_META.developer.email}`}
                  className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  {APP_META.developer.email}
                </a>
                <a
                  href={APP_META.developer.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
                >
                  <Github className="w-4 h-4 shrink-0" />
                  github.com/cristobalbl86
                </a>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 shrink-0" />
                  Remote Developer
                </div>
              </div>

              <hr className="my-6 border-slate-200 dark:border-slate-700" />

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Kids Guard is an independently developed app focused on giving parents real control
                over their children&apos;s Android devices. All feedback helps make the app better.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold font-[family-name:var(--font-jakarta)] mb-6">
                Send a message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
