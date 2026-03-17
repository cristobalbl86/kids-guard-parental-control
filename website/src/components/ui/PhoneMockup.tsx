import { cn } from '@/lib/utils';

interface PhoneMockupProps {
  children: React.ReactNode;
  className?: string;
}

export function PhoneMockup({ children, className }: PhoneMockupProps) {
  return (
    <div className={cn('relative mx-auto', className)} style={{ width: 260 }}>
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[6px] border-slate-800 dark:border-slate-600 bg-slate-800 dark:bg-slate-600 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-800 dark:bg-slate-600 rounded-b-2xl z-10" />

        {/* Screen */}
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900">
          {children}
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-600 dark:bg-slate-400 rounded-full" />
      </div>
    </div>
  );
}
