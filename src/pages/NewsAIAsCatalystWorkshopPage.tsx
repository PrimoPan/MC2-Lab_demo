import { useRef } from 'react';
import ChineseWorkshopArticle from '../components/workshop/ChineseWorkshopArticle';
import EnglishWorkshopArticle from '../components/workshop/EnglishWorkshopArticle';
import { workshopClass } from '../components/workshop/workshopStyles';
import SitePageShell from '../components/SitePageShell';
import { useWorkshopSpeakerCards } from '../hooks/useWorkshopSpeakerCards';
import type { Locale } from '../types/common';

interface NewsAIAsCatalystWorkshopPageProps {
  locale?: Locale;
}

export default function NewsAIAsCatalystWorkshopPage({ locale = 'en' }: NewsAIAsCatalystWorkshopPageProps): JSX.Element {
  const pageRef = useRef<HTMLElement>(null);
  useWorkshopSpeakerCards(pageRef);
  const isZh = locale === 'zh-CN';
  const alternateHref = isZh ? '/news/ai-as-catalyst-workshop' : '/zh/news/ai-as-catalyst-workshop';

  return (
    <SitePageShell className={workshopClass('workshop-page-shell')} ariaLabel={isZh ? 'AI as Catalyst 工作坊' : 'AI as Catalyst Workshop'} locale={locale} activeRoute='news' alternateHref={alternateHref} navControlVariant='default' ref={pageRef}>
      {isZh ? <ChineseWorkshopArticle /> : <EnglishWorkshopArticle />}
    </SitePageShell>
  );
}
