import { cn } from '@/lib/utils';

/** Canonical shell width — 8xl (88rem / 1408px). */
export const SHELL_MAX_WIDTH_REM = '88rem';

type ShellFrameProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

/**
 * Centers shell chrome in a fixed 8xl band.
 * Uses both a Tailwind class and an inline maxWidth so the cap always applies
 * even if the utility class is missing from the generated CSS.
 */
export function ShellFrame({ className, children, style, ...props }: ShellFrameProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[88rem] px-4 sm:px-6 lg:px-8', className)}
      style={{ maxWidth: SHELL_MAX_WIDTH_REM, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
