'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FORMSPREE_ID } from '@/lib/constants';
import { useLanguage } from '@/lib/LanguageContext';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!FORMSPREE_ID) {
      setStatus('error');
      setErrorMsg(t.contact.formNotConfigured);
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          _subject: form.subject,
          message: form.message,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('Form submission failed');
      }
    } catch {
      setStatus('error');
      setErrorMsg(t.contact.formError);
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-brand-secondary mx-auto mb-4" />
        <h3 className="text-2xl font-semibold font-[family-name:var(--font-jakarta)] mb-2">
          {t.contact.messageSent}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {t.contact.thankYou}
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="text-brand-primary hover:underline font-medium"
        >
          {t.contact.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            {t.contact.name}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
              'bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-primary focus:border-transparent',
              'outline-none transition-shadow'
            )}
            placeholder={t.contact.namePlaceholder}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            {t.contact.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
              'bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-primary focus:border-transparent',
              'outline-none transition-shadow'
            )}
            placeholder={t.contact.emailPlaceholder}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
          {t.contact.subject}
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
            'bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-primary focus:border-transparent',
            'outline-none transition-shadow'
          )}
          placeholder={t.contact.subjectPlaceholder}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1.5">
          {t.contact.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600',
            'bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-primary focus:border-transparent',
            'outline-none transition-shadow resize-none'
          )}
          placeholder={t.contact.messagePlaceholder}
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-brand-error text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className={cn(
          'flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-lg',
          'bg-brand-primary text-white font-medium',
          'hover:bg-blue-600 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {status === 'sending' ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t.contact.sending}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t.contact.sendButton}
          </>
        )}
      </button>
    </form>
  );
}
