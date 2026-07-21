import React from 'react';
import NewsListContent from '../components/news/NewsListContent';
import SitePageShell from '../components/SitePageShell';
import { newsPageContent } from '../data/legacyPageContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePageStylesheets } from '../hooks/usePageStylesheets';
import { newsPageStyles } from '../styles/legacy/pageStyles';
import type { Locale } from '../types/common';

interface NewsPageProps {
  locale?: Locale;
}

export default function NewsPage({ locale = 'en' }: NewsPageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');
  usePageStylesheets(newsPageStyles);

  const content = newsPageContent[locale].list;
  return (
    <SitePageShell className='news-page-shell' ariaLabel={locale === 'zh-CN' ? '新闻' : 'News'} locale={locale} activeRoute='news'>
      <NewsListContent content={content} />
    </SitePageShell>
  );
}
