import React from 'react';

interface ContactMenuProps {
  className?: string;
  id: string;
  isOpen: boolean;
  onToggle: () => void;
  wechatHref: string;
}

const contactLinks = [
  { ariaLabel: 'Email MC2', href: 'mailto:mc2@hkust-gz.edu.cn', icon: 'fa-solid fa-envelope' },
  { ariaLabel: 'WeChat', href: '#wechat', icon: 'fa-brands fa-weixin' },
  { ariaLabel: 'Medium', href: 'https://medium.com/@mc2.hkust.hkustgz', icon: 'fa-brands fa-medium' },
  { ariaLabel: 'YouTube', href: 'https://www.youtube.com/@MC2HKUSTGZCWB', icon: 'fa-brands fa-youtube' }
] as const;

const openDelays = ['delay-[0ms]!', 'delay-[200ms]!', 'delay-[400ms]!', 'delay-[600ms]!'];

export default function ContactMenu({ className = '', id, isOpen, onToggle, wechatHref }: ContactMenuProps): JSX.Element {
  return (
    <div
      className={`menu menu--bottom-right ${isOpen ? 'active' : ''} absolute! right-[15px]! bottom-[15px]! z-[9999]! flex! size-[50px]! rounded-[100%]! p-0! text-left! ${className}`}
      id={id}
    >
      <a
        className='menu__btn absolute! top-0! left-0! flex! size-[50px]! cursor-pointer! items-center! justify-center! rounded-[4px]! bg-[#89d8d3]! [background-image:linear-gradient(315deg,#1f2029_0%,#463558_74%)]! text-center! opacity-80! [box-shadow:0_0_20px_0_rgba(0,0,0,0.15)]! [transition:transform_300ms]!'
        href={`#${id}`}
        aria-expanded={isOpen}
        aria-label='Contact links'
        onClick={(event) => {
          event.preventDefault();
          onToggle();
        }}
      >
        <i className='fa fa-info text-white!' aria-hidden='true'></i>
      </a>
      <ul className={`menu__list absolute! right-0! bottom-0! m-0! flex! origin-bottom-right! list-none! flex-col! overflow-hidden! rounded-[4px]! bg-[#89d8d3]! [background-image:linear-gradient(315deg,#1f2029_0%,#463558_74%)]! px-0! py-[5px]! [box-shadow:0_0_20px_0_rgba(0,0,0,0.15)]! [transition:transform_0.3s,visibility_0s_0s]! ${isOpen ? 'visible! [transform:scale(1)]!' : '[transform:scale(0)]!'}`}>
        {contactLinks.map((link, index) => (
          <li className='flex! items-center! py-[5px]!' key={link.ariaLabel}>
            <a
              className={`relative! inline-block! w-full! px-[25px]! py-[15px]! text-white! no-underline! ${isOpen ? `[transform:translateX(0)]! opacity-100! [transition:all_500ms]! ${openDelays[index]}` : '[transform:translateX(-10px)]! opacity-0! [transition:transform_300ms]!'}`}
              href={link.ariaLabel === 'WeChat' ? wechatHref : link.href}
              aria-label={link.ariaLabel}
            >
              <i className={link.icon} aria-hidden='true'></i>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
