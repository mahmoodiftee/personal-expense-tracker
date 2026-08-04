import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export type CheckboxProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onChange' | 'role' | 'aria-checked'
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, disabled, onCheckedChange, onClick, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        onCheckedChange?.(!checked);
      }}
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked && 'border-primary bg-primary text-primary-foreground',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...props}
    >
      {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> : null}
    </button>
  ),
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
