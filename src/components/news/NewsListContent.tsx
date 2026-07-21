import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSectionScrollSpy } from '../../hooks/useSectionScrollSpy';
import type { NewsListContent as NewsListContentType, NewsListItem, NewsModalContent } from '../../types/legacyPages';
import InlineMc2Text from './InlineMc2Text';
import {
  NEWS_CARD_CLASS,
  NEWS_CARD_LINK_CLASS,
  NEWS_CARD_ROW_CLASS,
  NEWS_CARD_TITLE_BASE_CLASS,
  NEWS_COL_12_CLASS,
  NEWS_CONTAINER_CLASS,
  NEWS_COVER_CLASS,
  NEWS_CTA_ARROW_CLASS,
  NEWS_CTA_CLASS,
  NEWS_CTA_ICON_CLASS,
  NEWS_CTA_SUB_CLASS,
  NEWS_CTA_WRAP_CLASS,
  NEWS_DESCRIPTION_CLASS,
  NEWS_DESCRIPTION_LAST_CLASS,
  NEWS_IMAGE_COLUMN_CLASS,
  NEWS_META_CLASS,
  NEWS_MODAL_CLASS,
  NEWS_MODAL_CLOSE_CLASS,
  NEWS_MODAL_CONTENT_CLASS,
  NEWS_MODAL_IMAGE_CLASS,
  NEWS_MODAL_TRIGGER_CARD_CLASS,
  NEWS_PAGE_HEADING_CLASS,
  NEWS_ROW_CLASS,
  NEWS_SECTION_CLASS,
  NEWS_SOURCE_CLASS,
  NEWS_TEXT_COLUMN_CLASS,
  NEWS_YEAR_NAV_CLASS,
  NEWS_YEAR_NAV_CONTAINER_CLASS,
  NEWS_YEAR_NAV_LIST_CLASS,
  NEWS_YEAR_SECTION_CLASS,
  NEWS_YEAR_TITLE_CLASS,
  newsItemWrapperClass,
  newsYearNavLinkClass,
  newsYearNavItemClass
} from './newsStyles';

interface NewsListContentProps {
  content: NewsListContentType;
}

function NewsCard({ item, onOpenModal }: { item: NewsListItem; onOpenModal: () => void }): JSX.Element {
  const metaSeparatorIndex = (() => {
    const asciiIndex = item.meta.indexOf(':');
    const fullWidthIndex = item.meta.indexOf('：');
    if (asciiIndex === -1) return fullWidthIndex;
    if (fullWidthIndex === -1) return asciiIndex;
    return Math.min(asciiIndex, fullWidthIndex);
  })();
  const metaPrefix = metaSeparatorIndex >= 0 ? item.meta.slice(0, metaSeparatorIndex + 1) : item.meta;
  const metaSuffix = metaSeparatorIndex >= 0 ? item.meta.slice(metaSeparatorIndex + 1).trim() : '';
  const metaJoiner = item.meta.includes('：') ? '' : ' ';
  const cardInner = (
    <div className={NEWS_CARD_ROW_CLASS}>
      <div className={NEWS_IMAGE_COLUMN_CLASS}>
        <img
          className={NEWS_COVER_CLASS}
          src={item.image}
          alt={item.imageAlt}
          onError={(event) => { event.currentTarget.src = 'http://www.ivang-design.com/svg-load/portfolio/photo-p.jpg'; }}
        />
      </div>

      <div className={NEWS_TEXT_COLUMN_CLASS}>
        <h4 className={`${NEWS_CARD_TITLE_BASE_CLASS} ${item.titleFontSize === '36px' ? 'text-[36px]!' : 'text-[33px]!'}`}>
          <strong><InlineMc2Text text={item.title} /></strong>
        </h4>
        <p className={NEWS_META_CLASS}><strong>{metaPrefix}</strong>{metaSuffix ? `${metaJoiner}${metaSuffix}` : ''}</p>
        {item.descriptions.map((description, index) => (
          <p className={index === item.descriptions.length - 1 && !item.source ? NEWS_DESCRIPTION_LAST_CLASS : NEWS_DESCRIPTION_CLASS} key={description}>
            {description}
          </p>
        ))}
        {item.source ? <p className={NEWS_SOURCE_CLASS}>{item.source}</p> : null}
      </div>
    </div>
  );

  if (item.kind === 'modal') {
    return (
      <button className={`${NEWS_CARD_CLASS} ${NEWS_MODAL_TRIGGER_CARD_CLASS}`} type='button' onClick={onOpenModal}>
        {cardInner}
      </button>
    );
  }

  return (
    <Link className={`${NEWS_CARD_CLASS} ${NEWS_CARD_LINK_CLASS}`} to={item.href} aria-label={`Open ${item.title}`}>
      {cardInner}
    </Link>
  );
}

