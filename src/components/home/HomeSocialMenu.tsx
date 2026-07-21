import React, { type RefObject } from 'react';
import ContactMenu from '../contact/ContactMenu';

interface HomeSocialMenuProps {
  isOpen: boolean;
  menuRef: RefObject<HTMLDivElement>;
  onToggle: () => void;
}

export default function HomeSocialMenu({ isOpen, menuRef, onToggle }: HomeSocialMenuProps): JSX.Element {
  return (
    <div className='wrapMenu pointer-events-none! absolute! inset-0!' ref={menuRef}>
      <ContactMenu className='pointer-events-auto! max-[840px]:hidden!' id='menu_bottom_right' isOpen={isOpen} onToggle={onToggle} wechatHref='#' />
    </div>
  );
}
