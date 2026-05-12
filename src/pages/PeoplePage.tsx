import React from 'react';
import LegacyFramePage from '../components/LegacyFramePage';
import type { Locale } from '../types/common';

interface PeoplePageProps {
  locale?: Locale;
}

export default function PeoplePage({ locale = 'en' }: PeoplePageProps): JSX.Element {
  const pagePath = locale === 'zh-CN' ? '/legacy/zh/people.html' : '/legacy/people.html';
  return <LegacyFramePage title="People" pagePath={pagePath} />;
}
