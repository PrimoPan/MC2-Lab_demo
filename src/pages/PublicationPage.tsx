import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingContactMenu from '../components/FloatingContactMenu';
import ArchivedPublicationSections from '../components/publication/ArchivedPublicationSections';
import {
  PUBLICATION_AUTHOR_LINK_CLASS,
  PUBLICATION_CENTERED_ROW_CLASS,
  PUBLICATION_COL_12_CLASS,
  PUBLICATION_CONTACT_WRAPPER_CLASS,
  PUBLICATION_CONTAINER_CLASS,
  PUBLICATION_HEADING_CLASS,
  PUBLICATION_SECTION_CLASS,
  PUBLICATION_SHELL_CLASS,
  RECENT_AUTHOR_CLASS,
  RECENT_CONFERENCE_CLASS,
  RECENT_ITEM_CLASS,
  RECENT_LIST_CLASS,
  RECENT_TITLE_CLASS,
  RECENT_YEAR_HEADING_CLASS,
  RECENT_YEAR_SECTION_CLASS,
  YEAR_NAV_ACTIVE_CLASS,
  YEAR_NAV_ACTIVE_LINK_CLASS,
  YEAR_NAV_CLASS,
  YEAR_NAV_CONTAINER_CLASS,
  YEAR_NAV_ITEM_CLASS,
  YEAR_NAV_LINK_CLASS,
  YEAR_NAV_LIST_CLASS
} from '../components/publication/publicationStyles';
import SitePageShell from '../components/SitePageShell';
import { peoplePageContent } from '../data/legacyPageContent';
import { recentPublicationData } from '../data/recentPublications';
import { getRoutePath } from '../i18n/site';
import type { Locale } from '../types/common';

interface PublicationPageProps {
  locale?: Locale;
}

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021'];
const AUTHOR_SEPARATOR_PATTERN = /(\s*,\s+and\s+|\s*,\s*|\s+and\s+|\s*&\s+)/i;
const MANUAL_MEMBER_AUTHOR_ALIASES: Record<string, string[]> = {
  'bianca': ['Bianca Yang', 'Ruoshan Yang'],
  'ching-christie-pang': ['Christie Pang'],
  'clarence-cheung': ['Clarence Chi San Cheung'],
  'primopan': ['Primo Pan'],
  'wen-jye-chai': ['Wenjye Chai'],
  'zhang-yishuai': ['Yishuai Zhang']
};

interface MemberAuthorLink {
  key: string;
}

function normalizeAuthorName(value: string): string {
  return value
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[*^†‡.]+/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildMemberAuthorLookup(): Map<string, MemberAuthorLink> {
  const lookup = new Map<string, MemberAuthorLink>();

  peoplePageContent.en.members.forEach((member) => {
    const aliases = new Set([member.name, member.name.replace(/\([^)]*\)/g, ' '), ...(MANUAL_MEMBER_AUTHOR_ALIASES[member.key] || [])]);
    const normalizedNameParts = normalizeAuthorName(member.name).split(' ').filter(Boolean);
    if (normalizedNameParts.length > 2) {
      aliases.add(normalizedNameParts.slice(1).join(' '));
    }

    aliases.forEach((alias) => {
      const normalizedAlias = normalizeAuthorName(alias);
      if (normalizedAlias) lookup.set(normalizedAlias, { key: member.key });
    });
  });

  return lookup;
}

const MEMBER_AUTHOR_LOOKUP = buildMemberAuthorLookup();

function getMemberAuthorLink(authorName: string): MemberAuthorLink | undefined {
  return MEMBER_AUTHOR_LOOKUP.get(normalizeAuthorName(authorName));
}

function splitAuthorToken(part: string): { leading: string; name: string; trailing: string } {
  const match = part.match(/^(\s*)(.*?)([.;]*)$/);
  return {
    leading: match?.[1] || '',
    name: match?.[2] || part,
    trailing: match?.[3] || ''
  };
}

function isAuthorSeparator(part: string): boolean {
  return /^\s*(?:,|and|&)\s*$/i.test(part);
}

function getMemberProfileHref(locale: Locale, memberKey: string): string {
  if (memberKey === 'pan-hui') return getRoutePath('leader', locale);
  return `${getRoutePath('people', locale)}#${memberKey}`;
}

