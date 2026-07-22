const SYSTEM_FONT = "[font-family:-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol','Noto_Color_Emoji']!";

export const PEOPLE_SHELL_CLASS = [
  `people-page-shell static! m-0! h-screen! w-full! max-w-none! overflow-hidden! bg-[#1f2029]! [color-scheme:dark]! scroll-smooth! [&_*]:scroll-smooth! ${SYSTEM_FONT}`,
  'text-[16px]! leading-[1.5]! font-normal! text-[#212529]!'
].join(' ');

export const PEOPLE_CONTENT_CLASS = [
  'people-content h-screen! w-full! overflow-x-hidden! overflow-y-auto! bg-[#0d1a2d]! px-[2rem]! pt-[10rem]! pb-[2rem]!',
  '[scroll-padding-top:156px]! font-[system-ui,sans-serif]! text-[16px]! leading-[1.5]! font-normal! text-[#ccc]!',
  'max-[980px]:px-[0.7rem]! max-[980px]:pt-[6.8rem]! max-[980px]:pb-[2.5rem]!',
  'max-[480px]:px-[0.55rem]! max-[480px]:pt-[6.2rem]!'
].join(' ');

export const PEOPLE_OUTER_SECTION_CLASS = [
  'block! py-[clamp(2rem,5vw,5rem)]!',
  'max-[980px]:pt-[0.3rem]! max-[980px]:pb-[2rem]!'
].join(' ');

export const PEOPLE_CONTAINER_CLASS = [
  'container mx-auto! w-full! px-[15px]!',
  'min-[576px]:max-w-[540px]! min-[768px]:max-w-[720px]! min-[992px]:max-w-[960px]! min-[1200px]:max-w-[1140px]!'
].join(' ');

export const PEOPLE_MAIN_FLOW_CLASS = [
  `${PEOPLE_CONTAINER_CLASS} grid! content-start! gap-[1rem]!`,
  'max-[980px]:mt-[32px]! max-[980px]:gap-[1.05rem]!'
].join(' ');

export const PEOPLE_PAGE_HEADING_CLASS = [
  'm-0! mb-[0.5rem]! p-0! text-center! text-[6em]! leading-[1.2]! font-medium! text-[#ccc]!',
  'max-[980px]:tracking-[0.01em]!'
].join(' ');

export const PEOPLE_SECTION_NAV_CLASS = [
  'publication-nav fixed! top-1/2! left-[clamp(8px,1.5vw,24px)]! z-[20]! w-[132px]! [transform:translateY(-50%)]!',
  'm-0! rounded-[16px]! border! border-[rgba(154,181,242,0.12)]! bg-[linear-gradient(180deg,rgba(14,20,34,0.62),rgba(14,20,34,0.28))]!',
  'p-[0.65rem]! [box-shadow:0_12px_24px_rgba(4,8,20,0.22)]! [backdrop-filter:blur(8px)]! [-webkit-backdrop-filter:blur(8px)]!',
  'max-[980px]:top-[88px]! max-[980px]:left-[clamp(8px,1.5vw,24px)]! max-[980px]:w-[calc(100%-1.1rem)]! max-[980px]:[transform:translateY(-78px)]!',
  'max-[980px]:mb-[1rem]! max-[980px]:rounded-[999px]! max-[980px]:border-[rgba(154,181,242,0.2)]! max-[980px]:bg-[rgba(11,17,32,0.84)]! max-[980px]:[background-image:none]!',
  'max-[980px]:p-[4px]! max-[980px]:[box-shadow:0_10px_22px_rgba(3,8,20,0.24)]! max-[980px]:[backdrop-filter:blur(12px)]! max-[980px]:[-webkit-backdrop-filter:blur(12px)]!',
  'max-[980px]:[transition:transform_220ms_ease,opacity_180ms_ease,box-shadow_180ms_ease,border-color_180ms_ease]! max-[980px]:[will-change:transform,opacity]!',
  'max-[480px]:top-[86px]! max-[480px]:[transform:translateY(-74px)]!'
].join(' ');

