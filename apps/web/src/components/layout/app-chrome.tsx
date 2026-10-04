'use client';

import { usePathname } from 'next/navigation';

import { AppNav } from './app-nav';
import { IconRail } from './icon-rail';
import { ShellFrame } from './shell-frame';

type AppChromeProps = {
  children: React.ReactNode;
};

/**
 * Global shell: sticky top bar, floating icon rail, and the page canvas.
 * One shared 8xl band keeps nav, rail, and content aligned when zoomed out.
 */
export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const showAmbientGlow = pathname === '/';

  return (
    <div className="relative min-h-screen">
      {showAmbientGlow ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_-10%,hsl(var(--primary)/0.28),transparent_65%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_85%_40%,hsl(var(--primary)/0.12),transparent_45%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_10%_80%,hsl(var(--primary)/0.1),transparent_40%)]"
          />
        </>
      ) : null}

      <div className="relative z-10">
        {/* Sticky nav keeps a full-bleed blur, but its contents sit in ShellFrame. */}
        <AppNav />
        <ShellFrame className="flex gap-8 pb-8">
          <IconRail />
          <div className="min-w-0 flex-1">{children}</div>
        </ShellFrame>
      </div>
    </div>
  );
}
