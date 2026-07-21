export const PUBLICATION_SHELL_CLASS = [
  "publication-page-shell m-0! w-full! text-left! [font-family:-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,'Noto_Sans',sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol','Noto_Color_Emoji']! text-base! leading-[1.5]! font-normal! text-white!",
  '[&_*]:box-border [&_*::before]:box-border [&_*::after]:box-border',
].join(' ');

export const PUBLICATION_SECTION_CLASS = [
  'publication-section fixed! top-0! left-0! z-[10]! block! h-screen! w-screen! overflow-x-hidden! overflow-y-auto!',
  'bg-[rgba(31,32,41,1)]! px-0! py-[100px]! transition-all! duration-300!',
  '[scroll-behavior:smooth]!'
].join(' ');

export const PUBLICATION_HEADING_CLASS = 'mt-0! mb-[0.5rem]! text-[44px]! leading-[1.3]! font-bold! tracking-[1px]! text-white!';

export const PUBLICATION_CONTAINER_CLASS = [
  'container mx-auto! w-full! px-[15px]!',
  'min-[576px]:max-w-[540px]! min-[768px]:max-w-[720px]! min-[992px]:max-w-[960px]! min-[1200px]:max-w-[1140px]!'
].join(' ');

export const PUBLICATION_ROW_CLASS = 'row mb-[0.5em]! flex! flex-wrap! mr-[-15px]! ml-[-15px]!';
export const PUBLICATION_CENTERED_ROW_CLASS = `${PUBLICATION_ROW_CLASS} justify-center!`;
export const PUBLICATION_COL_12_CLASS = 'col-12 relative! min-h-px! w-full! max-w-full! basis-full! px-[15px]!';
export const PUBLICATION_COL_4_CLASS = 'col-md-4 relative! min-h-px! w-full! px-[15px]! min-[768px]:max-w-1/3! min-[768px]:basis-1/3!';
export const PUBLICATION_COL_8_CLASS = 'col-md-8 relative! min-h-px! w-full! px-[15px]! min-[768px]:max-w-2/3! min-[768px]:basis-2/3!';

export const YEAR_NAV_CLASS = [
  'publication-nav fixed! top-1/2! left-[clamp(8px,1.5vw,24px)]! z-[20]! w-[144px]! [transform:translateY(-50%)]!',
  'rounded-[16px]! border! border-[rgba(154,181,242,0.12)]! bg-[linear-gradient(180deg,rgba(14,20,34,0.62),rgba(14,20,34,0.28))]!',
  'p-[0.65rem]! [box-shadow:0_12px_24px_rgba(4,8,20,0.22)]! [backdrop-filter:blur(8px)]! [-webkit-backdrop-filter:blur(8px)]!',
  'max-[1080px]:sticky! max-[1080px]:top-[74px]! max-[1080px]:left-auto! max-[1080px]:z-[32]! max-[1080px]:mb-[1rem]! max-[1080px]:h-auto! max-[1080px]:w-full! max-[1080px]:transform-none!',
  'max-[1080px]:border-0! max-[1080px]:[border-style:none]! max-[1080px]:[background:transparent]! max-[1080px]:p-0! max-[1080px]:[box-shadow:none]! max-[1080px]:backdrop-blur-none!',
  'max-[720px]:static! max-[720px]:top-auto! max-[720px]:z-auto!'
].join(' ');

export const YEAR_NAV_CONTAINER_CLASS = [
  'container m-0! block! w-full! p-0!',
  'max-[1080px]:overflow-x-auto! max-[1080px]:overflow-y-hidden! max-[1080px]:px-[2px]! max-[1080px]:[scrollbar-width:none]!',
  'max-[1080px]:[&::-webkit-scrollbar]:hidden! max-[720px]:pr-[10px]!'
].join(' ');

export const YEAR_NAV_LIST_CLASS = [
  'yr__navs m-0! flex! list-none! flex-col! gap-[8px]! p-0!',
  'max-[1080px]:w-full! max-[1080px]:min-w-full! max-[1080px]:flex-col! max-[1080px]:flex-nowrap!'
].join(' ');

export const YEAR_NAV_ITEM_CLASS = [
  'yr__nav m-0! flex! min-h-[42px]! items-center! justify-center! rounded-[12px]! border! border-transparent!',
  'bg-transparent! p-0! text-[0.98rem]! font-[650]! text-white!',
  '[transition:background-color_180ms_ease,border-color_180ms_ease,color_180ms_ease]!',
  'hover:border-[rgba(162,188,242,0.22)]! hover:bg-[rgba(120,145,198,0.13)]!',
  '[&.active]:border-[rgba(166,197,255,0.34)]! [&.active]:bg-[rgba(122,150,214,0.16)]! [&.active]:text-white!',
  'max-[1080px]:min-h-[36px]! max-[1080px]:min-w-[68px]! max-[1080px]:rounded-[999px]!',
  'max-[1080px]:shrink-0! max-[1080px]:border-[rgba(157,186,255,0.16)]! max-[1080px]:bg-[rgba(18,24,38,0.72)]! max-[1080px]:[box-shadow:none]!',
  'max-[1080px]:[backdrop-filter:blur(8px)]! max-[1080px]:[-webkit-backdrop-filter:blur(8px)]!',
  'max-[1080px]:[&.active]:border-[rgba(168,198,255,0.34)]! max-[1080px]:[&.active]:bg-[rgba(136,168,235,0.18)]! max-[1080px]:[&.active]:[box-shadow:none]!',
  'max-[720px]:min-w-[62px]!'
].join(' ');

