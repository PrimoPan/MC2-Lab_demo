import React from 'react';
import NewsArticleContent from '../components/news/NewsArticleContent';
import SitePageShell from '../components/SitePageShell';
import { newsPageContent } from '../data/legacyPageContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePageStylesheets } from '../hooks/usePageStylesheets';
import { newsPageStyles } from '../styles/legacy/pageStyles';
import type { Locale } from '../types/common';

interface NewsNatureSpotlightPageProps {
  locale?: Locale;
}

export default function NewsNatureSpotlightPage({ locale = 'en' }: NewsNatureSpotlightPageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');
  usePageStylesheets(newsPageStyles);

  const article = newsPageContent[locale].articles['nature-spotlight'];
  return (
    <SitePageShell className='news-page-shell' ariaLabel={locale === 'zh-CN' ? 'Nature专题聚焦' : 'Nature Spotlight'} locale={locale} activeRoute='news'>
      <NewsArticleContent article={article} />
    </SitePageShell>
  );
}
