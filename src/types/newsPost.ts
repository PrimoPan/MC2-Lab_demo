import type { Locale } from './common';

export interface NewsPost {
  id: string;
  slug: string;
  date: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  body: Record<Locale, string>;
  image: string;
  published: boolean;
}

export const newsText = (value: Record<Locale, string>, locale: Locale): string => value[locale] || value.en;
