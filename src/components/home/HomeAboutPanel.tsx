import React from 'react';
import { homeAboutCopy, homeResearchFocus } from '../../data/homePageContent';
import HomePanelCloseButton from './HomePanelCloseButton';

interface HomeAboutPanelProps {
  isOpen: boolean;
  onClosePanel: () => void;
}

export default function HomeAboutPanel({ isOpen, onClosePanel }: HomeAboutPanelProps): JSX.Element {
  return (
    <section className={`about-section overflow-auto! ${isOpen ? 'translate-x-0! delay-[400ms]!' : ''}`}>
      <div className='section-center top-[10%]! transform-none!'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-12 text-center'>
              <p className="font-['Open_Sans']! text-[min(10vw,10vh)]! font-normal!">About Us</p>
            </div>
            <div className='col-lg-12 mt-4 text-justify!'>
              <p>{homeAboutCopy.intro}</p>
            </div>
            <div className='col-lg-12 mt-4 text-justify! [text-justify:inter-word]!'>
              <p>
                {homeAboutCopy.leaderPrefix}
                <a href={homeAboutCopy.leaderHref} target='_blank' rel='noopener noreferrer'>{homeAboutCopy.leaderName}</a>
                {homeAboutCopy.leaderSuffix}
              </p>
            </div>
            <div className='col-lg-12 mt-4 text-justify! [text-justify:inter-word]!'>
              <ul>
                {homeResearchFocus.map((item) => (
                  <li key={item.title}>• <strong>{item.title}</strong>: {item.body}</li>
                ))}
              </ul>
            </div>
            <div className='col-lg-12 mt-4 flex! justify-center!'>
              <p>{homeAboutCopy.closing}</p>
            </div>
            <div className='col-lg-12 mt-4 flex! justify-center!'>
              <HomePanelCloseButton className='close_btn about-close_btn' onClose={onClosePanel} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
