import type { Locale } from './common';

export type NewsText = Record<Locale, string>;
export type NewsTemplate = 'announcement' | 'image-left' | 'image-right' | 'gallery';
export type NewsLayout = 'text' | 'image-left' | 'image-right' | 'gallery';
export interface NewsImage { id: string; url: string; alt: NewsText; caption: NewsText }
export interface NewsSection {
  id: string;
  layout: NewsLayout;
  heading: NewsText;
  body: NewsText;
  images: NewsImage[];
}

export interface NewsPost {
  id: string;
  slug: string;
  date: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  body: Record<Locale, string>;
  image: string;
  published: boolean;
  template?: NewsTemplate;
  sections?: NewsSection[];
}

export const newsText = (value: Record<Locale, string>, locale: Locale): string => value[locale] || value.en;
