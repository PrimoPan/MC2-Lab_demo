import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Locale, RouteKey } from '../types/common';
import { getAlternateRoutePath, getSiteNavItems, getSiteText, isZhLocale } from '../i18n/site';

interface SiteNavProps {
  activeRoute: RouteKey;
  locale: Locale;
  alternateHref?: string;
}

const SITE_NAV_CLASS = [
  'fixed! top-0! right-0! left-0! z-[1600]! grid! w-full! max-w-none! grid-cols-[auto_1fr_auto]! flex-wrap! items-center! justify-between! gap-[10px]!',
  'rounded-[0_0_18px_18px]! border-x-0! border-t-0! border-b! border-[rgba(176,197,255,0.14)]! [border-top-style:none]! [border-right-style:none]! [border-left-style:none]!',
  'bg-[linear-gradient(180deg,rgba(12,18,32,0.96)_0%,rgba(16,22,39,0.9)_100%)]!',
  'px-[clamp(14px,2vw,24px)]! py-[10px]! [box-shadow:0_10px_24px_rgba(3,8,20,0.18)]! [backdrop-filter:blur(12px)]! [-webkit-backdrop-filter:blur(12px)]!',
  '[transition:transform_260ms_ease,opacity_220ms_ease]! [will-change:transform,opacity]!',
  'after:pointer-events-none! after:absolute! after:inset-0! after:rounded-[0_0_18px_18px]! after:content-[\'\']!',
  'after:bg-[linear-gradient(120deg,rgba(111,231,255,0.12),rgba(144,255,206,0)_56%),linear-gradient(300deg,rgba(144,255,206,0.1),rgba(111,231,255,0)_54%)]!',
  'max-[1160px]:gap-[9px]! max-[1160px]:px-[12px]!',
  'max-[980px]:top-[6px]! max-[980px]:right-auto! max-[980px]:left-1/2! max-[980px]:w-[calc(100%-8px)]!',
  'max-[980px]:[transform:translateX(-50%)]! max-[980px]:grid-cols-[minmax(0,1fr)_auto]! max-[980px]:gap-[8px]! max-[980px]:p-[6px]!',
  'max-[980px]:rounded-[14px]! max-[980px]:border! max-[980px]:border-[rgba(176,197,255,0.14)]!',
  'max-[980px]:bg-[linear-gradient(180deg,rgba(20,28,46,0.62)_0%,rgba(8,12,24,0.58)_100%)]!',
  'max-[980px]:[box-shadow:0_8px_22px_rgba(3,8,20,0.24)]!',
  'max-[980px]:after:rounded-[14px]! motion-reduce:animate-none! motion-reduce:transition-none!'
].join(' ');

const SITE_LOGO_CLASS = [
  'relative! z-[1]! m-0! flex! h-[4em]! min-w-0! items-center! gap-[8px]! overflow-hidden! rounded-[12px]! border!',
  'border-[rgba(176,197,255,0.12)]! bg-[rgba(255,255,255,0.025)]! px-[9px]! py-[6px]! [box-shadow:none]!',
  'max-[980px]:gap-[7px]! max-[980px]:px-[8px]! max-[980px]:py-[6px]!'
].join(' ');

const SITE_PRIMARY_NAV_CLASS = [
  'static! z-[1]! m-[0_.5em]! flex! h-[4em]! min-h-[48px]! items-center! justify-center! overflow-hidden! box-content!',
  'rounded-[12px]! border! border-[rgba(176,197,255,0.12)]! bg-[rgba(7,13,27,0.42)]! p-[0_.5em]!',
  '[box-shadow:0_1em_1em_rgba(0,0,0,0.2)]!',
  'max-[980px]:absolute! max-[980px]:top-[calc(100%+8px)]! max-[980px]:right-0! max-[980px]:left-0!',
  'max-[980px]:h-auto! max-[980px]:w-full!',
  'max-[980px]:z-[1700]! max-[980px]:rounded-[13px]! max-[980px]:border-[rgba(176,197,255,0.16)]!',
  'max-[980px]:bg-[rgba(7,13,27,0.9)]!'
].join(' ');

