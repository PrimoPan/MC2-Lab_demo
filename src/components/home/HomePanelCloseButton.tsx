import React from 'react';
import { runOnEnterOrSpace } from './homeKeyboard';

interface HomePanelCloseButtonProps {
  onClose: () => void;
  variant: 'about' | 'contact';
}

const CLOSE_BUTTON_CLASS = [
  "m-[25px]! cursor-pointer! rounded-[1em]! border! border-solid! border-[#b8baca]!",
  "[font-family:'Poppins',sans-serif]! text-[min(2vw,2vh)]! font-normal! tracking-[1px]! text-[#b8baca]!"
].join(' ');

export default function HomePanelCloseButton({ onClose, variant }: HomePanelCloseButtonProps): JSX.Element {
  return (
    <div
      className={`${variant === 'about' ? 'close_btn about-close_btn px-[2.5em]! py-[1em]!' : 'contact_btn contact-close_btn px-[1.5em]! py-[.5em]!'} ${CLOSE_BUTTON_CLASS}`}
      role='button'
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(event) => runOnEnterOrSpace(event, onClose)}
    >
      Close
    </div>
  );
}
