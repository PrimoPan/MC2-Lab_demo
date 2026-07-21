import React from 'react';
import { archivedPublicationYears } from '../../data/publications/archivedPublications';
import type { ArchivedPublication } from '../../types/publications';
import {
  ARCHIVED_AUTHOR_CLASS,
  ARCHIVED_CONFERENCE_CLASS,
  ARCHIVED_IMAGE_CLASS,
  ARCHIVED_TITLE_CLASS,
  PUBLICATION_BUTTON_CLASS,
  PUBLICATION_COL_4_CLASS,
  PUBLICATION_COL_8_CLASS,
  PUBLICATION_HEADING_CLASS,
  PUBLICATION_ROW_CLASS
} from './publicationStyles';

const FALLBACK_PHOTO = 'http://www.ivang-design.com/svg-load/portfolio/photo-p.jpg';

function useFallbackPhoto(event: React.SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget;
  if (image.src === FALLBACK_PHOTO) return;
  image.src = FALLBACK_PHOTO;
}

function PublicationColumns({ publication }: { publication: ArchivedPublication }): JSX.Element {
  return (
    <>
      <div className={PUBLICATION_COL_4_CLASS}>
        <img className={ARCHIVED_IMAGE_CLASS} src={publication.image} alt={publication.alt} onError={useFallbackPhoto} />
      </div>
      <div className={PUBLICATION_COL_8_CLASS}>
        <h4 className={ARCHIVED_TITLE_CLASS}>{publication.title}</h4>
        <p className={ARCHIVED_CONFERENCE_CLASS}>{publication.conference}</p>
        <p className={ARCHIVED_AUTHOR_CLASS}>{publication.authors}</p>
        <a href={publication.pdfHref} className={PUBLICATION_BUTTON_CLASS} target='_blank'>
          <i className='fa fa-file-pdf'></i>
          {' PDF'}
        </a>
        <a href={publication.videoHref} className={PUBLICATION_BUTTON_CLASS} target='_blank'>
          <i className='fa fa-video-camera'></i>
          {' Video'}
        </a>
        <a href={publication.doiHref} className={PUBLICATION_BUTTON_CLASS} target='_blank'>DOI</a>
      </div>
    </>
  );
}

function ArchivedPublicationItem({ publication }: { publication: ArchivedPublication }): JSX.Element {
  return (
    <div className={PUBLICATION_ROW_CLASS}>
      {publication.nestedRow ? (
        <div className={PUBLICATION_ROW_CLASS}>
          <PublicationColumns publication={publication} />
        </div>
      ) : (
        <PublicationColumns publication={publication} />
      )}
    </div>
  );
}

export default function ArchivedPublicationSections(): JSX.Element {
  return (
    <>
      {archivedPublicationYears.map(({ publications, year }) => (
        <section className='block! w-full!' id={`yr${year}`} key={year}>
          <div className='col-12 text-center'>
            <h3 className={PUBLICATION_HEADING_CLASS}>{year}</h3>
          </div>
          {publications.map((publication) => (
            <ArchivedPublicationItem publication={publication} key={`${publication.title}-${publication.conference}`} />
          ))}
        </section>
      ))}
    </>
  );
}
