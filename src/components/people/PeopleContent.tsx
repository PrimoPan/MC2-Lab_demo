import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FloatingContactMenu from '../FloatingContactMenu';
import { useSectionScrollSpy } from '../../hooks/useSectionScrollSpy';
import type { AlumniGroup, MemberProfile, MemberRole, PeoplePageContent } from '../../types/legacyPages';
import {
  PEOPLE_ALUMNI_GROUP_HEADING_CLASS,
  PEOPLE_ALUMNI_ITEM_CLASS,
  PEOPLE_ALUMNI_LIST_CLASS,
  PEOPLE_ALUMNI_NAME_CLASS,
  PEOPLE_ALUMNI_SECTION_CLASS,
  PEOPLE_ALUMNI_TITLE_CLASS,
  PEOPLE_CARD_BACK_NAME_CLASS,
  PEOPLE_CARD_CLASS,
  PEOPLE_CARD_FOOTER_CLASS,
  PEOPLE_CARD_NAME_CLASS,
  PEOPLE_CARD_POSITION_CLASS,
  PEOPLE_CARD_QUOTE_CLASS,
  PEOPLE_CARD_SOCIAL_CLASS,
  PEOPLE_CARD_SOCIAL_ICON_CLASS,
  PEOPLE_CARD_SOCIAL_ITEM_CLASS,
  PEOPLE_CARD_SOCIAL_LINK_CLASS,
  PEOPLE_CARD_TEXT_FLOW_CLASS,
  PEOPLE_CONTENT_CLASS,
  PEOPLE_CURRENT_SECTION_CLASS,
  PEOPLE_EMPTY_CLASS,
  PEOPLE_EXPLORER_CLASS,
  PEOPLE_MAIN_FLOW_CLASS,
  PEOPLE_MEMBER_CARD_ITEM_CLASS,
  PEOPLE_MEMBER_GRID_CLASS,
  PEOPLE_OUTER_SECTION_CLASS,
  PEOPLE_PAGE_HEADING_CLASS,
  PEOPLE_ROLE_CHIPS_CLASS,
  PEOPLE_SEARCH_ICON_CLASS,
  PEOPLE_SEARCH_INPUT_CLASS,
  PEOPLE_SEARCH_SHELL_CLASS,
  PEOPLE_SECTION_NAV_CONTAINER_CLASS,
  PEOPLE_SECTION_NAV_LIST_CLASS,
  peopleCardBackClass,
  peopleCardFrontClass,
  peopleCardImageClass,
  peopleCardToggleClass,
  peopleCardToggleIconClass,
  peopleChipClass,
  peopleSectionNavClass,
  peopleSectionNavItemClass,
  peopleSectionNavLinkClass
} from './peopleStyles';

interface PeopleContentProps {
  content: PeoplePageContent;
}

const ROLE_SORT_ORDER: Record<string, number> = {
  leader: 0,
  chair: 0,
  postdoc: 1,
  admin: 2,
  phd: 3,
  mphil: 4,
  ra: 5,
  other: 6
};

function roleRank(member: MemberProfile): number {
  return ROLE_SORT_ORDER[member.role] ?? 99;
}

function cohortYearValue(member: MemberProfile): number {
  return Number.isFinite(member.cohortYear) ? Number(member.cohortYear) : 9999;
}

function formatFrontPosition(member: MemberProfile): string {
  if (member.cohortYear && member.cohortTerm) return `${member.positionTitle} | ${member.cohortTerm} ${member.cohortYear}`;
  return member.positionTitle;
}

function sortMembers(members: MemberProfile[]): MemberProfile[] {
  return [...members].sort((a, b) => {
    const roleA = roleRank(a);
    const roleB = roleRank(b);
    if (roleA !== roleB) return roleA - roleB;

    const yearA = cohortYearValue(a);
    const yearB = cohortYearValue(b);
    if (yearA !== yearB) return yearA - yearB;

    return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
  });
}

function matchesMember(member: MemberProfile, query: string, role: MemberRole): boolean {
  const rolePass = role === 'all' || member.role === role;
  if (!rolePass) return false;
  if (!query) return true;

  const haystack = [
    member.name,
    member.positionTitle,
    member.researchDirection,
    member.role,
    member.cohortTerm,
    member.cohortYear
  ].join(' ').toLowerCase();

  return haystack.includes(query);
}