export function peopleSectionNavClass(isHidden: boolean): string {
  return `${PEOPLE_SECTION_NAV_CLASS} ${isHidden ? 'max-[980px]:pointer-events-none! max-[980px]:[transform:translateY(calc(-100%-96px))]! max-[980px]:opacity-0! max-[480px]:[transform:translateY(calc(-100%-90px))]!' : ''}`;
}

export const PEOPLE_SECTION_NAV_CONTAINER_CLASS = [
  `${PEOPLE_CONTAINER_CLASS} m-0! block! w-full!`,
  'max-[980px]:overflow-x-auto! max-[980px]:overflow-y-hidden! max-[980px]:[scrollbar-width:none]! max-[980px]:[-ms-overflow-style:none]!'
].join(' ');

export const PEOPLE_SECTION_NAV_LIST_CLASS = [
  'yr__navs m-0! mb-[1rem]! flex! w-full! list-none! flex-col! gap-[8px]! p-0!',
  'max-[980px]:grid! max-[980px]:min-w-full! max-[980px]:grid-cols-2! max-[980px]:gap-[4px]!',
  'max-[480px]:gap-[8px]!'
].join(' ');

const PEOPLE_SECTION_NAV_ITEM_BASE_CLASS = [
  'yr__nav m-0! flex! min-h-[42px]! items-center! justify-center! rounded-[12px]! border! p-0!',
  'text-[0.98rem]! leading-[1.5]! font-[650]! text-white! [transition:background-color_180ms_ease,border-color_180ms_ease,color_180ms_ease]!',
  'max-[980px]:min-h-[38px]! max-[980px]:min-w-[62px]! max-[980px]:shrink-0! max-[980px]:[border:0_none_#fff]!'
].join(' ');

export function peopleSectionNavItemClass(isActive: boolean): string {
  const state = isActive
    ? 'border-[rgba(166,197,255,0.34)]! bg-[rgba(122,150,214,0.16)]! max-[980px]:bg-transparent! max-[980px]:bg-[linear-gradient(100deg,#7fe4ff,#9cf9cf)]! max-[980px]:[box-shadow:0_6px_14px_rgba(0,0,0,0.22)]!'
    : 'border-transparent! bg-transparent! max-[980px]:[background-image:none]! max-[980px]:[box-shadow:none]!';
  return `${PEOPLE_SECTION_NAV_ITEM_BASE_CLASS} ${state}`;
}

export function peopleSectionNavLinkClass(isActive: boolean): string {
  return [
    'inline-flex! min-h-[42px]! w-full! items-center! justify-center! px-[10px]! py-0! font-bold! tracking-[0.01em]! text-white! no-underline! hover:underline! [transition:transform_0.3s_ease]!',
    'max-[980px]:min-h-[38px]! max-[980px]:text-[0.9rem]! max-[480px]:text-[0.86rem]!',
    isActive ? 'max-[980px]:text-[#0a1424]!' : 'max-[980px]:text-white!'
  ].join(' ');
}

export const PEOPLE_EXPLORER_CLASS = [
  'member-explorer mx-auto! mb-[0.25rem]! grid! w-[min(100%,58rem)]! gap-[0.7rem]!',
  'max-[980px]:mb-[0.2rem]! max-[980px]:gap-[0.6rem]!'
].join(' ');

