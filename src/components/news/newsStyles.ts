const SYSTEM_FONT = "[font-family:-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol','Noto_Color_Emoji']!";

export const NEWS_SHELL_CLASS = [
  'news-page-shell static! m-0! h-screen! w-full! max-w-none! overflow-hidden! bg-[#1f2029]! [scroll-behavior:smooth]! [&_*]:[scroll-behavior:smooth]!',
  `${SYSTEM_FONT} text-[16px]! leading-[1.5]! font-normal! text-[#212529]!`
].join(' ');

export const NEWS_SECTION_CLASS = [
  'news-section static! z-[10]! block! h-screen! w-screen! overflow-x-hidden! overflow-y-auto!',
  'bg-[#1f2029]! px-0! py-[100px]! [transition:all_300ms_linear]!'
].join(' ');

export const NEWS_CONTAINER_CLASS = [
  'container mx-auto! w-full! px-[15px]!',
  'min-[576px]:max-w-[540px]! min-[768px]:max-w-[720px]! min-[992px]:max-w-[960px]! min-[1200px]:max-w-[1140px]!'
].join(' ');

export const NEWS_ROW_CLASS = 'row mr-[-15px]! mb-[0.5em]! ml-[-15px]! flex! flex-wrap! justify-center!';
export const NEWS_COL_12_CLASS = 'col-12 relative! min-h-px! w-full! max-w-full! basis-full! px-[15px]!';
export const NEWS_PAGE_HEADING_CLASS = 'mt-0! mb-[0.5rem]! text-[28px]! leading-[1.2]! font-medium! tracking-[1px]! text-white!';

export const NEWS_YEAR_NAV_CLASS = [
  'publication-nav static! top-auto! left-auto! z-[32]! mb-[0.8rem]! block! w-full! [transform:none]!',
  'rounded-[16px]! border-0! [border-style:none]! bg-transparent! p-0! [box-shadow:none]! [backdrop-filter:none]! [-webkit-backdrop-filter:none]!',
  'min-[721px]:mb-[1rem]! min-[1081px]:fixed! min-[1081px]:top-1/2! min-[1081px]:left-[clamp(8px,1.5vw,24px)]! min-[1081px]:z-[20]!',
  'min-[1081px]:m-0! min-[1081px]:w-[132px]! min-[1081px]:[transform:translateY(-50%)]!',
  'min-[1081px]:border! min-[1081px]:[border-style:solid]! min-[1081px]:border-[rgba(154,181,242,0.12)]! min-[1081px]:bg-[linear-gradient(180deg,rgba(14,20,34,0.62),rgba(14,20,34,0.28))]!',
  'min-[1081px]:p-[0.65rem]! min-[1081px]:[box-shadow:0_12px_24px_rgba(4,8,20,0.22)]! min-[1081px]:[backdrop-filter:blur(8px)]! min-[1081px]:[-webkit-backdrop-filter:blur(8px)]!'
].join(' ');

export const NEWS_YEAR_NAV_CONTAINER_CLASS = [
  'container m-0! block! w-full! px-[15px]!',
  'max-[1080px]:overflow-x-auto! max-[1080px]:overflow-y-hidden! max-[1080px]:[scrollbar-width:none]! max-[1080px]:[-ms-overflow-style:none]!'
].join(' ');

export const NEWS_YEAR_NAV_LIST_CLASS = [
  'yr__navs m-0! mb-[1rem]! flex! w-full! min-w-full! list-disc! flex-col! gap-[8px]! p-0! [grid-template-columns:repeat(2,minmax(0,1fr))]!'
].join(' ');

const NEWS_YEAR_NAV_ITEM_BASE_CLASS = [
  'yr__nav m-0! flex! min-h-[42px]! w-full! list-none! items-center! justify-center! rounded-[12px]! border! p-0!',
  'text-[0.98rem]! leading-[1.5]! font-[650]! text-white! [transition:background-color_180ms_ease,border-color_180ms_ease,color_180ms_ease]!',
  'max-[1080px]:min-h-[36px]! max-[1080px]:min-w-[68px]! max-[1080px]:shrink-0! max-[1080px]:rounded-[999px]!',
  'max-[720px]:min-w-[62px]!'
].join(' ');

export function newsYearNavItemClass(isActive: boolean): string {
  const state = isActive
    ? 'border-[rgba(166,197,255,0.34)]! bg-[rgba(122,150,214,0.16)]! max-[1080px]:border-[rgba(168,198,255,0.34)]! max-[1080px]:bg-[rgba(136,168,235,0.18)]!'
    : 'border-transparent! bg-transparent! max-[1080px]:border-[rgba(157,186,255,0.16)]! max-[1080px]:bg-[rgba(18,24,38,0.72)]!';
  return `${NEWS_YEAR_NAV_ITEM_BASE_CLASS} ${state}`;
}

export const NEWS_YEAR_NAV_LINK_CLASS = [
  'inline-flex! min-h-[42px]! w-full! items-center! justify-center! px-[10px]! py-0! font-bold! tracking-[0.01em]! text-inherit! no-underline!',
  '[transition:transform_0.3s_ease]!',
  'max-[1080px]:min-h-[36px]! max-[1080px]:px-[12px]! max-[1080px]:text-[0.84rem]! max-[1080px]:tracking-[0.02em]!',
  'max-[720px]:text-[0.82rem]!'
].join(' ');

