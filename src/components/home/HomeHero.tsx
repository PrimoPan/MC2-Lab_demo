import React from 'react';
import { Link } from 'react-router-dom';
import { homeText } from '../../data/homePageContent';
import type { Locale } from '../../types/common';
import type { HomePanel } from '../../types/home';
import { runOnEnterOrSpace } from './homeKeyboard';

interface HomeHeroProps {
  isPanelOpen: boolean;
  locale: Locale;
  onOpenPanel: (panel: Exclude<HomePanel, null>) => void;
}

const HERO_SIDE_LABEL_CLASS = [
  'hover-target absolute! top-1/2! z-[2]! cursor-pointer! [transform:translateY(-50%)]! [writing-mode:vertical-lr]!',
  'text-[14px]! leading-[20px]! font-bold! tracking-[1px]! text-white! opacity-85! [transition:all_200ms_linear]!',
  "before:absolute! before:top-1/2! before:left-[-25px]! before:-z-[1]! before:-mt-[15px]! before:size-[30px]! before:content-['']!",
  "before:bg-[url('http://www.ivang-design.com/svg-load/portfolio/left.svg')]! before:bg-[length:30px_30px]! before:bg-center! before:bg-no-repeat!",
  'before:opacity-20! before:[transition:all_200ms_linear]! hover:before:left-[-30px]! hover:before:opacity-100!',
  'max-[980px]:top-auto! max-[980px]:bottom-[16px]! max-[980px]:transform-none!',
  'max-[980px]:[writing-mode:horizontal-tb]! max-[980px]:[border-radius:999px]! max-[980px]:border!',
  'max-[980px]:border-[rgba(188,217,255,0.22)]! max-[980px]:bg-[rgba(8,14,28,0.55)]!',
  'max-[980px]:px-[10px]! max-[980px]:py-[6px]! max-[980px]:text-[12px]!',
  'max-[980px]:tracking-[0.6px]! max-[980px]:backdrop-blur-[8px]! max-[980px]:before:hidden!'
].join(' ');

const HERO_CTA_CLASS = [
  'surreality-btn hover-target relative! inline-flex! min-h-[42px]! items-center! gap-[10px]!',
  'overflow-hidden! [border-radius:999px]! border! px-[16px]! py-0! box-border!',
  "[font-family:'Open_Sans','Noto_Sans',sans-serif]! text-[15px]! leading-none! font-semibold! tracking-[0.15px]!",
  'whitespace-nowrap! no-underline! select-none!',
  '[transition:transform_160ms_ease,box-shadow_160ms_ease,filter_160ms_ease,background_160ms_ease,border-color_160ms_ease]!',
  'before:hidden! before:content-none! after:hidden! after:content-none!',
  'hover:-translate-y-[2px]! hover:brightness-[1.03]! active:translate-y-0!',
  'focus:outline-none! focus:shadow-[0_0_0_3px_rgba(142,207,201,0.42),0_12px_26px_rgba(0,0,0,0.22)]!',
  'max-[640px]:min-h-[44px]! max-[640px]:w-full! max-[640px]:min-w-0! max-[640px]:max-w-full!',
  'max-[640px]:justify-center! max-[640px]:whitespace-normal! max-[640px]:px-[14px]! max-[640px]:py-[12px]!',
  'max-[640px]:text-center! max-[640px]:leading-[1.15]!',
  'max-[640px]:[&_span:not(.btn-arrow)]:min-w-0! max-[640px]:[&_span:not(.btn-arrow)]:[overflow-wrap:anywhere]!'
].join(' ');

