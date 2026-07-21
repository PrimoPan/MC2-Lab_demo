import React from 'react';
import PeopleContent from '../components/people/PeopleContent';
import { PEOPLE_SHELL_CLASS } from '../components/people/peopleStyles';
import SitePageShell from '../components/SitePageShell';
import { peoplePageContent } from '../data/legacyPageContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Locale } from '../types/common';

interface PeoplePageProps {
  locale?: Locale;
}

export default function PeoplePage({ locale = 'en' }: PeoplePageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');
  const content = peoplePageContent[locale];
  return (
    <SitePageShell className={PEOPLE_SHELL_CLASS} ariaLabel={locale === 'zh-CN' ? '成员' : 'People'} locale={locale} activeRoute='people'>
      <PeopleContent content={content} />
    </SitePageShell>
  );
}