export function newsYearNavLinkClass(isActive: boolean): string {
  return `${NEWS_YEAR_NAV_LINK_CLASS} ${isActive ? 'max-[1080px]:text-[#f3f8ff]!' : 'max-[1080px]:text-[#eaf2ff]!'}`;
}

export const NEWS_YEAR_SECTION_CLASS = 'news-year-section mt-[0.2rem]! block! w-full! [scroll-margin-top:90px]!';
export const NEWS_YEAR_TITLE_CLASS = 'news-year-title mt-0! mb-[0.5rem]! text-left! text-[28px]! leading-[1.2]! font-medium! tracking-[1px]! text-[#212529]!';

const NEWS_ITEM_WRAPPER_BASE_CLASS = [
  'col-12 relative! min-h-px! w-full! max-w-full! basis-full! px-[15px]!'
].join(' ');

export function newsItemWrapperClass(isSubsequent: boolean): string {
  if (!isSubsequent) return `${NEWS_ITEM_WRAPPER_BASE_CLASS} mt-[1rem]!`;
  return [
    NEWS_ITEM_WRAPPER_BASE_CLASS,
    'mt-[1rem]! pt-[18px]!',
    "before:absolute! before:top-0! before:right-[14px]! before:left-[14px]! before:h-px! before:content-['']!",
    'before:bg-[linear-gradient(90deg,rgba(142,207,201,0)_0%,rgba(142,207,201,0.45)_25%,rgba(255,190,122,0.45)_75%,rgba(255,190,122,0)_100%)]!'
  ].join(' ');
}

export const NEWS_CARD_CLASS = [
  'button-like m-0! block! w-full! cursor-pointer! border! border-[rgba(176,197,255,0.18)]! bg-transparent!',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.025)_100%)]! p-[14px]! text-left! text-[#212529]!',
  '[box-shadow:0_8px_22px_rgba(0,0,0,0.16)]! [transition:transform_180ms_ease,box-shadow_180ms_ease,border-color_180ms_ease,background-color_180ms_ease]!',
  'hover:[transform:translateY(-2px)]! hover:border-[rgba(142,207,201,0.42)]! hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]!',
  'hover:[box-shadow:0_12px_28px_rgba(0,0,0,0.24)]!'
].join(' ');

export const NEWS_CARD_LINK_CLASS = 'news-link-card rounded-[14px]! text-[#212529]! no-underline! hover:text-[#212529]! hover:no-underline!';
export const NEWS_MODAL_TRIGGER_CARD_CLASS = 'rounded-none! text-black!';
export const NEWS_CARD_ROW_CLASS = 'row news-row mr-[-15px]! mb-[0.5rem]! ml-[-15px]! flex! flex-wrap! items-start!';
export const NEWS_IMAGE_COLUMN_CLASS = 'news-left col-md-4 relative! min-h-px! w-full! px-[15px]! min-[768px]:max-w-1/3! min-[768px]:basis-1/3!';
export const NEWS_TEXT_COLUMN_CLASS = 'col-md-8 relative! min-h-px! w-full! px-[15px]! min-[768px]:max-w-2/3! min-[768px]:basis-2/3!';
export const NEWS_COVER_CLASS = 'news-cover-photo m-0! block! aspect-[16/9]! h-auto! w-full! rounded-[10px]! object-cover! [box-shadow:0_0_20px_rgba(0,0,0,0.4)]!';
export const NEWS_CARD_TITLE_BASE_CLASS = 'mt-0! mb-[0.5rem]! p-0! text-left! leading-[1.2]! font-medium! text-white!';
export const NEWS_META_CLASS = 'news-meta mt-0! mb-[1rem]! text-[17px]! leading-[1.5]! tracking-[0.2px]! text-white! opacity-95!';
export const NEWS_DESCRIPTION_CLASS = 'mt-0! mb-[1rem]! text-[16px]! leading-[1.5]! font-normal! text-white!';
export const NEWS_DESCRIPTION_LAST_CLASS = 'mt-0! mb-0! text-[16px]! leading-[1.5]! font-normal! text-white!';
export const NEWS_SOURCE_CLASS = 'news-source mt-0! mb-[1rem]! text-[14px]! leading-[1.5]! tracking-[0.2px]! text-[#8ecfc9]!';