const SITE_LINK_CLASS = [
  "relative! inline-flex! min-h-[38px]! items-center! justify-center! overflow-hidden! whitespace-nowrap!",
  "rounded-[9px]! border! border-transparent! bg-transparent! px-[13px]! py-0!",
  "font-['Open_Sans']! text-[0.96rem]! leading-none! font-bold! tracking-[0.01em]! text-[#c3cfe9]! no-underline! opacity-100!",
  '[transition:color_180ms_ease,border-color_180ms_ease,background-color_180ms_ease,transform_180ms_ease,box-shadow_180ms_ease]!',
  "after:absolute! after:right-[11px]! after:bottom-[6px]! after:left-[11px]! after:h-px! after:origin-center! after:[transform:scaleX(0.35)]!",
  "after:rounded-[999px]! after:bg-[linear-gradient(90deg,rgba(111,231,255,0.9),rgba(144,255,206,0.9))]! after:opacity-0! after:content-['']!",
  'after:[transition:transform_180ms_ease,opacity_180ms_ease]!',
  'hover:-translate-y-px! hover:border-[rgba(176,197,255,0.14)]! hover:bg-[rgba(255,255,255,0.06)]! hover:text-[#ecf2ff]!',
  'hover:after:[transform:scaleX(1)]! hover:after:opacity-[0.58]! focus-visible:after:[transform:scaleX(1)]! focus-visible:after:opacity-[0.58]!',
  'max-[1160px]:px-[10px]! max-[1160px]:text-[0.9rem]!',
  'max-[980px]:min-h-[40px]! max-[980px]:w-full! max-[980px]:justify-start! max-[980px]:px-[12px]! max-[980px]:text-[0.96rem]!',
  'max-[980px]:after:[transform:scaleX(0)]! max-[980px]:after:opacity-0! motion-reduce:transition-none! motion-reduce:after:transition-none!'
].join(' ');

const SITE_ACTIVE_LINK_CLASS = [
  'group-[.active]:border-[rgba(111,231,255,0.34)]! group-[.active]:bg-[linear-gradient(110deg,#6fe7ff_0%,#90ffce_100%)]!',
  'group-[.active]:text-[#061323]! group-[.active]:[box-shadow:0_6px_14px_rgba(57,190,201,0.17)]!',
  'min-[981px]:group-[.active]:after:[transform:scaleX(1)]! group-[.active]:after:[background:rgba(6,19,35,0.7)]! min-[981px]:group-[.active]:after:opacity-24!'
].join(' ');

const SITE_CONTROL_CLASS = [
  "min-h-[38px]! items-center! justify-center! border! border-[rgba(176,197,255,0.16)]!",
  "font-bold! no-underline!",
  '[transition:background-color_160ms_ease,transform_160ms_ease]! hover:bg-[rgba(255,255,255,0.1)]!',
  'motion-reduce:transition-none!'
].join(' ');

