import React from 'react';
import { homeContactLinks } from '../../data/homePageContent';
import HomePanelCloseButton from './HomePanelCloseButton';

interface HomeContactPanelProps {
  isOpen: boolean;
  onClosePanel: () => void;
}

export default function HomeContactPanel({ isOpen, onClosePanel }: HomeContactPanelProps): JSX.Element {
  return (
    <section className={`contact-section ${isOpen ? 'translate-x-0! delay-[400ms]!' : ''}`}>
      <div className='section-center'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-12 text-center'>
              <a href='#' className='hover-target'>mc2@hkust-gz.edu.cn</a>
            </div>
            <div className='col-12 text-center social mt-4'>
              {homeContactLinks.map((link) => (
                <a key={link.label} href={link.href} className='hover-target'>{link.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div className='col-lg-12 mt-4 flex! justify-center!'>
          <HomePanelCloseButton className='contact_btn contact-close_btn' onClose={onClosePanel} />
        </div>
      </div>
    </section>
  );
}