export const NEWS_MODAL_CLASS = 'modal fixed! inset-0! z-[1050]! size-full! overflow-hidden! bg-[rgba(0,0,0,0.5)]!';
export const NEWS_MODAL_CONTENT_CLASS = [
  'modal-content relative! mx-auto! my-[7%]! flex! max-h-[80vh]! w-[70vw]! min-w-[min(100%,320px)]! flex-col! overflow-auto! scroll-smooth!',
  'rounded-[4.8px]! border! border-[rgba(0,0,0,0.2)]! bg-[#1f2029]! p-[20px]! text-white!',
  'max-[840px]:my-[8vh]! max-[840px]:w-[95vw]! max-[840px]:min-w-0! max-[840px]:p-[14px]!'
].join(' ');
export const NEWS_MODAL_CLOSE_CLASS = 'close m-0! block! cursor-pointer! p-0! text-[24px]! leading-[1]! font-bold! text-white! opacity-50! hover:text-white! focus:text-white!';
export const NEWS_MODAL_IMAGE_CLASS = 'img-fluid m-0! block! h-auto! w-full! max-w-full! rounded-none! [box-shadow:none]!';
export const NEWS_CTA_WRAP_CLASS = 'surreality-cta-wrap flex! flex-col! items-center! justify-center! gap-[10px]! px-0! pt-[22px]! pb-[6px]!';
export const NEWS_CTA_CLASS = [
  'surreality-cta inline-flex! items-center! gap-[12px]! rounded-[999px]! bg-[linear-gradient(90deg,#ffbe7a_0%,#8ecfc9_100%)]! px-[20px]! py-[14px]!',
  'text-[18px]! leading-none! font-bold! tracking-[0.2px]! text-[#007bff]! no-underline! [box-shadow:0_10px_30px_rgba(0,0,0,0.22)]!',
  '[transition:transform_160ms_ease,box-shadow_160ms_ease,filter_160ms_ease]! select-none!',
  'hover:[transform:translateY(-2px)]! hover:[box-shadow:0_14px_34px_rgba(0,0,0,0.28)]! hover:[filter:brightness(1.02)]!',
  'active:[transform:translateY(0)]! active:[box-shadow:0_10px_26px_rgba(0,0,0,0.22)]!',
  'focus:outline-none! focus:[box-shadow:0_0_0_3px_rgba(142,207,201,0.55),0_10px_30px_rgba(0,0,0,0.22)]!'
].join(' ');
export const NEWS_CTA_ICON_CLASS = 'cta-icon text-[20px]! leading-none! [transform:translateY(-1px)]!';
export const NEWS_CTA_ARROW_CLASS = 'cta-arrow text-[20px]! leading-none! opacity-90!';
export const NEWS_CTA_SUB_CLASS = 'surreality-cta-sub text-center! text-[13px]! leading-[1.5]! opacity-75!';

export const NEWS_ARTICLE_COLUMN_CLASS = 'col-lg-10 relative! mt-[1.5rem]! mb-[3rem]! min-h-px! w-full! px-[15px]! min-[992px]:max-w-10/12! min-[992px]:basis-10/12!';
export const NEWS_ARTICLE_CARD_CLASS = 'news-article-card rounded-[16px]! border! border-[rgba(255,255,255,0.12)]! bg-[rgba(255,255,255,0.06)]! px-[24px]! py-[26px]! text-[#f4f7fb]! max-[840px]:px-[16px]! max-[840px]:py-[18px]!';
export const NEWS_ARTICLE_TITLE_CLASS = 'article-title mt-0! mb-[0.5rem]! p-0! text-[32px]! leading-[1.2]! font-medium! text-white!';
export const NEWS_ARTICLE_META_CLASS = 'article-meta mt-0! mb-[1rem]! text-[17px]! leading-[1.78]! font-normal! text-[#c8d3df]! max-[840px]:text-[16px]!';
export const NEWS_ARTICLE_COVER_CLASS = [
  'article-cover mt-[30px]! mb-[18px]! block! h-auto! max-h-[420px]! w-full! rounded-[12px]! object-cover! [box-shadow:0_0_20px_rgba(0,0,0,0.4)]!',
  'max-[960px]:max-h-[340px]! max-[840px]:max-h-[280px]! max-[640px]:max-h-[220px]!'
].join(' ');
export const NEWS_ARTICLE_PARAGRAPH_CLASS = 'mt-0! mb-[1rem]! text-[17px]! leading-[1.78]! font-normal! text-[#f4f7fb]! max-[840px]:text-[16px]!';
export const NEWS_ARTICLE_HEADING_CLASS = 'mt-0! mb-[0.5rem]! p-0! text-[24px]! leading-[1.2]! font-medium! text-white!';
export const NEWS_ARTICLE_LIST_CLASS = 'article-list mt-0! mr-0! mb-[1rem]! ml-[20px]! list-disc! p-0!';
export const NEWS_ARTICLE_LIST_ITEM_CLASS = 'list-item! px-0! py-[3px]! text-[16px]! leading-[1.65]! text-[#f4f7fb]!';
export const NEWS_ARTICLE_LINKS_CLASS = 'article-links mt-[14px]! mb-[16px]! flex! flex-wrap! gap-x-[18px]! gap-y-[12px]!';
export const NEWS_ARTICLE_EXTERNAL_LINK_CLASS = 'block! text-[15px]! leading-[1.5]! text-[#8ecfc9]! underline!';
export const NEWS_ARTICLE_BACK_LINK_CLASS = 'back-news-link mt-[6px]! inline-block! text-[16px]! leading-[1.5]! font-bold! text-[#ffbe7a]! no-underline! hover:underline! max-[840px]:text-[15px]!';
