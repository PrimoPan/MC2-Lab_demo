import React from 'react';
import NewsArticleContent from '../components/news/NewsArticleContent';
import SitePageShell from '../components/SitePageShell';
import { newsPageContent } from '../data/legacyPageContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePageStylesheets } from '../hooks/usePageStylesheets';
import { newsPageStyles } from '../styles/legacy/pageStyles';
import type { Locale } from '../types/common';

interface NewsJapanTimesAILovePageProps {
  locale?: Locale;
}

export default function NewsJapanTimesAILovePage({ locale = 'en' }: NewsJapanTimesAILovePageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');
  usePageStylesheets(newsPageStyles);

  const article = newsPageContent[locale].articles['japantimes-ai-love'];
  return (
    <SitePageShell className='news-page-shell' ariaLabel={locale === 'zh-CN' ? 'Japan Times与AI情感研究' : 'Japan Times on AI Attachment'} locale={locale} activeRoute='news'>
      <NewsArticleContent article={article} />
    </SitePageShell>
  );
}