function AuthorList({ authors, locale }: { authors: string; locale: Locale }): JSX.Element {
  const parts = authors.split(AUTHOR_SEPARATOR_PATTERN).filter((part) => part.length > 0);

  return (
    <>
      {parts.map((part, index) => {
        if (isAuthorSeparator(part)) return <React.Fragment key={`${index}-${part}`}>{part}</React.Fragment>;

        const { leading, name, trailing } = splitAuthorToken(part);
        const memberLink = getMemberAuthorLink(name);
        if (!memberLink) return <React.Fragment key={`${index}-${part}`}>{part}</React.Fragment>;

        return (
          <React.Fragment key={`${index}-${part}`}>
            {leading}
            <Link className={PUBLICATION_AUTHOR_LINK_CLASS} to={getMemberProfileHref(locale, memberLink.key)}>{name}</Link>
            {trailing}
          </React.Fragment>
        );
      })}
    </>
  );
}

function decorateMemberAuthorLinks(root: HTMLElement, locale: Locale): void {
  root.querySelectorAll<HTMLElement>('.author').forEach((element) => {
    if (element.querySelector('.publication-author-link')) return;
    const text = element.textContent || '';
    const parts = text.split(AUTHOR_SEPARATOR_PATTERN).filter((part) => part.length > 0);
    const fragment = document.createDocumentFragment();
    let hasMemberLink = false;

    parts.forEach((part) => {
      if (isAuthorSeparator(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const { leading, name, trailing } = splitAuthorToken(part);
      const memberLink = getMemberAuthorLink(name);
      if (!memberLink) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      hasMemberLink = true;
      if (leading) fragment.appendChild(document.createTextNode(leading));
      const link = document.createElement('a');
      link.className = PUBLICATION_AUTHOR_LINK_CLASS;
      link.href = getMemberProfileHref(locale, memberLink.key);
      link.textContent = name;
      fragment.appendChild(link);
      if (trailing) fragment.appendChild(document.createTextNode(trailing));
    });

    if (!hasMemberLink) return;
    element.textContent = '';
    element.appendChild(fragment);
  });
}

function usePublicationScrollSpy(pageRef: React.RefObject<HTMLElement>, setActiveYear: React.Dispatch<React.SetStateAction<string>>): void {
  useEffect(() => {
    const page = pageRef.current;
    const scrollContainer = page?.querySelector<HTMLElement>('.publication-section');
    if (!page || !scrollContainer) return undefined;

    const syncYearNavByScroll = () => {
      const sections = YEARS
        .map((year) => page.querySelector<HTMLElement>(`#yr${year}`))
        .filter((section): section is HTMLElement => Boolean(section));
      if (!sections.length) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const triggerLine = scrollContainer.scrollTop + 140;
      let activeSection = sections[0];
      sections.forEach((section) => {
        const sectionTopInContainer = section.getBoundingClientRect().top - containerRect.top + scrollContainer.scrollTop;
        if (sectionTopInContainer <= triggerLine) activeSection = section;
      });
      setActiveYear(activeSection.id.replace('yr', ''));
    };

    scrollContainer.addEventListener('scroll', syncYearNavByScroll, { passive: true });
    window.addEventListener('resize', syncYearNavByScroll);
    syncYearNavByScroll();
    return () => {
      scrollContainer.removeEventListener('scroll', syncYearNavByScroll);
      window.removeEventListener('resize', syncYearNavByScroll);
    };
  }, [pageRef, setActiveYear]);
}

function YearNav({ activeYear, onSelectYear }: { activeYear: string; onSelectYear: (year: string) => void }): JSX.Element {
  return (
    <div className={YEAR_NAV_CLASS}>
      <div className={YEAR_NAV_CONTAINER_CLASS}>
        <ul className={YEAR_NAV_LIST_CLASS}>
          {YEARS.map((year) => (
            <li className={`${YEAR_NAV_ITEM_CLASS} yr${year} ${activeYear === year ? `active ${YEAR_NAV_ACTIVE_CLASS}` : ''}`} key={year}>
              <a className={`${YEAR_NAV_LINK_CLASS} ${activeYear === year ? YEAR_NAV_ACTIVE_LINK_CLASS : ''}`} href={`#yr${year}`} onClick={(event) => { event.preventDefault(); onSelectYear(year); }}>{year}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RecentPublicationItem({ authors, locale, title, venue }: { title: string; authors: string; venue: string; locale: Locale }): JSX.Element {
  return (
    <article className={RECENT_ITEM_CLASS}>
      <h4 className={RECENT_TITLE_CLASS}>{title}</h4>
      <p className={RECENT_CONFERENCE_CLASS}>{venue}</p>
      <p className={RECENT_AUTHOR_CLASS}><AuthorList authors={authors} locale={locale} /></p>
    </article>
  );
}

function RecentPublicationSections({ locale }: { locale: Locale }): JSX.Element {
  const years = useMemo(() => Object.keys(recentPublicationData).sort((a, b) => Number(b) - Number(a)), []);
  return (
    <>
      {years.map((year) => (
        <section id={`yr${year}`} className={RECENT_YEAR_SECTION_CLASS} key={year}>
          <br />
          <br />
          <h3 className={RECENT_YEAR_HEADING_CLASS}>{`YEAR ${year}`}</h3>
          <div className={RECENT_LIST_CLASS}>
            {recentPublicationData[year].map((entry, index) => <RecentPublicationItem {...entry} locale={locale} key={`${year}-${index}-${entry.title}`} />)}
          </div>
        </section>
      ))}
    </>
  );
}

export default function PublicationPage({ locale = 'en' }: PublicationPageProps): JSX.Element {
  const pageRef = useRef<HTMLElement>(null);
  const [activeYear, setActiveYear] = useState('2026');
  const isZh = locale === 'zh-CN';

  usePublicationScrollSpy(pageRef, setActiveYear);

  useEffect(() => {
    if (pageRef.current) decorateMemberAuthorLinks(pageRef.current, locale);
  }, [locale]);

  const selectYear = (year: string) => {
    setActiveYear(year);
    const section = pageRef.current?.querySelector<HTMLElement>(`#yr${year}`);
    const scrollContainer = pageRef.current?.querySelector<HTMLElement>('.publication-section');
    if (!section || !scrollContainer) return;
    const containerRect = scrollContainer.getBoundingClientRect();
    const sectionTop = section.getBoundingClientRect().top - containerRect.top + scrollContainer.scrollTop;
    const previousScrollBehavior = scrollContainer.style.getPropertyValue('scroll-behavior');
    const previousScrollBehaviorPriority = scrollContainer.style.getPropertyPriority('scroll-behavior');
    scrollContainer.style.setProperty('scroll-behavior', 'auto', 'important');
    scrollContainer.scrollTop = Math.max(0, sectionTop - 90);
    window.requestAnimationFrame(() => {
      if (previousScrollBehavior) scrollContainer.style.setProperty('scroll-behavior', previousScrollBehavior, previousScrollBehaviorPriority);
      else scrollContainer.style.removeProperty('scroll-behavior');
    });
    window.history.replaceState(null, '', `#yr${year}`);
  };

  return (
    <SitePageShell className={PUBLICATION_SHELL_CLASS} ariaLabel={isZh ? '论文' : 'Publication'} locale={locale} activeRoute='publication' ref={pageRef}>
      <div className={PUBLICATION_SECTION_CLASS}>
        <div className={PUBLICATION_CONTAINER_CLASS}>
          <div className={PUBLICATION_CENTERED_ROW_CLASS}>
            <div className={`${PUBLICATION_COL_12_CLASS} pt-[100px]! text-center!`}>
              <h3 className={PUBLICATION_HEADING_CLASS}>{isZh ? '论文' : 'Publication'}</h3>
            </div>
            <YearNav activeYear={activeYear} onSelectYear={selectYear} />
            <div className={`${PUBLICATION_COL_12_CLASS} mt-[1rem]! min-w-0!`}>
              <RecentPublicationSections locale={locale} />
              <ArchivedPublicationSections />
            </div>
          </div>
        </div>
      </div>
      <FloatingContactMenu wrapperClassName={PUBLICATION_CONTACT_WRAPPER_CLASS} />
    </SitePageShell>
  );
}
