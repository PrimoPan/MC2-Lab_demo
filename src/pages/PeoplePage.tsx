import React from 'react';
import PeopleContent from '../components/people/PeopleContent';
import SitePageShell from '../components/SitePageShell';
import { peoplePageContent } from '../data/legacyPageContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePageStylesheets } from '../hooks/usePageStylesheets';
import { peoplePageStyles } from '../styles/legacy/pageStyles';
import type { Locale } from '../types/common';

interface PeoplePageProps {
  locale?: Locale;
}

export default function PeoplePage({ locale = 'en' }: PeoplePageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');
  usePageStylesheets(peoplePageStyles);

  const content = peoplePageContent[locale];
  return (
    <SitePageShell className='people-page-shell' ariaLabel={locale === 'zh-CN' ? '成员' : 'People'} locale={locale} activeRoute='people'>
      <PeopleContent content={content} />
    </SitePageShell>
  );
}