export default function HomeHero({ isPanelOpen, locale, onOpenPanel }: HomeHeroProps): JSX.Element {
  const content = homeText[locale];

  return (
    <section className={`hero-section relative! block! h-screen! w-screen! origin-top! items-center! justify-center! overflow-hidden! bg-[url('/images/Website_Backdrop_1.jpg')]! bg-cover! bg-top! [box-shadow:0_0_40px_rgba(0,0,0,0.2)]! ${isPanelOpen ? '[transform:scale(0.75)_rotateX(0)]! [transition:all_300ms_linear_0ms]!' : '[transform:scale(1)_rotateX(0)]! [transition:all_300ms_linear_400ms]!'}`}>
      <div
        className={`about-text left-[14px]! ${HERO_SIDE_LABEL_CLASS}`}
        role='button'
        tabIndex={0}
        onClick={() => onOpenPanel('about')}
        onKeyDown={(event) => runOnEnterOrSpace(event, () => onOpenPanel('about'))}
      >
        About
      </div>
      <div
        className={`contact-text right-[14px]! [transform:translateY(-50%)_rotate(180deg)]! ${HERO_SIDE_LABEL_CLASS}`}
        role='button'
        tabIndex={0}
        onClick={() => onOpenPanel('contact')}
        onKeyDown={(event) => runOnEnterOrSpace(event, () => onOpenPanel('contact'))}
      >
        Contact
      </div>
      <div className='section-center absolute! top-1/2! left-0! z-[1]! w-full! [transform:translateY(-50%)]! px-[clamp(20px,4vw,60px)]! max-[980px]:px-[14px]!'>
        <div className='container-fluid'>
          <div className='row justify-content-center hero-main-row mx-auto! max-w-[min(1180px,95vw)]!'>
            <div className='col-12 px-0! text-center!'>
              <h1 className="m-[0_auto]! max-w-[min(980px,100%)]! font-['Open_Sans']! text-[4vw]! leading-[1.4]! font-black! text-white! max-[840px]:px-[.5rem]! max-[840px]:text-[clamp(1.5rem,7vw,2.2rem)]! max-[840px]:leading-[1.25]!">Center for Metaverse and Computational Creativity (MC<sup className='hero-brand-sup relative! top-[-0.18em]! ml-[0.02em]! align-super! text-[0.42em]! leading-[0]!'>2</sup>)</h1>
            </div>

            <div className='col-12 mt-4 px-0! text-center! mt-lg-5'>
              <div className='hero-cta-group mt-[16px]! inline-flex! max-w-[min(960px,100%)]! flex-wrap! items-center! justify-center! gap-[12px]! max-[980px]:max-w-[min(640px,94vw)]! max-[640px]:w-full! max-[640px]:max-w-full! max-[640px]:gap-[10px]!'>
                <Link className={`${HERO_CTA_CLASS} news-btn border-[rgba(152,210,255,0.45)]! bg-[rgba(8,15,32,0.52)]! text-[rgba(255,255,255,0.95)]! [box-shadow:0_10px_22px_rgba(2,8,20,0.25)]! backdrop-blur-[8px]!`} to='/news' aria-label={content.newsAria}>
                  <i className='fa-regular fa-newspaper btn-icon text-[14px]! opacity-95!' aria-hidden='true'></i>
                  <span>{content.newsLabel}</span>
                  <span className='btn-arrow [transform:translateY(-0.5px)]! text-[16px]! opacity-85!' aria-hidden='true'>→</span>
                </Link>

                <a
                  className={`${HERO_CTA_CLASS} film-btn border-[rgba(255,255,255,0.2)]! bg-[rgba(12,14,18,0.32)]! text-[rgba(255,255,255,0.92)]! [box-shadow:0_10px_24px_rgba(0,0,0,0.22)]!`}
                  href='https://youtu.be/yCSXbXoK8fg'
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='SURREALITY 1.0 Official Exhibition Film'
                >
                  <i className='fa-solid fa-circle-play btn-icon text-[14px]! opacity-95!' aria-hidden='true'></i>
                  <span>SURREALITY 1.0 Official Exhibition Film</span>
                  <span className='btn-arrow [transform:translateY(-0.5px)]! text-[16px]! opacity-85!' aria-hidden='true'>↗</span>
                </a>

                <Link className={`${HERO_CTA_CLASS} open-call-btn border-[rgba(255,255,255,0.24)]! bg-[linear-gradient(90deg,#ffcb93_0%,#9be0d7_100%)]! text-[#0f1828]! [box-shadow:0_12px_26px_rgba(0,0,0,0.22)]!`} to='/news?action=showModal' aria-label='SURREALITY 2.0 Open Call'>
                  <i className='fa-solid fa-rocket btn-icon text-[14px]! opacity-95!' aria-hidden='true'></i>
                  <span>SURREALITY 2.0 Open Call</span>
                  <span className='btn-arrow [transform:translateY(-0.5px)]! text-[16px]! opacity-85!' aria-hidden='true'>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
