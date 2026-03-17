import { APP_META } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PlayStoreBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayStoreBadge({ className, size = 'md' }: PlayStoreBadgeProps) {
  const sizes = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-16',
  };

  return (
    <a
      href={APP_META.playStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-block transition-transform hover:scale-105', className)}
      aria-label="Get it on Google Play"
    >
      <img
        src="/images/google-play-badge.svg"
        alt="Get it on Google Play"
        className={cn(sizes[size])}
      />
    </a>
  );
}
