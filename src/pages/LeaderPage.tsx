import React, { useEffect } from 'react';
import SitePageShell from '../components/SitePageShell';
import type { Locale } from '../types/common';
import type { LeaderContent } from '../types/legacyPages';
import defaultLeader from '../data/leaderContent.json';
import { usePeopleData } from '../hooks/usePeopleData';

interface LeaderPageProps {
  locale?: Locale;
}



function useLeaderPageBodyClass(): void {
  useEffect(() => {
    document.body.classList.add('bg-[#1f2234]!');
    return () => document.body.classList.remove('bg-[#1f2234]!');
  }, []);
}

const LEADER_SHELL_CLASS = [
  'leader-page-shell fixed! inset-0! m-0! overflow-x-hidden! overflow-y-auto! p-0!',
  'bg-[radial-gradient(circle_at_top,#232842_0%,#1f2234_45%,#1a1d2e_100%)]!',
  "[font-family:'Open_Sans','Noto_Sans',sans-serif]! text-[15px]! leading-[1.6]! font-light! text-[#eef1f7]! [&_*]:box-border [&_*::before]:box-border [&_*::after]:box-border"
].join(' ');

const LEADER_SECTION_TEXT_CLASS = 'text-[1.03rem]! leading-[1.8]! text-[#d8dbe3]! max-[640px]:text-[0.97rem]!';

export function LeaderContentView({ content }: { content: LeaderContent }): JSX.Element {
  return (
      <div className='leader-wrap m-[106px_auto_60px]! max-w-[1100px]! px-[20px]! py-0! [.leader-page-shell_&]:box-content! text-[#eef1f7]! max-[980px]:mt-[22px]! max-[980px]:w-full! max-[980px]:max-w-none! max-[980px]:px-[14px]! max-[980px]:[.leader-page-shell_&]:box-border!'>
        <section className='leader-card grid! grid-cols-[280px_1fr]! items-[initial]! justify-[initial]! gap-[30px]! rounded-[18px]! border! border-[rgba(255,255,255,0.16)]! bg-[rgba(255,255,255,0.05)]! p-[24px]! max-[980px]:grid-cols-1! max-[640px]:gap-[16px]! max-[640px]:p-[16px]!'>
          <img className='w-full! rounded-[12px]! object-cover!' src={content.photo} alt={content.profileAlt} />
          <div>
            <h1 className='leader-title m-[0_0_10px]! text-[clamp(1.9rem,3.3vw,2.45rem)]! leading-[1.2]!'>{content.title}</h1>
            <p className='leader-subtitle m-[0_0_14px]! text-[1.05rem]! text-[#b7becf]!'>{content.subtitle}</p>
            <p className='leader-meta m-[10px_0_16px]! leading-[1.75]! text-[#d6dced]!'>{content.meta}</p>
            <a className='leader-homepage inline-block! border-b! border-[rgba(255,255,255,0.5)]! font-bold! text-white! no-underline! [transition:transform_300ms]!' href={content.homepage} target='_blank' rel='noopener noreferrer'>{content.homepageLabel}</a>
          </div>
        </section>

        <section className='leader-section mx-auto! block! max-w-[980px]! items-center! justify-center!'>
          {content.sections.map((section) => (
            <React.Fragment key={section.title}>
              <h3 className='mt-[40px]! mb-[14px]! text-[clamp(1.32rem,1.9vw,1.52rem)]! leading-[1.2]! max-[640px]:text-[1.2rem]!'>{section.title}</h3>
              {section.paragraphs.map((paragraph) => <p className={LEADER_SECTION_TEXT_CLASS} key={paragraph}>{paragraph}</p>)}
            </React.Fragment>
          ))}

          <h3 className='mt-[40px]! mb-[14px]! text-[clamp(1.32rem,1.9vw,1.52rem)]! leading-[1.2]! max-[640px]:text-[1.2rem]!'>{content.projectsTitle}</h3>
          <ul className='leader-projects m-[18px_0_0]! grid! list-none! gap-[14px]! pl-0!'>
            {content.projects.map((project) => (
              <li className={`${LEADER_SECTION_TEXT_CLASS} rounded-[0_16px_16px_0]! border-l-[3px]! border-[rgba(142,207,201,0.62)]! bg-[linear-gradient(90deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))]! p-[16px_18px_18px_20px]! max-[640px]:p-[14px_14px_15px_16px]!`} key={project.title}>
                <strong className='mb-[4px]! block! text-[1.05rem]! tracking-[0.01em]! text-[#f4f7ff]!'>{project.title}</strong>
                <span className='block!'>{project.body}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
  );
}

export default function LeaderPage({ locale = 'en' }: LeaderPageProps): JSX.Element {
  useLeaderPageBodyClass();
  const { content: people, error, reload } = usePeopleData();
  const content = people?.[locale].leader ?? defaultLeader[locale];
  useEffect(() => { document.title = content.documentTitle; }, [content.documentTitle]);
  return <SitePageShell className={LEADER_SHELL_CLASS} ariaLabel={content.pageLabel} locale={locale} activeRoute='leader'>
    {people ? <LeaderContentView content={content} /> : <div className='px-8! pt-40! text-center! text-white!' role={error ? 'alert' : 'status'}>
      <p>{error ? (locale === 'zh-CN' ? '暂时无法读取负责人资料。' : 'Director information is temporarily unavailable.') : (locale === 'zh-CN' ? '正在加载…' : 'Loading…')}</p>
      {error && <button type='button' onClick={reload}>{locale === 'zh-CN' ? '重试' : 'Try again'}</button>}
    </div>}
  </SitePageShell>;
}
