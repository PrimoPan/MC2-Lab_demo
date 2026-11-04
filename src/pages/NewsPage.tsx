import React, { useMemo } from 'react';
import NewsListContent from '../components/news/NewsListContent';
import { NEWS_SHELL_CLASS } from '../components/news/newsStyles';
import SitePageShell from '../components/SitePageShell';
import { newsPageContent } from '../data/legacyPageContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Locale } from '../types/common';
import { useNewsPosts } from '../hooks/useNewsPosts';
import { newsText } from '../types/newsPost';
import type { NewsListItem } from '../types/legacyPages';

interface NewsPageProps {
  locale?: Locale;
}

export default function NewsPage({ locale = 'en' }: NewsPageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');

  const { posts, error, reload } = useNewsPosts();
  const content = useMemo(() => {
    const base = newsPageContent[locale].list;
    const years = base.years.map((year) => ({ ...year, items: [...year.items] }));
    [...posts].sort((a, b) => b.date.localeCompare(a.date)).reverse().forEach((post) => {
      const id = `yr${post.date.slice(0, 4)}`;
      let year = years.find((entry) => entry.id === id);
      if (!year) { year = { id, label: `YEAR ${post.date.slice(0, 4)}`, items: [] }; years.push(year); }
      const item: NewsListItem = {
        id: `cms-${post.id}`, kind: 'link', href: `${locale === 'zh-CN' ? '/zh' : ''}/news/posts/${post.slug}`,
        title: newsText(post.title, locale), titleFontSize: '33px',
        image: post.image || '/images/MC2_Icon.png', imageAlt: newsText(post.title, locale),
        meta: `${locale === 'zh-CN' ? '发布于：' : 'Published: '}${post.date}`,
        descriptions: [newsText(post.summary, locale) || newsText(post.body, locale).slice(0, 220)], source: ''
      };
      year.items.unshift(item);
    });
    return { ...base, years: years.sort((a, b) => b.id.localeCompare(a.id)) };
  }, [locale, posts]);
  return (
    <SitePageShell className={NEWS_SHELL_CLASS} ariaLabel={locale === 'zh-CN' ? '新闻' : 'News'} locale={locale} activeRoute='news'>
      <NewsListContent content={content} />
      {error && <button type='button' role='alert' className='fixed! bottom-4! left-4! z-50! rounded! bg-white! px-4! py-2! text-black!' onClick={reload}>{locale === 'zh-CN' ? '最新新闻暂未加载，点击重试' : 'Latest news unavailable — retry'}</button>}
    </SitePageShell>
  );
}