export const YEAR_NAV_ACTIVE_CLASS = [
  'text-white!'
].join(' ');

export const YEAR_NAV_ACTIVE_LINK_CLASS = 'max-[1080px]:text-[#f3f8ff]!';

export const YEAR_NAV_LINK_CLASS = [
  'inline-flex! min-h-[42px]! w-full! items-center! justify-center! px-[10px]! py-0!',
  'font-bold! tracking-[0.01em]! text-inherit! no-underline! [transition:transform_300ms]!',
  'max-[1080px]:min-h-[36px]! max-[1080px]:px-[12px]! max-[1080px]:text-[0.84rem]! max-[1080px]:tracking-[0.02em]! max-[1080px]:text-[#eaf2ff]!',
  'max-[720px]:text-[0.82rem]!'
].join(' ');

export const PUBLICATION_AUTHOR_LINK_CLASS = [
  'publication-author-link inline! font-[inherit]! text-[inherit]! leading-[inherit]! font-bold! tracking-normal! text-inherit!',
  'underline! decoration-[1px]! underline-offset-[3px]! [transition:color_160ms_ease,text-decoration-color_160ms_ease]!',
  'hover:text-[#9cf9cf]! hover:decoration-[#9cf9cf]! focus-visible:text-[#9cf9cf]! focus-visible:decoration-[#9cf9cf]!'
].join(' ');

export const ARCHIVED_IMAGE_CLASS = 'mt-[30px]! block! h-auto! w-full! rounded-[4px]! shadow-[0_0_20px_rgba(0,0,0,0.4)]!';
export const ARCHIVED_TITLE_CLASS = 'm-[0.67em_0]! pt-[30px]! text-left! font-bold! text-white!';
export const ARCHIVED_CONFERENCE_CLASS = 'conference m-[0.67em_0]! text-left! text-[20px]! font-bold! text-[#866BAF]!';
export const ARCHIVED_AUTHOR_CLASS = 'author m-[0.67em_0]! text-left! text-white!';
export const PUBLICATION_BUTTON_CLASS = [
  'publication-btn mx-[5px]! float-left! cursor-pointer! rounded-[10px]! border! border-[rgba(255,255,255,0.555)]!',
  'bg-[rgba(31,32,41,1)]! px-[16px]! py-[2px]! text-[16px]! text-[rgba(255,255,255,0.555)]!',
  'hover:border-[#866BAF]! hover:bg-[#866BAF]! hover:text-[rgba(31,32,41,1)]!'
].join(' ');

export const RECENT_YEAR_SECTION_CLASS = 'recent-year-section mb-[2.75rem]! block! w-full!';
export const RECENT_YEAR_HEADING_CLASS = PUBLICATION_HEADING_CLASS;
export const RECENT_LIST_CLASS = 'recent-publication-list grid! gap-[18px]!';
export const RECENT_ITEM_CLASS = [
  'recent-publication-item relative! overflow-hidden! rounded-[22px]! border! border-[rgba(167,190,255,0.18)]!',
  'bg-[linear-gradient(180deg,rgba(14,20,34,0.9),rgba(20,28,48,0.76)),radial-gradient(circle_at_top_right,rgba(142,109,235,0.16),transparent_42%)]!',
  'px-[1.4rem]! pt-[1.35rem]! pb-[1.15rem]! [box-shadow:0_16px_34px_rgba(4,10,20,0.26)]!',
  '[transition:transform_180ms_ease,border-color_180ms_ease,box-shadow_180ms_ease]!',
  'before:absolute! before:inset-y-0! before:left-0! before:w-[4px]! before:bg-[linear-gradient(180deg,#8fd8ff,#b58cff)]! before:opacity-95! before:content-[\'\']!',
  'hover:-translate-y-[2px]! hover:border-[rgba(184,206,255,0.32)]! hover:shadow-[0_20px_40px_rgba(2,10,24,0.34)]!',
  'max-[1080px]:rounded-[18px]! max-[1080px]:px-[1rem]! max-[1080px]:pt-[1.15rem]! max-[1080px]:pb-[1rem]!'
].join(' ');
export const RECENT_TITLE_CLASS = [
  'm-0! p-0! text-left! text-[1.18rem]! leading-[1.45]! font-bold! text-white!',
  'mb-[0.5rem]! max-[1080px]:text-[1.04rem]!'
].join(' ');
export const RECENT_CONFERENCE_CLASS = 'conference m-0! mb-[0.5rem]! text-left! text-[1rem]! leading-[1.7]! font-bold! tracking-[1px]! text-[#b79cf7]! max-[1080px]:text-[0.95rem]!';
export const RECENT_AUTHOR_CLASS = 'author m-0! text-left! text-[14px]! leading-[1.65]! tracking-[1px]! text-[rgba(243,247,255,0.94)]!';

export const PUBLICATION_CONTACT_WRAPPER_CLASS = 'fixed! right-[15px]! bottom-[15px]! z-[1800]!';