export const PEOPLE_SEARCH_SHELL_CLASS = [
  'member-search-shell relative! mb-[0.25rem]! flex! min-h-[54px]! items-center! gap-[0.8rem]! overflow-hidden! rounded-[18px]! border! border-[rgba(153,186,255,0.2)]!',
  'bg-[linear-gradient(145deg,rgba(20,29,50,0.94),rgba(13,21,38,0.9))]! px-[1.05rem]! py-[0.75rem]! leading-[1.5]!',
  '[box-shadow:inset_0_1px_0_rgba(255,255,255,0.035),0_14px_34px_rgba(3,8,20,0.22)]! [backdrop-filter:blur(14px)]! [-webkit-backdrop-filter:blur(14px)]!',
  '[transition:border-color_180ms_ease,box-shadow_180ms_ease,background-color_180ms_ease]! focus-within:border-[rgba(127,228,255,0.5)]! focus-within:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_3px_rgba(127,228,255,0.09),0_16px_38px_rgba(3,8,20,0.28)]!',
  "before:pointer-events-none! before:absolute! before:inset-x-[1rem]! before:top-0! before:h-px! before:content-['']! before:bg-[linear-gradient(90deg,transparent,rgba(169,228,255,0.28),transparent)]!",
  'max-[480px]:min-h-[48px]! max-[480px]:gap-[0.65rem]! max-[480px]:rounded-[15px]! max-[480px]:px-[0.85rem]! max-[480px]:py-[0.62rem]!'
].join(' ');

export const PEOPLE_SEARCH_ICON_CLASS = 'member-search-icon relative! z-[1]! block! shrink-0! text-[0.92rem]! leading-none! text-[rgba(169,219,255,0.86)]!';
export const PEOPLE_SEARCH_INPUT_CLASS = [
  'member-search-input relative! z-[1]! block! min-w-0! flex-1! border-0! bg-transparent! p-0! font-[system-ui,sans-serif]! text-[16px]! leading-[24px]! tracking-[0.01em]! text-[#f4f8ff]! outline-0!',
  'placeholder:text-[rgba(190,203,231,0.68)]!'
].join(' ');

export const PEOPLE_ROLE_CHIPS_CLASS = [
  'member-role-chips m-0! flex! items-center! gap-[0.5rem]! p-0!',
  'min-[981px]:flex-wrap!',
  'max-[980px]:flex-nowrap! max-[980px]:overflow-x-auto! max-[980px]:overflow-y-auto! max-[980px]:px-[0.1rem]! max-[980px]:pt-[0.1rem]! max-[980px]:pb-[0.35rem]! max-[980px]:[scrollbar-width:none]! max-[980px]:[-ms-overflow-style:none]!'
].join(' ');

const PEOPLE_CHIP_BASE_CLASS = [
  'member-chip m-0! inline-flex! min-h-[36px]! items-center! justify-center! rounded-[999px]! border! px-[1rem]! py-[0.4rem]!',
  'font-[system-ui,sans-serif]! text-[15px]! leading-[22px]! font-[650]! tracking-[0.01em]!',
  '[transition:transform_180ms_ease,background-color_180ms_ease,border-color_180ms_ease,box-shadow_180ms_ease,color_180ms_ease]!',
  'hover:-translate-y-px! focus-visible:outline-none! focus-visible:[box-shadow:0_0_0_3px_rgba(127,228,255,0.12)]!',
  'max-[980px]:min-h-[34px]! max-[980px]:whitespace-nowrap! max-[980px]:px-[0.9rem]! max-[980px]:py-[0.35rem]!'
].join(' ');

export function peopleChipClass(isActive: boolean): string {
  const state = isActive
    ? 'border-[rgba(128,230,255,0.62)]! bg-[rgba(128,230,255,0.14)]! text-[#c8f7ff]! [box-shadow:inset_0_0_0_1px_rgba(156,249,207,0.04),0_8px_22px_rgba(3,9,22,0.22)]! hover:border-[rgba(156,249,207,0.7)]! hover:bg-[rgba(128,230,255,0.18)]!'
    : 'border-[rgba(149,181,252,0.18)]! bg-[rgba(21,29,49,0.62)]! text-[rgba(218,229,251,0.84)]! [box-shadow:none]! hover:border-[rgba(159,213,255,0.38)]! hover:bg-[rgba(30,40,66,0.78)]! hover:text-[#edf6ff]!';
  return `${PEOPLE_CHIP_BASE_CLASS} ${state}`;
}

