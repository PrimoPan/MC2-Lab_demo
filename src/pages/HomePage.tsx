import React from 'react';
import LegacyFramePage from '../components/LegacyFramePage';
import type { Locale } from '../types/common';

interface HomePageProps {
  locale?: Locale;
}

export default function HomePage({ locale = 'en' }: HomePageProps): JSX.Element {
  const pagePath = locale === 'zh-CN' ? '/legacy/zh/index.html' : '/legacy/index.html';
  return <LegacyFramePage title="Home" pagePath={pagePath} />;
}
