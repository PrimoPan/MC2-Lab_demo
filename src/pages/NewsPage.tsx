import React from 'react';
import NewsListContent from '../components/news/NewsListContent';
import { NEWS_SHELL_CLASS } from '../components/news/newsStyles';
import SitePageShell from '../components/SitePageShell';
import { newsPageContent } from '../data/legacyPageContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Locale } from '../types/common';

interface NewsPageProps {
  locale?: Locale;
}

export default function NewsPage({ locale = 'en' }: NewsPageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');

  const content = newsPageContent[locale].list;
  return (
    <SitePageShell className={NEWS_SHELL_CLASS} ariaLabel={locale === 'zh-CN' ? '新闻' : 'News'} locale={locale} activeRoute='news'>
      <NewsListContent content={content} />
    </SitePageShell>
  );
}