function SurrealityModal({ content, isOpen, onClose }: { content: NewsModalContent; isOpen: boolean; onClose: () => void }): JSX.Element {
  if (!isOpen) return <div id='myModal' className={`${NEWS_MODAL_CLASS} hidden!`}></div>;

  return (
    <div id='myModal' className={`${NEWS_MODAL_CLASS} block!`} onClick={onClose}>
      <div className={NEWS_MODAL_CONTENT_CLASS} onClick={(event) => event.stopPropagation()}>
        <span className={NEWS_MODAL_CLOSE_CLASS} role='button' tabIndex={0} onClick={onClose} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onClose(); }}>&times;</span>
        <br /><br />
        <img
          className={NEWS_MODAL_IMAGE_CLASS}
          src={content.poster}
          srcSet={content.srcSet}
          sizes={content.sizes}
          alt={content.posterAlt}
          onError={(event) => {
            event.currentTarget.removeAttribute('srcset');
            event.currentTarget.removeAttribute('sizes');
            event.currentTarget.src = 'http://www.ivang-design.com/svg-load/portfolio/photo-p.jpg';
          }}
        />

        <div className={NEWS_CTA_WRAP_CLASS}>
          <a className={NEWS_CTA_CLASS} href={content.submitHref} target='_blank' rel='noopener noreferrer' aria-label={content.submitAria}>
            <span className={NEWS_CTA_ICON_CLASS} aria-hidden='true'>🚀</span>
            <span className='cta-text'>{content.submitText}</span>
            <span className={NEWS_CTA_ARROW_CLASS} aria-hidden='true'>→</span>
          </a>
          <div className={NEWS_CTA_SUB_CLASS}>{content.helperText}</div>
        </div>
      </div>
    </div>
  );
}

export default function NewsListContent({ content }: NewsListContentProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { search } = useLocation();
  const [activeYearId, setActiveYearId] = useState(content.years[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const yearIds = useMemo(() => content.years.map((year) => year.id), [content.years]);

  useSectionScrollSpy(scrollRef, yearIds, setActiveYearId);

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get('action') === 'showModal') {
      setIsModalOpen(true);
      navigate(window.location.pathname, { replace: true });
    }
  }, [navigate, search]);

  const selectYear = useCallback((yearId: string) => {
    setActiveYearId(yearId);
    const scrollContainer = scrollRef.current;
    const section = scrollContainer?.querySelector<HTMLElement>(`#${yearId}`);
    if (!scrollContainer || !section) return;
    const containerRect = scrollContainer.getBoundingClientRect();
    const sectionTop = section.getBoundingClientRect().top - containerRect.top + scrollContainer.scrollTop;
    scrollContainer.scrollTo({ top: Math.max(0, sectionTop - 20), behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className={NEWS_SECTION_CLASS} ref={scrollRef}>
        <div className={NEWS_CONTAINER_CLASS}>
          <div className={NEWS_ROW_CLASS}>
            <div className={`${NEWS_COL_12_CLASS} pt-[100px]! text-center! text-white!`}>
              <h3 className={NEWS_PAGE_HEADING_CLASS}>{content.pageHeading}</h3>
            </div>

            <div className={NEWS_YEAR_NAV_CLASS}>
              <div className={NEWS_YEAR_NAV_CONTAINER_CLASS}>
                <ul className={NEWS_YEAR_NAV_LIST_CLASS}>
                  {content.years.map((year) => (
                    <li className={`${newsYearNavItemClass(activeYearId === year.id)} ${year.id} ${activeYearId === year.id ? 'active' : ''}`} key={year.id}>
                      <a className={newsYearNavLinkClass(activeYearId === year.id)} href={`#${year.id}`} onClick={(event) => { event.preventDefault(); selectYear(year.id); }}>{year.label.replace('YEAR ', '')}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {content.years.map((year) => (
              <section className={NEWS_YEAR_SECTION_CLASS} id={year.id} key={year.id}>
                <div className={NEWS_COL_12_CLASS}>
                  <h3 className={NEWS_YEAR_TITLE_CLASS}>{year.label}</h3>
                </div>
                {year.items.map((item, index) => (
                  <div className={newsItemWrapperClass(index > 0)} key={item.id}>
                    <NewsCard item={item} onOpenModal={() => setIsModalOpen(true)} />
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
      <SurrealityModal content={content.modal} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