export const PEOPLE_CURRENT_SECTION_CLASS = 'block! py-[clamp(2rem,5vw,5rem)]! max-[980px]:py-[2rem]!';
export const PEOPLE_MEMBER_GRID_CLASS = [
  'grid m-0! mb-[1rem]! grid-cols-3! items-start! gap-[1.5rem]! p-0!',
  'max-[980px]:grid-cols-2! max-[980px]:gap-[0.75rem]!',
  'max-[380px]:grid-cols-1!'
].join(' ');

export const PEOPLE_MEMBER_CARD_ITEM_CLASS = [
  'member-card-item block! min-w-0! pt-[5px]! pb-[0.7em]! font-[system-ui,sans-serif]! text-[1.4em]! leading-[1.5]! font-normal! text-white!',
  'max-[980px]:even:[transform:translateY(0.42rem)]! max-[380px]:even:[transform:none]!',
  '[&.is-anchor-target_.card]:[outline:3px_solid_rgba(156,249,207,0.84)]! [&.is-anchor-target_.card]:outline-offset-[6px]!',
  '[&.is-anchor-target_.card]:[box-shadow:0_0_0_10px_rgba(156,249,207,0.12),0_20px_42px_rgba(0,0,0,0.32)]!'
].join(' ');

export const PEOPLE_CARD_CLASS = [
  'card relative! mx-auto! flex! w-[min(calc(100%-2rem),35ch)]! flex-col! gap-[0.5rem]! overflow-hidden! rounded-[0.5rem]! [border:0_none_#fff]! bg-[#30313f]! text-center!',
  'max-[980px]:w-full! max-[980px]:rounded-[18px]! max-[980px]:bg-transparent! max-[980px]:bg-[linear-gradient(164deg,rgba(54,58,78,0.98)_0%,rgba(35,39,59,0.98)_100%)]! max-[980px]:[box-shadow:0_14px_30px_rgba(3,8,20,0.33)]!',
  "max-[980px]:before:pointer-events-none! max-[980px]:before:absolute! max-[980px]:before:inset-x-0! max-[980px]:before:top-0! max-[980px]:before:h-[45%]! max-[980px]:before:content-['']!",
  'max-[980px]:before:bg-[radial-gradient(circle_at_20%_-10%,rgba(131,225,255,0.3),transparent_60%)]! max-[980px]:before:opacity-90!'
].join(' ');

const PEOPLE_CARD_FRONT_BASE_CLASS = [
  'card__front grid! content-start! gap-[1rem]! px-[2em]! pt-[2em]! pb-[2.5em]! [transition:opacity_250ms_ease,transform_450ms_ease]!',
  'max-[980px]:relative! max-[980px]:z-[2]! max-[980px]:gap-[0.62rem]! max-[980px]:px-[0.82rem]! max-[980px]:pt-[0.95rem]! max-[980px]:pb-[2.2rem]!',
  'max-[480px]:px-[0.72rem]! max-[480px]:pt-[0.88rem]! max-[480px]:pb-[2.05rem]!'
].join(' ');

export function peopleCardFrontClass(isVisible: boolean): string {
  return `${PEOPLE_CARD_FRONT_BASE_CLASS} ${isVisible ? 'pointer-events-none! [transform:translateY(100%)]! opacity-0! [transition:opacity_150ms_ease,transform_450ms_ease_50ms]!' : '[transform:translateY(0)]! opacity-100!'}`;
}

export function peopleCardImageClass(isPanHui: boolean): string {
  return [
    'card__img mx-auto! block! aspect-square! w-[12rem]! [border:0_none_#ccc]! [border-radius:50%]!',
    'max-[980px]:w-[clamp(86px,28vw,122px)]! max-[980px]:[border-color:rgba(240,246,255,0.82)]! max-[480px]:w-[clamp(78px,30vw,112px)]!',
    isPanHui ? 'card__img--pan-hui bg-[#050506]! object-contain!' : 'object-cover!'
  ].join(' ');
}

export const PEOPLE_CARD_TEXT_FLOW_CLASS = 'grid! content-start! gap-[0.25rem]!';
export const PEOPLE_CARD_NAME_CLASS = [
  'card__name m-0! mb-[1rem]! p-0! font-bold! text-white!',
  'max-[980px]:text-[clamp(1rem,3.4vw,1.2rem)]! max-[980px]:leading-[1.1]! max-[980px]:tracking-[0.01em]!',
  'max-[480px]:text-[clamp(0.95rem,3.8vw,1.1rem)]!'
].join(' ');

