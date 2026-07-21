import type { SyntheticEvent } from 'react';

const FALLBACK_PHOTO = 'http://www.ivang-design.com/svg-load/portfolio/photo-p.jpg';

export function hideOrganizerBrandImage(event: SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget;
  image.style.display = 'none';
  image.closest('.organizer-brand')?.classList.add('organizer-brand--text-only');
}

export function hideAffiliationTileImage(event: SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget;
  image.style.display = 'none';
  image.closest('.affiliation-tile')?.classList.add('affiliation-tile--text-only');
}

export function useFallbackPhoto(event: SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget;
  if (image.src === FALLBACK_PHOTO) return;
  image.src = FALLBACK_PHOTO;
}