export default function SiteNav({ activeRoute, locale, alternateHref }: SiteNavProps): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const isZh = isZhLocale(locale);
  const items = getSiteNavItems(locale, activeRoute);
  const languageHref = alternateHref || getAlternateRoutePath(activeRoute, locale);
  const isLeader = activeRoute === 'leader';
  const usesLegacyControlCascade = activeRoute === 'project' || activeRoute === 'news';
  const usesPeopleControlCascade = activeRoute === 'people';
  const routeAnimationClass = activeRoute === 'leader'
    ? 'animate-[leaderBannerRouteEnter_180ms_ease-out_both]! max-[980px]:animate-[leaderBannerRouteEnterMobile_140ms_ease-out_both]!'
    : 'animate-[bannerRouteEnter_180ms_ease-out_both]! max-[980px]:animate-[bannerRouteEnterMobile_140ms_ease-out_both]!';

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
    <div ref={navRef} className={`${isMenuOpen ? 'major-nav is-menu-open' : 'major-nav'} ${SITE_NAV_CLASS} ${routeAnimationClass}`}>
      <nav className={`nav-logo ${SITE_LOGO_CLASS}`} aria-label='Brand'>
        <img className={`m-0! block! h-[28px]! max-h-[70%]! w-auto! max-w-[232px]! max-[1160px]:h-[25px]! max-[1160px]:max-w-[200px]! max-[980px]:h-[23px]! max-[980px]:max-w-[164px]! ${usesLegacyControlCascade || usesPeopleControlCascade ? 'min-w-0! object-contain!' : ''} ${isLeader ? 'max-[640px]:h-[24px]! max-[640px]:max-w-[150px]!' : ''}`} src='/images/MC2.png' alt='MC2 Lab' />
        <div className={`vertical m-0! h-[22px]! border-l-2! border-white! opacity-35! ${isLeader ? 'max-[640px]:h-[20px]!' : ''}`}></div>
        <img className={`m-0! block! h-[26px]! max-h-[70%]! w-auto! max-w-[232px]! max-[1160px]:h-[23px]! max-[1160px]:max-w-[200px]! max-[980px]:h-[21px]! max-[980px]:max-w-[164px]! ${usesLegacyControlCascade || usesPeopleControlCascade ? 'min-w-0! object-contain!' : ''} ${isLeader ? 'max-[640px]:h-[22px]! max-[640px]:max-w-[150px]!' : ''}`} src={isZh ? '/images/UST-GZ-ZH.png' : '/images/UST-GZ-EN.png'} alt={isZh ? '香港科技大学（广州）' : 'HKUST(GZ)'} />
        <div className='vertical m-0! h-[22px]! border-l-2! border-white! opacity-35! max-[980px]:hidden!'></div>
        <img className={`m-0! block! h-[26px]! max-h-[70%]! w-auto! max-w-[232px]! max-[1160px]:h-[23px]! max-[1160px]:max-w-[200px]! max-[980px]:hidden! ${usesLegacyControlCascade || usesPeopleControlCascade ? 'min-w-0! object-contain!' : ''}`} src={isZh ? '/images/UST-ZH.png' : '/images/UST-EN.png'} alt={isZh ? '香港科技大学' : 'HKUST'} />
      </nav>

      <nav className={`nav ${SITE_PRIMARY_NAV_CLASS} ${isMenuOpen ? `max-[980px]:flex! ${usesPeopleControlCascade ? 'max-[980px]:min-h-0! max-[980px]:max-h-[calc(100vh-96px)]! max-[980px]:overflow-y-auto!' : ''}` : 'max-[980px]:hidden!'}`} aria-label='Primary navigation'>
        <ul className='nav__links m-0! flex! w-auto! list-none! items-center! justify-center! gap-[30px]! p-[1em]! pb-0! box-content! max-[980px]:w-full! max-[980px]:flex-col! max-[980px]:items-stretch!'>
          {items.map((item) => (
            <li className={`${item.active ? 'nav__link active' : 'nav__link'} group m-0! inline-flex! ${usesPeopleControlCascade ? 'pt-[5px]! pb-[0.7em]! text-[1.4em]! leading-[1.5]! text-white!' : 'py-[5px]!'} max-[980px]:w-full!`} key={item.href}>
              <Link className={`${SITE_LINK_CLASS} ${item.active ? SITE_ACTIVE_LINK_CLASS : ''}`} to={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={`banner-controls relative! z-[1]! flex! items-center! justify-self-end! gap-[8px]! max-[980px]:gap-[6px]! ${usesLegacyControlCascade ? 'max-[980px]:shrink-0! max-[980px]:[justify-self:end]!' : ''}`}>
        <Link className={`banner-lang ${SITE_CONTROL_CLASS} inline-flex! min-w-[56px]! rounded-[10px]! px-[12px]! py-0! font-['Open_Sans','Noto_Sans',sans-serif]! text-[0.88rem]! leading-none! ${usesLegacyControlCascade ? 'bg-transparent! text-[#007bff]! hover:[transform:translateY(-1px)]!' : `${usesPeopleControlCascade ? 'bg-transparent! text-white!' : 'bg-[rgba(255,255,255,0.05)]! text-[#ecf2ff]!'} hover:-translate-y-px!`} ${isLeader ? 'max-[640px]:min-w-[50px]! max-[640px]:px-[10px]!' : ''}`} to={languageHref}>{getSiteText(locale, 'languageLabel')}</Link>
        <button
          type='button'
          className={`banner-menu-toggle ${SITE_CONTROL_CLASS} hidden! min-w-[44px]! bg-[rgba(255,255,255,0.05)]! px-[10px]! py-0! text-[#ecf2ff]! max-[980px]:inline-flex! ${usesLegacyControlCascade || usesPeopleControlCascade ? "rounded-none! [font-family:-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol','Noto_Color_Emoji']! text-[16px]! leading-[1.5]! hover:[transform:translateY(-1px)]!" : "rounded-[10px]! font-['Open_Sans','Noto_Sans',sans-serif]! text-[0.88rem]! leading-none! hover:-translate-y-px!"} ${isLeader ? 'max-[640px]:min-w-[40px]! max-[640px]:px-[9px]! max-[640px]:text-[0.9rem]!' : ''}`}
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