function MemberCard({ fallbackResearch, member }: { fallbackResearch: string; member: MemberProfile }): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [photo, setPhoto] = useState(member.photo);
  const research = member.researchDirection || fallbackResearch;

  return (
    <li className={PEOPLE_MEMBER_CARD_ITEM_CLASS} id={member.key} data-member-key={member.key}>
      <article className={PEOPLE_CARD_CLASS} data-visible={isVisible ? 'true' : 'false'}>
        <div className={peopleCardFrontClass(isVisible)}>
          <img
            className={peopleCardImageClass(member.key === 'pan-hui')}
            src={photo}
            alt={`${member.name} profile photo`}
            onError={() => setPhoto('/images/Team_Profile_Pic/profile_icon.jpg')}
          />
          <div className={PEOPLE_CARD_TEXT_FLOW_CLASS} data-spacing='sm'>
            <p className={PEOPLE_CARD_NAME_CLASS}>{member.name}</p>
            <p className={PEOPLE_CARD_POSITION_CLASS}>{formatFrontPosition(member)}</p>
          </div>
        </div>

        <div className={peopleCardBackClass(isVisible)}>
          <p className={PEOPLE_CARD_BACK_NAME_CLASS}>{member.name}</p>
          <q className={PEOPLE_CARD_QUOTE_CLASS}>{research}</q>
          <ul role='list' className={PEOPLE_CARD_SOCIAL_CLASS}>
            {member.website ? (
              <li className={PEOPLE_CARD_SOCIAL_ITEM_CLASS}>
                <a className={PEOPLE_CARD_SOCIAL_LINK_CLASS} href={member.website} target='_blank' rel='noopener noreferrer'>
                  <i className={`fa fa-id-card fa-xl ${PEOPLE_CARD_SOCIAL_ICON_CLASS}`}></i>
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <footer className={PEOPLE_CARD_FOOTER_CLASS}>
          <button
            data-card-controller
            className={peopleCardToggleClass(isVisible)}
            aria-label={`Toggle card details for ${member.name}`}
            onClick={() => setIsVisible((visible) => !visible)}
          >
            <i className={`fa-solid fa-plus ${peopleCardToggleIconClass(isVisible)}`}></i>
          </button>
        </footer>
      </article>
    </li>
  );
}

function MemberExplorer({ content }: PeopleContentProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [activeRole, setActiveRole] = useState<MemberRole>('all');

  const visibleMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sortMembers(content.members).filter((member) => matchesMember(member, normalizedQuery, activeRole));
  }, [activeRole, content.members, query]);

  return (
    <>
      <div className={PEOPLE_EXPLORER_CLASS} aria-label={content.searchAria}>
        <label className={PEOPLE_SEARCH_SHELL_CLASS} htmlFor='memberSearchInput'>
          <i className={`fa-solid fa-magnifying-glass ${PEOPLE_SEARCH_ICON_CLASS}`} aria-hidden='true'></i>
          <input
            id='memberSearchInput'
            className={PEOPLE_SEARCH_INPUT_CLASS}
            type='search'
            placeholder={content.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className={PEOPLE_ROLE_CHIPS_CLASS} id='memberRoleChips' role='group' aria-label={content.roleFilterAria}>
          {content.roleChips.map((chip) => (
            <button
              type='button'
              className={peopleChipClass(activeRole === chip.role)}
              data-role-filter={chip.role}
              key={chip.role}
              onClick={() => setActiveRole(chip.role)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <section className={PEOPLE_CURRENT_SECTION_CLASS} id='Current'>
        <ul role='list' className={PEOPLE_MEMBER_GRID_CLASS} id='membersGrid'>
          {visibleMembers.length ? visibleMembers.map((member) => (
            <MemberCard fallbackResearch={content.fallbackResearch} key={member.key} member={member} />
          )) : <li className={PEOPLE_EMPTY_CLASS}>{content.emptyText}</li>}
        </ul>
      </section>
    </>
  );
}

function AlumniSections({ groups }: { groups: AlumniGroup[] }): JSX.Element {
  return (
    <section className={PEOPLE_ALUMNI_SECTION_CLASS} id='Graduated'>
      <h1 className={PEOPLE_ALUMNI_TITLE_CLASS}>Graduated / Alumni</h1>
      {groups.map((group) => (
        <React.Fragment key={group.heading}>
          <h3 className={PEOPLE_ALUMNI_GROUP_HEADING_CLASS}>{group.heading}</h3>
          <ul className={PEOPLE_ALUMNI_LIST_CLASS}>
            {group.entries.map((entry, index) => (
              <li className={PEOPLE_ALUMNI_ITEM_CLASS} key={`${group.heading}-${entry.name}-${index}`}>
                <span className={PEOPLE_ALUMNI_NAME_CLASS}>{entry.name}</span> {entry.detail}
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </section>
  );
}

export default function PeopleContent({ content }: PeopleContentProps): JSX.Element {
  const pageRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const programmaticScrollTargetRef = useRef<number | null>(null);
  const programmaticScrollDeadlineRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const anchorHighlightTimeoutRef = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState('Current');
  const [isSubnavHidden, setIsSubnavHidden] = useState(false);
  const sectionIds = useMemo(() => ['Current', 'Graduated'], []);

  useSectionScrollSpy(pageRef, sectionIds, setActiveSection, 190);

  const scrollToMemberHash = useCallback(() => {
    const memberKey = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (!memberKey || memberKey === 'Current' || memberKey === 'Graduated') return;

    const scrollContainer = pageRef.current;
    if (!scrollContainer) return;

    const target = Array.from(scrollContainer.querySelectorAll<HTMLElement>('[data-member-key]'))
      .find((element) => element.dataset.memberKey === memberKey);
    if (!target) return;

    setActiveSection('Current');
    setIsSubnavHidden(false);

    window.requestAnimationFrame(() => {
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetTop = target.getBoundingClientRect().top - containerRect.top + scrollContainer.scrollTop;
      const stickyOffset = window.matchMedia('(max-width: 980px)').matches ? 172 : 110;
      const nextTop = Math.max(0, targetTop - stickyOffset);

      programmaticScrollTargetRef.current = nextTop;
      programmaticScrollDeadlineRef.current = Date.now() + 4000;
      scrollContainer.scrollTo({ top: nextTop, behavior: 'smooth' });

      target.classList.add('is-anchor-target');
      if (anchorHighlightTimeoutRef.current !== null) window.clearTimeout(anchorHighlightTimeoutRef.current);
      anchorHighlightTimeoutRef.current = window.setTimeout(() => {
        target.classList.remove('is-anchor-target');
        anchorHighlightTimeoutRef.current = null;
      }, 2200);
    });
  }, []);

  useEffect(() => {
    const initialScrollTimeout = window.setTimeout(scrollToMemberHash, 80);
    window.addEventListener('hashchange', scrollToMemberHash);

    return () => {
      window.clearTimeout(initialScrollTimeout);
      window.removeEventListener('hashchange', scrollToMemberHash);
      if (anchorHighlightTimeoutRef.current !== null) window.clearTimeout(anchorHighlightTimeoutRef.current);
    };
  }, [scrollToMemberHash]);

  useEffect(() => {
    const scrollContainer = pageRef.current;
    if (!scrollContainer) return undefined;

    const updateSubnavState = () => {
      const nextScrollTop = scrollContainer.scrollTop;
      const delta = nextScrollTop - lastScrollTopRef.current;
      const programmaticTarget = programmaticScrollTargetRef.current;

      if (programmaticTarget !== null) {
        setIsSubnavHidden(false);
        if (Math.abs(nextScrollTop - programmaticTarget) < 4 || Date.now() > programmaticScrollDeadlineRef.current) {
          programmaticScrollTargetRef.current = null;
        }
        lastScrollTopRef.current = nextScrollTop;
        scrollFrameRef.current = null;
        return;
      }

      if (nextScrollTop < 120) {
        setIsSubnavHidden(false);
      } else if (delta > 12) {
        setIsSubnavHidden(true);
      } else if (delta < -10) {
        setIsSubnavHidden(false);
      }

      lastScrollTopRef.current = nextScrollTop;
      scrollFrameRef.current = null;
    };

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(updateSubnavState);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  const selectSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    setIsSubnavHidden(false);
    const scrollContainer = pageRef.current;
    const section = scrollContainer?.querySelector<HTMLElement>(`#${sectionId}`);
    if (!scrollContainer || !section) return;
    const containerRect = scrollContainer.getBoundingClientRect();
    const sectionTop = section.getBoundingClientRect().top - containerRect.top + scrollContainer.scrollTop;
    const stickyOffset = window.matchMedia('(max-width: 980px)').matches ? 172 : 90;
    const targetTop = Math.max(0, sectionTop - stickyOffset);
    programmaticScrollTargetRef.current = targetTop;
    programmaticScrollDeadlineRef.current = Date.now() + 4000;
    scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className={PEOPLE_CONTENT_CLASS} data-subnav-state={isSubnavHidden ? 'hidden' : 'visible'} ref={pageRef}>
        <section className={PEOPLE_OUTER_SECTION_CLASS}>
          <div className={peopleSectionNavClass(isSubnavHidden)} aria-label={content.pageHeading}>
            <div className={PEOPLE_SECTION_NAV_CONTAINER_CLASS}>
              <ul className={PEOPLE_SECTION_NAV_LIST_CLASS}>
                <li className={peopleSectionNavItemClass(activeSection === 'Current')}>
                  <a className={peopleSectionNavLinkClass(activeSection === 'Current')} href='#Current' onClick={(event) => { event.preventDefault(); selectSection('Current'); }}>{content.currentLabel}</a>
                </li>
                <li className={peopleSectionNavItemClass(activeSection === 'Graduated')}>
                  <a className={peopleSectionNavLinkClass(activeSection === 'Graduated')} href='#Graduated' onClick={(event) => { event.preventDefault(); selectSection('Graduated'); }}>{content.alumniLabel}</a>
                </li>
              </ul>
            </div>
          </div>

          <div className={PEOPLE_MAIN_FLOW_CLASS}>
            <h1 className={PEOPLE_PAGE_HEADING_CLASS}>{content.pageHeading}</h1>
            <MemberExplorer content={content} />
            <AlumniSections groups={content.alumniGroups} />
          </div>
        </section>
      </div>
      <FloatingContactMenu transparentSurface wrapperClassName='max-[840px]:hidden! [&_.menu__btn]:text-white!' />
    </>
  );
}
