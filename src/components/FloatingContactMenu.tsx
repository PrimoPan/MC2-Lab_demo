import React, { useEffect, useState } from 'react';
import ContactMenu from './contact/ContactMenu';

export default function FloatingContactMenu({ wrapperClassName = '' }: { wrapperClassName?: string }): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeMenu = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('.menu')) return;
      setIsOpen(false);
    };

    window.addEventListener('click', closeMenu);
    window.addEventListener('touchstart', closeMenu);
    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('touchstart', closeMenu);
    };
  }, [isOpen]);

  return (
    <div className={`wrapMenu ${wrapperClassName}`}>
      <ContactMenu id='menu_bottom_right' isOpen={isOpen} onToggle={() => setIsOpen((open) => !open)} wechatHref='#wechat' />
    </div>
  );
}
