import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> & {
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, disabled, onCheckedChange, id, ...props }, ref) => (
    <span className="relative inline-flex">
      <input
        type="checkbox"
        ref={ref}
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        className={cn('peer sr-only', className)}
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
          'peer-checked:border-primary peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        )}
      >
        {checked ? <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} /> : null}
      </span>
    </span>
  ),
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
