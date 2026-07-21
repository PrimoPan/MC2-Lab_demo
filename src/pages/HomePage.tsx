import React, { useCallback, useEffect, useRef, useState } from 'react';
import HomeHero from '../components/home/HomeHero';
import HomePanels from '../components/home/HomePanels';
import HomeSocialMenu from '../components/home/HomeSocialMenu';
import SiteNav from '../components/SiteNav';
import { useCloseOnOutsideInteraction } from '../hooks/useCloseOnOutsideInteraction';
import type { Locale } from '../types/common';
import type { HomePanel } from '../types/home';

interface HomePageProps {
  locale?: Locale;
}

function useHomeDocumentTitle(): void {
  useEffect(() => {
    document.title = 'MC2 | HKUST(GZ), HKUST';
  }, []);
}

const HOME_SHELL_CLASS = [
  'home-page-shell fixed! inset-0! size-full! overflow-hidden!',
  'bg-[rgba(31,32,41,1)]! text-[15px]! leading-[1.6]! font-light! text-white! font-[\'Poppins\']!',
  '[&_a]:cursor-pointer! [&_a:hover]:text-[#bfdbdb]! [&_a:hover]:no-underline!'
].join(' ');

function getHomeShellClassName(activePanel: HomePanel): string {
  return [
    HOME_SHELL_CLASS,
    activePanel === 'about' ? 'home-about-on' : '',
    activePanel === 'contact' ? 'home-contact-on' : ''
  ].filter(Boolean).join(' ');
}

export default function HomePage({ locale = 'en' }: HomePageProps): JSX.Element {
  useHomeDocumentTitle();
  const [activePanel, setActivePanel] = useState<HomePanel>(null);
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const socialMenuRef = useRef<HTMLDivElement>(null);

  const closePanel = useCallback(() => setActivePanel(null), []);
  const closeSocialMenu = useCallback(() => setIsSocialMenuOpen(false), []);
  const toggleSocialMenu = useCallback(() => setIsSocialMenuOpen((open) => !open), []);

  useCloseOnOutsideInteraction(socialMenuRef, isSocialMenuOpen, closeSocialMenu);

  return (
    <div className={getHomeShellClassName(activePanel)} role='main' aria-label='Home'>
      <SiteNav activeRoute='home' locale={locale} />
      <HomeHero isPanelOpen={activePanel !== null} locale={locale} onOpenPanel={setActivePanel} />
      <HomePanels activePanel={activePanel} onClosePanel={closePanel} />
      <HomeSocialMenu isOpen={isSocialMenuOpen} menuRef={socialMenuRef} onToggle={toggleSocialMenu} />
    </div>
  );
}
