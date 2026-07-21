import React from 'react';
import { archivedPublicationYears } from '../../data/publications/archivedPublications';
import type { ArchivedPublication } from '../../types/publications';

const FALLBACK_PHOTO = 'http://www.ivang-design.com/svg-load/portfolio/photo-p.jpg';

function useFallbackPhoto(event: React.SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget;
  if (image.src === FALLBACK_PHOTO) return;
  image.src = FALLBACK_PHOTO;
}

function PublicationColumns({ publication }: { publication: ArchivedPublication }): JSX.Element {
  return (
    <>
      <div className='col-md-4'>
        <img src={publication.image} alt={publication.alt} onError={useFallbackPhoto} />
      </div>
      <div className='col-md-8'>
        <h4>{publication.title}</h4>
        <p className='conference'>{publication.conference}</p>
        <p className='author'>{publication.authors}</p>
        <a href={publication.pdfHref} className='publication-btn' target='_blank'>
          <i className='fa fa-file-pdf'></i>
          {' PDF'}
        </a>
        <a href={publication.videoHref} className='publication-btn' target='_blank'>
          <i className='fa fa-video-camera'></i>
          {' Video'}
        </a>
        <a href={publication.doiHref} className='publication-btn' target='_blank'>DOI</a>
      </div>
    </>
  );
}

function ArchivedPublicationItem({ publication }: { publication: ArchivedPublication }): JSX.Element {
  return (
    <div className='row'>
      {publication.nestedRow ? (
        <div className='row'>
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
        <section id={`yr${year}`} key={year}>
          <div className='col-12 text-center'>
            <h3>{year}</h3>
          </div>
          {publications.map((publication) => (
            <ArchivedPublicationItem publication={publication} key={`${publication.title}-${publication.conference}`} />
          ))}
        </section>
      ))}
    </>
  );
}
