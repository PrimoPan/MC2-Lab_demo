import React from 'react';
import { Link, useParams } from 'react-router-dom';
import SitePageShell from '../components/SitePageShell';
import NewsArticleContent from '../components/news/NewsArticleContent';
import { NEWS_SHELL_CLASS } from '../components/news/newsStyles';
import { useNewsPosts } from '../hooks/useNewsPosts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { newsText } from '../types/newsPost';
import type { Locale } from '../types/common';

export default function NewsPostPage({ locale = 'en' }: { locale?: Locale }): JSX.Element {
  const { slug } = useParams();
  const { posts, loading, error, reload } = useNewsPosts();
  const post = posts.find((entry) => entry.slug === slug);
  const zh = locale === 'zh-CN';
  useDocumentTitle(post ? `${newsText(post.title, locale)} | MC2` : 'News | MC2');
  const prefix = zh ? '/zh' : '';
  return (
    <SitePageShell className={NEWS_SHELL_CLASS} ariaLabel={zh ? '新闻' : 'News'} locale={locale} activeRoute='news' alternateHref={`${zh ? '' : '/zh'}/news/posts/${slug}`}>
      {post ? <NewsArticleContent article={{
        pageHeading: zh ? '新闻' : 'News', title: newsText(post.title, locale),
        meta: `${zh ? '发布于：' : 'Published: '}${post.date}`, image: post.image,
        imageAlt: newsText(post.title, locale),
        blocks: newsText(post.body, locale).split(/\n\s*\n/).filter(Boolean).map((text) => ({ type: 'paragraph', text })),
        links: [], backHref: `${prefix}/news`, backLabel: zh ? '返回新闻' : 'Back to news'
      }} /> : (
        <div className='px-8! pt-40! text-center! text-white!' role={error ? 'alert' : 'status'}>
          <p>{loading ? (zh ? '正在加载…' : 'Loading…') : error ? (zh ? '暂时无法读取文章。' : 'This article is temporarily unavailable.') : (zh ? '文章不存在或尚未发布。' : 'This article is unavailable or has not been published.')}</p>
          {error && <button type='button' className='m-4! rounded! border! px-5! py-2!' onClick={reload}>{zh ? '重试' : 'Try again'}</button>}
          <Link className='block! p-4! text-white! underline!' to={`${prefix}/news`}>{zh ? '返回新闻' : 'Back to news'}</Link>
        </div>
      )}
    </SitePageShell>
  );
}
