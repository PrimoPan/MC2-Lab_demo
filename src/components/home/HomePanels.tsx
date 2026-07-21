import React from 'react';
import HomeAboutPanel from './HomeAboutPanel';
import HomeContactPanel from './HomeContactPanel';
import type { HomePanel } from '../../types/home';

interface HomePanelsProps {
  activePanel: HomePanel;
  onClosePanel: () => void;
}

export default function HomePanels({ activePanel, onClosePanel }: HomePanelsProps): JSX.Element {
  return (
    <>
      <HomeAboutPanel isOpen={activePanel === 'about'} onClosePanel={onClosePanel} />
      <HomeContactPanel isOpen={activePanel === 'contact'} onClosePanel={onClosePanel} />
    </>
  );
}