export const PEOPLE_CARD_POSITION_CLASS = [
  'card__position m-0! mb-[1rem]! p-0! italic! text-white!',
  'max-[980px]:mx-auto! max-[980px]:line-clamp-3! max-[980px]:max-w-[17ch]! max-[980px]:overflow-hidden! max-[980px]:text-[clamp(0.72rem,2.45vw,0.88rem)]! max-[980px]:leading-[1.35]! max-[980px]:not-italic! max-[980px]:text-[rgba(236,242,255,0.9)]!',
  'max-[480px]:text-[clamp(0.69rem,2.7vw,0.8rem)]!'
].join(' ');

const PEOPLE_CARD_BACK_BASE_CLASS = [
  'card__back absolute! inset-0! z-[1]! grid! content-start! gap-[1rem]! overflow-auto! px-[2em]! pt-[2em]! pb-[2.5em]!',
  'max-[980px]:border-x-0! max-[980px]:border-b-0! max-[980px]:border-t! max-[980px]:border-solid! max-[980px]:border-t-[rgba(160,193,255,0.14)]!',
  'max-[980px]:bg-[linear-gradient(180deg,rgba(24,29,47,0.95),rgba(13,18,31,0.95))]! max-[980px]:px-[0.85rem]! max-[980px]:pt-[0.85rem]! max-[980px]:pb-[2.45rem]! max-[980px]:text-left!'
].join(' ');

export function peopleCardBackClass(isVisible: boolean): string {
  const state = isVisible
    ? 'pointer-events-auto! [transform:translateY(0)]! opacity-100! [transition:transform_350ms_ease,opacity_450ms_ease_100ms]!'
    : 'pointer-events-none! [transform:translateY(100%)]! opacity-0! [transition:transform_450ms_ease,opacity_150ms_ease]!';
  return `${PEOPLE_CARD_BACK_BASE_CLASS} ${state}`;
}

export const PEOPLE_CARD_BACK_NAME_CLASS = `${PEOPLE_CARD_NAME_CLASS} max-[980px]:text-center! max-[980px]:text-[0.95rem]!`;
export const PEOPLE_CARD_QUOTE_CLASS = 'm-0! block! text-white! max-[980px]:text-left! max-[980px]:text-[0.76rem]! max-[980px]:leading-[1.45]! max-[980px]:text-[#dce7ff]!';
export const PEOPLE_CARD_SOCIAL_CLASS = [
  'card__social m-0! flex! list-none! flex-wrap! items-center! justify-center! gap-[1rem]! p-0!',
  'max-[980px]:m-0! max-[980px]:justify-end!'
].join(' ');
export const PEOPLE_CARD_SOCIAL_ITEM_CLASS = 'm-0! block! pt-[5px]! pb-[0.7em]! text-[1.4em]! leading-[1.5]! max-[980px]:p-0! max-[980px]:text-[0.86rem]!';
export const PEOPLE_CARD_SOCIAL_LINK_CLASS = 'inline-block! bg-transparent! text-white! no-underline! max-[980px]:inline-flex! max-[980px]:size-[1.8rem]! max-[980px]:items-center! max-[980px]:justify-center! max-[980px]:rounded-[999px]!';
export const PEOPLE_CARD_SOCIAL_ICON_CLASS = 'pt-[1em]!';

export const PEOPLE_CARD_FOOTER_CLASS = [
  'card__footer relative! z-[5]! h-[2.75rem]! border-x-0! border-b-0! border-t! border-solid! border-t-[rgba(165,188,238,0.08)]!',
  'bg-[linear-gradient(180deg,rgba(28,29,40,0.9),rgba(25,27,39,0.98))]!',
  'max-[980px]:h-[2.6rem]! max-[980px]:border-t-[rgba(165,188,238,0.1)]! max-[980px]:bg-[rgba(20,25,41,0.62)]!'
].join(' ');

