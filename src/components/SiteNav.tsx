import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Locale, RouteKey } from '../types/common';
import { getAlternateRoutePath, getSiteNavItems, getSiteText, isZhLocale } from '../i18n/site';

interface SiteNavProps {
  activeRoute: RouteKey;
  locale: Locale;
  alternateHref?: string;
}

export default function SiteNav({ activeRoute, locale, alternateHref }: SiteNavProps): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const isZh = isZhLocale(locale);
  const items = getSiteNavItems(locale, activeRoute);
  const languageHref = alternateHref || getAlternateRoutePath(activeRoute, locale);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const closeMenu = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && !navRef.current?.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [isMenuOpen]);

  return (
    <div ref={navRef} className={isMenuOpen ? 'major-nav is-menu-open' : 'major-nav'}>
      <nav className='nav-logo' aria-label='Brand'>
        <img src='/images/MC2.png' alt='MC2 Lab' />
        <div className='vertical'></div>
        <img src={isZh ? '/images/UST-GZ-ZH.png' : '/images/UST-GZ-EN.png'} alt={isZh ? '香港科技大学（广州）' : 'HKUST(GZ)'} />
        <div className='vertical'></div>
        <img src={isZh ? '/images/UST-ZH.png' : '/images/UST-EN.png'} alt={isZh ? '香港科技大学' : 'HKUST'} />
      </nav>

      <nav className='nav m-[0_.5em]! p-[0_.5em]! box-content!' aria-label='Primary navigation'>
        <ul className='nav__links flex! list-none! gap-[30px]! p-[1em]! pb-0! box-content!'>
          {items.map((item) => (
            <li className={item.active ? 'nav__link active' : 'nav__link'} key={item.href}>
              <Link className="font-['Open_Sans']!" to={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className='banner-controls'>
        <Link className='banner-lang' to={languageHref}>{getSiteText(locale, 'languageLabel')}</Link>
        <button
          type='button'
          className='banner-menu-toggle'
          id='bannerMenuToggle'
          aria-expanded={isMenuOpen}
          aria-label={getSiteText(locale, 'menuAria')}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {getSiteText(locale, 'menuLabel')}
        </button>
      </div>
    </div>
  );
}
