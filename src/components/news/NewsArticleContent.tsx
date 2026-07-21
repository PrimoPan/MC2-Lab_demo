import React from 'react';
import { Link } from 'react-router-dom';
import type { NewsArticleBlock, NewsArticleContent as NewsArticleContentType } from '../../types/legacyPages';
import InlineMc2Text from './InlineMc2Text';
import {
  NEWS_ARTICLE_BACK_LINK_CLASS,
  NEWS_ARTICLE_CARD_CLASS,
  NEWS_ARTICLE_COLUMN_CLASS,
  NEWS_ARTICLE_COVER_CLASS,
  NEWS_ARTICLE_EXTERNAL_LINK_CLASS,
  NEWS_ARTICLE_HEADING_CLASS,
  NEWS_ARTICLE_LINKS_CLASS,
  NEWS_ARTICLE_LIST_CLASS,
  NEWS_ARTICLE_LIST_ITEM_CLASS,
  NEWS_ARTICLE_META_CLASS,
  NEWS_ARTICLE_PARAGRAPH_CLASS,
  NEWS_ARTICLE_TITLE_CLASS,
  NEWS_COL_12_CLASS,
  NEWS_CONTAINER_CLASS,
  NEWS_PAGE_HEADING_CLASS,
  NEWS_ROW_CLASS,
  NEWS_SECTION_CLASS
} from './newsStyles';

interface NewsArticleContentProps {
  article: NewsArticleContentType;
}

function ArticleBlock({ block }: { block: NewsArticleBlock }): JSX.Element {
  if (block.type === 'heading') return <h4 className={NEWS_ARTICLE_HEADING_CLASS}><InlineMc2Text text={block.text} /></h4>;
  if (block.type === 'list') {
    return (
      <ul className={NEWS_ARTICLE_LIST_CLASS}>
        {block.items.map((item) => (
          <li className={NEWS_ARTICLE_LIST_ITEM_CLASS} key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className={NEWS_ARTICLE_PARAGRAPH_CLASS}><InlineMc2Text text={block.text} /></p>;
}

export default function NewsArticleContent({ article }: NewsArticleContentProps): JSX.Element {
  return (
    <>
      <div className={NEWS_SECTION_CLASS}>
        <div className={NEWS_CONTAINER_CLASS}>
          <div className={NEWS_ROW_CLASS}>
            <div className={`${NEWS_COL_12_CLASS} pt-[100px]! text-center! text-white!`}>
              <h3 className={NEWS_PAGE_HEADING_CLASS}>{article.pageHeading}</h3>
            </div>

            <div className={NEWS_ARTICLE_COLUMN_CLASS}>
              <article className={NEWS_ARTICLE_CARD_CLASS}>
                <h2 className={NEWS_ARTICLE_TITLE_CLASS}><InlineMc2Text text={article.title} /></h2>
                <p className={NEWS_ARTICLE_META_CLASS}><InlineMc2Text text={article.meta} /></p>
                <img className={NEWS_ARTICLE_COVER_CLASS} src={article.image} alt={article.imageAlt} />
                {article.blocks.map((block, index) => (
                  <ArticleBlock block={block} key={`${block.type}-${index}`} />
                ))}
                <div className={NEWS_ARTICLE_LINKS_CLASS}>
                  {article.links.map((link) => (
                    <a className={NEWS_ARTICLE_EXTERNAL_LINK_CLASS} href={link.href} key={link.href} target='_blank' rel='noopener noreferrer'>{link.label}</a>
                  ))}
                </div>
                <Link className={NEWS_ARTICLE_BACK_LINK_CLASS} to={article.backHref}>{article.backLabel}</Link>
              </article>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
