import React from 'react';
import NewsArticleContent from '../components/news/NewsArticleContent';
import { NEWS_SHELL_CLASS } from '../components/news/newsStyles';
import SitePageShell from '../components/SitePageShell';
import { newsPageContent } from '../data/legacyPageContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Locale } from '../types/common';

interface NewsJapanTimesAILovePageProps {
  locale?: Locale;
}

export default function NewsJapanTimesAILovePage({ locale = 'en' }: NewsJapanTimesAILovePageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');

  const article = newsPageContent[locale].articles['japantimes-ai-love'];
  return (
    <SitePageShell className={NEWS_SHELL_CLASS} ariaLabel={locale === 'zh-CN' ? 'Japan Times与AI情感研究' : 'Japan Times on AI Attachment'} locale={locale} activeRoute='news'>
      <NewsArticleContent article={article} />
    </SitePageShell>
  );
}
