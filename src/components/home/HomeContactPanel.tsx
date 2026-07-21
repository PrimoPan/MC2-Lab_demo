import React from 'react';
import { homeContactLinks } from '../../data/homePageContent';
import HomePanelCloseButton from './HomePanelCloseButton';

interface HomeContactPanelProps {
  isOpen: boolean;
  onClosePanel: () => void;
}

export default function HomeContactPanel({ isOpen, onClosePanel }: HomeContactPanelProps): JSX.Element {
  return (
    <section className={`contact-section fixed! top-0! left-0! z-[10]! block! h-screen! w-screen! overflow-hidden! bg-[rgba(31,32,41,1)]! ${isOpen ? '[transform:translateX(0)]! [transition:all_300ms_linear_400ms]!' : '[transform:translateX(100%)]! [transition:all_300ms_linear_0ms]!'}`}>
      <div className='section-center absolute! top-1/2! left-0! z-[1]! w-full! [transform:translateY(-50%)]!'>
        <div className='container'>
          <div className='row justify-content-center mb-[7.5px]!'>
            <div className='col-12 text-center'>
              <a href='#' className='hover-target mx-auto! inline-block! text-[32px]! font-black! tracking-[1px]! text-white! [transition:transform_300ms]! max-[580px]:text-[17px]!'>mc2@hkust-gz.edu.cn</a>
            </div>
            <div className='col-12 text-center social mt-4'>
              {homeContactLinks.map((link) => (
                <a key={link.label} href={link.href} className='hover-target mx-[8px]! inline-block! text-[15px]! font-semibold! tracking-[1px]! text-[#866BAF]! [transition:transform_300ms]! max-[580px]:mx-[3px]! max-[580px]:text-[13px]! max-[580px]:tracking-normal!'>{link.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div className='col-lg-12 mt-4 flex! justify-center!'>
          <HomePanelCloseButton variant='contact' onClose={onClosePanel} />
        </div>
      </div>
    </section>
  );
}
