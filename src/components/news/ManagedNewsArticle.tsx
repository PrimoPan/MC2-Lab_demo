import React from 'react';
import type { Locale } from '../../types/common';
import { newsText, type NewsPost, type NewsSection } from '../../types/newsPost';
import './managedNewsArticle.css';

function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</>;
}

function Section({ section, locale }: { section: NewsSection; locale: Locale }) {
  const heading = newsText(section.heading, locale);
  const images = section.layout !== 'text' && <div className='managed-news-images'>
    {section.images.filter(image => image.url).map(image => <figure key={image.id}>
      <img src={image.url} alt={newsText(image.alt, locale)} loading='lazy' />
      {newsText(image.caption, locale) && <figcaption>{newsText(image.caption, locale)}</figcaption>}
    </figure>)}
  </div>;
  const copy = <div className='managed-news-copy'>{heading && <h2>{heading}</h2>}<Paragraphs text={newsText(section.body, locale)} /></div>;
  return <section className={`managed-news-block managed-news-${section.layout}`}>
    {section.layout === 'image-left' ? <>{images}{copy}</> : <>{copy}{images}</>}
  </section>;
}

/** Both the live page and private preview use exactly this article renderer. */
export default function ManagedNewsArticle({ post, locale, preview = false }: { post: NewsPost; locale: Locale; preview?: boolean }) {
  const zh = locale === 'zh-CN';
  return <div className='managed-news-frame'>
    <article className='managed-news-article' lang={zh ? 'zh-CN' : 'en'}>
      <header>
        <p className='managed-news-kicker'>MC² · {zh ? '新闻' : 'News'}</p>
        <h1>{newsText(post.title, locale) || (zh ? '未命名新闻' : 'Untitled news')}</h1>
        <p className='managed-news-date'>{post.date}</p>
        {newsText(post.summary, locale) && <p className='managed-news-summary'>{newsText(post.summary, locale)}</p>}
        {post.image && <img className='managed-news-cover' src={post.image} alt={newsText(post.title, locale)} />}
      </header>
      {newsText(post.body, locale) && <div className='managed-news-body'><Paragraphs text={newsText(post.body, locale)} /></div>}
      {(post.sections ?? []).map(section => <Section key={section.id} section={section} locale={locale} />)}
      <footer>{preview ? <span>{zh ? '草稿预览 · 修改须经审核后发布' : 'Draft preview · Changes require approval before publication'}</span> : <a href={`${zh ? '/zh' : ''}/news`}>← {zh ? '返回新闻' : 'Back to news'}</a>}</footer>
    </article>
  </div>;
}
