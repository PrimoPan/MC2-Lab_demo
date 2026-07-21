import React from 'react';
import type { Locale, RouteKey } from '../types/common';
import SiteNav from './SiteNav';

interface SitePageShellProps {
  activeRoute: RouteKey;
  ariaLabel: string;
  children: React.ReactNode;
  className: string;
  locale: Locale;
  alternateHref?: string;
  navControlVariant?: 'default' | 'legacy';
}

const SitePageShell = React.forwardRef<HTMLElement, SitePageShellProps>(function SitePageShell(
  { activeRoute, alternateHref, ariaLabel, children, className, locale, navControlVariant },
  ref
): JSX.Element {
  return (
    <main className={className} aria-label={ariaLabel} ref={ref}>
      <SiteNav activeRoute={activeRoute} locale={locale} alternateHref={alternateHref} controlVariant={navControlVariant} />
      {children}
    </main>
  );
});

export default SitePageShell;