const PEOPLE_CARD_TOGGLE_BASE_CLASS = [
  'card__toggle absolute! bottom-[0.3rem]! left-1/2! inline-flex! aspect-square! w-[2.2rem]! [transform:translateX(-50%)]! cursor-pointer! items-center! justify-center! rounded-full! border! border-[rgba(164,198,255,0.28)]! p-0! text-center! text-[0.78rem]! text-[rgba(220,235,255,0.9)]!',
  'bg-[linear-gradient(145deg,rgba(80,94,130,0.72),rgba(45,55,82,0.84))]! [box-shadow:inset_0_1px_0_rgba(255,255,255,0.09),0_7px_18px_rgba(2,7,18,0.28)]!',
  '[transition:transform_180ms_ease,background-color_180ms_ease,border-color_180ms_ease,box-shadow_180ms_ease,color_180ms_ease]! hover:border-[rgba(127,228,255,0.58)]! hover:text-white! hover:[transform:translate(-50%,-2px)]! hover:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.12),0_10px_22px_rgba(2,7,18,0.34)]!',
  'focus-visible:outline-none! focus-visible:[box-shadow:0_0_0_3px_rgba(127,228,255,0.16),0_8px_20px_rgba(2,7,18,0.3)]!',
  'max-[980px]:bottom-[0.22rem]! max-[980px]:w-[2.15rem]! max-[980px]:text-[0.74rem]!'
].join(' ');

export function peopleCardToggleClass(isVisible: boolean): string {
  const state = isVisible
    ? 'border-[rgba(156,249,207,0.58)]! bg-[linear-gradient(145deg,rgba(77,134,136,0.88),rgba(42,82,99,0.94))]! text-[#eafff8]!'
    : '';
  return `${PEOPLE_CARD_TOGGLE_BASE_CLASS} ${state}`;
}

export function peopleCardToggleIconClass(isVisible: boolean): string {
  return `card__toggle-icon block! [transition:transform_220ms_ease]! ${isVisible ? 'rotate-180!' : 'rotate-0!'}`;
}

export const PEOPLE_EMPTY_CLASS = 'member-empty w-full! rounded-[16px]! border! border-dashed! border-[rgba(163,191,245,0.36)]! bg-[rgba(18,25,44,0.62)]! px-[1rem]! py-[1.2rem]! text-center! text-[0.95rem]! text-[#d7e6ff]!';

export const PEOPLE_ALUMNI_SECTION_CLASS = 'mt-0! block! py-[clamp(2rem,5vw,5rem)]! max-[980px]:mt-[0.5rem]! max-[980px]:py-[2rem]!';
export const PEOPLE_ALUMNI_TITLE_CLASS = [
  'm-0! mb-[0.5rem]! pt-[1em]! text-center! text-[3em]! leading-[1.2]! font-medium! text-[#ccc]!',
  'max-[980px]:tracking-[0.01em]!'
].join(' ');
export const PEOPLE_ALUMNI_GROUP_HEADING_CLASS = [
  'm-0! mb-[0.5rem]! pb-[0.5em]! text-[1.75rem]! leading-[1.2]! font-medium! text-white!',
  'max-[980px]:mt-0! max-[980px]:text-[1.02rem]! max-[980px]:leading-[1.2]!'
].join(' ');
export const PEOPLE_ALUMNI_LIST_CLASS = 'm-0! mb-[1rem]! block! pl-[40px]! max-[980px]:pl-[0.85rem]!';
export const PEOPLE_ALUMNI_ITEM_CLASS = [
  'inline-block! pt-[5px]! pb-[0.7em]! text-[1.4em]! leading-[1.5]! font-normal! text-white!',
  'max-[980px]:pb-[0.72rem]! max-[980px]:text-[0.92rem]! max-[980px]:leading-[1.45]!'
].join(' ');
export const PEOPLE_ALUMNI_NAME_CLASS = 'font-bold!';
