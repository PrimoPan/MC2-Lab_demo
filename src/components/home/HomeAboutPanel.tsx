import React from 'react';
import { homeAboutCopy, homeResearchFocus } from '../../data/homePageContent';
import HomePanelCloseButton from './HomePanelCloseButton';

interface HomeAboutPanelProps {
  isOpen: boolean;
  onClosePanel: () => void;
}

export default function HomeAboutPanel({ isOpen, onClosePanel }: HomeAboutPanelProps): JSX.Element {
  const bodyCopyClass = "[font-family:'Poppins',sans-serif]! text-[20px]! font-normal! tracking-[1px]! text-[#b8baca]!";

  return (
    <section className={`about-section fixed! top-0! left-0! z-[10]! block! h-screen! w-screen! overflow-auto! bg-[rgba(31,32,41,1)]! ${isOpen ? '[transform:translateX(0)]! [transition:all_300ms_linear_400ms]!' : '[transform:translateX(-100%)]! [transition:all_300ms_linear_0ms]!'}`}>
      <div className='section-center absolute! top-[10%]! left-0! z-[1]! w-full! transform-none!'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-12 text-center'>
              <p className="font-['Open_Sans']! text-[min(10vw,10vh)]! font-normal! tracking-[1px]! text-[#b8baca]!">About Us</p>
            </div>
            <div className='col-lg-12 mt-4 text-justify!'>
              <p className={bodyCopyClass}>{homeAboutCopy.intro}</p>
            </div>
            <div className='col-lg-12 mt-4 text-justify! [text-justify:inter-word]!'>
              <p className={bodyCopyClass}>
                {homeAboutCopy.leaderPrefix}
                <a className='inline-block! font-semibold! text-white! [transition:transform_300ms]! visited:text-white! hover:text-white!' href={homeAboutCopy.leaderHref} target='_blank' rel='noopener noreferrer'>{homeAboutCopy.leaderName}</a>
                {homeAboutCopy.leaderSuffix}
              </p>
            </div>
            <div className='col-lg-12 mt-4 text-justify! [text-justify:inter-word]!'>
              <ul className='mt-0! mb-[1rem]! pl-[40px]!'>
                {homeResearchFocus.map((item) => (
                  <li className="inline-block! pt-[5px]! pb-[2em]! [font-family:'Poppins',sans-serif]! text-[20px]! font-normal! tracking-[1px]! text-white!" key={item.title}>• <strong>{item.title}</strong>: {item.body}</li>
                ))}
              </ul>
            </div>
            <div className='col-lg-12 mt-4 flex! justify-center!'>
              <p className={bodyCopyClass}>{homeAboutCopy.closing}</p>
            </div>
            <div className='col-lg-12 mt-4 flex! justify-center!'>
              <HomePanelCloseButton variant='about' onClose={onClosePanel} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
