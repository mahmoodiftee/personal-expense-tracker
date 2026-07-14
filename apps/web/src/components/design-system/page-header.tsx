import { cn } from '@/lib/utils';

import { Typography } from './typography';

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-border pb-6 mb-6 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="space-y-2">
        <Typography variant="h1">{title}</Typography>
        {description ? (
          <Typography variant="body-sm" className="max-w-2xl">
            {description}
          </Typography>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
