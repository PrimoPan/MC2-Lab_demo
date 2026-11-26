import type { NewsLayout, NewsSection, NewsTemplate, NewsText } from '../types/newsPost';

export const emptyNewsText = (): NewsText => ({ en: '', 'zh-CN': '' });
export const newNewsSection = (layout: NewsLayout = 'text'): NewsSection => ({
  id: crypto.randomUUID(), layout, heading: emptyNewsText(), body: emptyNewsText(), images: [],
});

export const newsTemplates: { id: NewsTemplate; name: string; description: string; layouts: NewsLayout[] }[] = [
  { id: 'announcement', name: '新闻简报', description: '封面、导语与正文，适合公告和简讯。', layouts: ['text'] },
  { id: 'image-left', name: '左图右文', description: '图片与文字并排，适合研究成果与人物故事。', layouts: ['image-left', 'text'] },
  { id: 'image-right', name: '右图左文', description: '以文字开篇，搭配活动照片和补充说明。', layouts: ['image-right', 'text'] },
  { id: 'gallery', name: '活动图集', description: '导语加多图画廊，每张照片可配独立说明。', layouts: ['text', 'gallery'] },
];

// Applying a template creates only empty blocks; example copy never enters a saved post.
export const createNewsTemplateSections = (id: NewsTemplate): NewsSection[] =>
  (newsTemplates.find(template => template.id === id)?.layouts ?? ['text']).map(layout => newNewsSection(layout));
