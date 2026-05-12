import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import type { Locale } from '../types/common';
import '../styles/home-page.css';

interface HomePageProps {
  locale?: Locale;
}

type HomePanel = 'about' | 'contact' | null;

const homeText: Record<Locale, { newsLabel: string; newsAria: string }> = {
  en: {
    newsLabel: 'News',
    newsAria: 'Browse latest news'
  },
  'zh-CN': {
    newsLabel: '新闻动态',
    newsAria: '查看最新新闻'
  }
};

const researchFocus = [
  {
    title: 'Pushing the Boundaries of Immersive Technologies',
    body: 'We explore the convergence of virtual reality (VR), augmented reality (AR), extended reality (XR), and mixed reality (MR), alongside other transformative technologies that shape the Metaverse.'
  },
  {
    title: 'Social Computing and Prosocial Interactions ',
    body: 'We investigate how social computing can enhance prosocial behaviors, fostering trust, engagement, and collaboration within virtual communities.'
  },
  {
    title: 'Generative AI and Large Language Models Techniques',
    body: 'As core technologies driving our research, we focus on developing applicable generative AI and LLMs-related techniques for enhancing the interactivity in metaverse and broadening the boundaries of higher education.'
  },
  {
    title: 'VR/AR/XR Computer Network ',
    body: 'We examine innovative approaches on VR-related network usage that adapt to user needs and environmental conditions, ensuring seamless experiences in the Metaverse.'
  },
  {
    title: 'AI+ Projects ',
    body: 'Our AI+ initiative, particularly in education, encompasses three main components: Metaverse classrooms, AI lecturers, and the development of interactive AI lecturers. These projects aim to create immersive, cross-campus learning environments, introduce AI-driven teaching methods, and develop real-time interactive AI lecturers, thereby revolutionizing the educational landscape.'
  }
];

function useCloseSocialMenu(menuRef: React.RefObject<HTMLDivElement>, isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (target instanceof Node && !menuRef.current?.contains(target)) {
        onClose();
      }
    };

    window.addEventListener('click', closeOnOutsideClick);
    window.addEventListener('touchstart', closeOnOutsideClick);
    return () => {
      window.removeEventListener('click', closeOnOutsideClick);
      window.removeEventListener('touchstart', closeOnOutsideClick);
    };
  }, [isOpen, menuRef, onClose]);
}

function useHomeDocumentTitle(): void {
  useEffect(() => {
    document.title = 'MC2 | HKUST(GZ), HKUST';
  }, []);
}

function openPanelWithKeyboard(event: React.KeyboardEvent<HTMLElement>, onOpen: () => void): void {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onOpen();
}

export default function HomePage({ locale = 'en' }: HomePageProps): JSX.Element {
  useHomeDocumentTitle();
  const [activePanel, setActivePanel] = useState<HomePanel>(null);
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const socialMenuRef = useRef<HTMLDivElement>(null);
  const content = homeText[locale];

  useCloseSocialMenu(socialMenuRef, isSocialMenuOpen, () => setIsSocialMenuOpen(false));

  const shellClassName = [
    'home-page-shell',
    activePanel === 'about' ? 'home-about-on' : '',
    activePanel === 'contact' ? 'home-contact-on' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClassName} role='main' aria-label='Home'>
      <SiteNav activeRoute='home' locale={locale} />

      <section className='hero-section'>
        <div
          className='about-text hover-target'
          role='button'
          tabIndex={0}
          onClick={() => setActivePanel('about')}
          onKeyDown={(event) => openPanelWithKeyboard(event, () => setActivePanel('about'))}
        >
          About
        </div>
        <div
          className='contact-text hover-target'
          role='button'
          tabIndex={0}
          onClick={() => setActivePanel('contact')}
          onKeyDown={(event) => openPanelWithKeyboard(event, () => setActivePanel('contact'))}
        >
          Contact
        </div>
        <div className='section-center'>
          <div className='container-fluid'>
            <div className='row justify-content-center hero-main-row'>
              <div className='col-12 text-center'>
                <h1>Center for Metaverse and Computational Creativity (MC<sup className='hero-brand-sup'>2</sup>)</h1>
              </div>

              <div className='col-12 text-center mt-4 mt-lg-5'>
                <div className='hero-cta-group'>
                  <Link className='surreality-btn news-btn hover-target' to='/news' aria-label={content.newsAria}>
                    <i className='fa-regular fa-newspaper btn-icon' aria-hidden='true'></i>
                    <span>{content.newsLabel}</span>
                    <span className='btn-arrow' aria-hidden='true'>→</span>
                  </Link>

                  <a
                    className='surreality-btn film-btn hover-target'
                    href='https://youtu.be/yCSXbXoK8fg'
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='SURREALITY 1.0 Official Exhibition Film'
                  >
                    <i className='fa-solid fa-circle-play btn-icon' aria-hidden='true'></i>
                    <span>SURREALITY 1.0 Official Exhibition Film</span>
                    <span className='btn-arrow' aria-hidden='true'>↗</span>
                  </a>

                  <Link className='surreality-btn open-call-btn hover-target' to='/news?action=showModal' aria-label='SURREALITY 2.0 Open Call'>
                    <i className='fa-solid fa-rocket btn-icon' aria-hidden='true'></i>
                    <span>SURREALITY 2.0 Open Call</span>
                    <span className='btn-arrow' aria-hidden='true'>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='about-section' style={{ overflow: 'auto' }}>
        <div className='section-center' style={{ transform: 'none', top: '10%' }}>
          <div className='container'>
            <div className='row justify-content-center'>
              <div className='col-12 text-center'>
                <p style={{ fontSize: 'min(10vw,10vh)', fontFamily: 'Open Sans', fontWeight: 400 }}>
                  About Us
                </p>
              </div>
              <div className='col-lg-12 mt-4' style={{ textAlign: 'justify' }}>
                <p>
                  As the Metaverse continues to evolve, its significance in shaping social interactions, educational experiences, and collaborative opportunities is becoming increasingly essential. This digital frontier holds the potential to create prosocial environments where individuals can connect, learn, and innovate, transcending geographical boundaries and fostering inclusivity. By leveraging immersive technologies, the Metaverse can enhance engagement, promote creativity, and facilitate knowledge sharing, ultimately contributing to a more connected and compassionate society.
                </p>
              </div>
              <div className='col-lg-12 mt-4' style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                <p>
                  Led by <a href='https://panhui.people.ust.hk/' target='_blank' rel='noopener noreferrer'>Professor Pan Hui</a>—an International Fellow of the Royal Academy of Engineering, Member of Academia Europaea, and IEEE Fellow—the Center for Metaverse and Computational Creativity (MC2) operates at the intersection of immersive technology, Human-Computer Interaction (HCI), social computing, computational social science, and machine learning. Our research is guided by five key foci:
                </p>
              </div>
              <div className='col-lg-12 mt-4' style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
                <ul>
                  {researchFocus.map((item) => (
                    <li key={item.title}>• <strong>{item.title}</strong>: {item.body}</li>
                  ))}
                </ul>
              </div>
              <div className='col-lg-12 mt-4' style={{ display: 'flex', justifyContent: 'center' }}>
                <p>
                  Our group’s work has been published in top-tier venues across computer science and art, including ACM WWW, ACM SIGCOMM, ACM Mobisys, ACM MobiCom, ACM CoNext, IEEE Infocom, IEEE PerCom, IEEE ICNP, IEEE ICDCS, IJCAI, AAAI, SIGGRAPH, CHI, CSCW, and more. At MC2, we are committed to harnessing these interdisciplinary approaches to create transformative experiences that enrich lives and foster a more connected world. Join us as we navigate the exciting possibilities of the Metaverse and its applications in society.
                </p>
              </div>
              <div className='col-lg-12 mt-4' style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  className='close_btn about-close_btn'
                  role='button'
                  tabIndex={0}
                  onClick={() => setActivePanel(null)}
                  onKeyDown={(event) => openPanelWithKeyboard(event, () => setActivePanel(null))}
                >
                  Close
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='contact-section'>
        <div className='section-center'>
          <div className='container'>
            <div className='row justify-content-center'>
              <div className='col-12 text-center'>
                <a href='#' className='hover-target'>mc2@hkust-gz.edu.cn</a>
              </div>
              <div className='col-12 text-center social mt-4'>
                <a href='#' className='hover-target'>WeChat</a>
                <a href='https://www.youtube.com/@MC2HKUSTGZCWB' className='hover-target'>YouTube</a>
                <a href='https://medium.com/@mc2.hkust.hkustgz' className='hover-target'>Medium</a>
              </div>
            </div>
          </div>
          <div className='col-lg-12 mt-4' style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              className='contact_btn contact-close_btn'
              role='button'
              tabIndex={0}
              onClick={() => setActivePanel(null)}
              onKeyDown={(event) => openPanelWithKeyboard(event, () => setActivePanel(null))}
            >
              Close
            </div>
          </div>
        </div>
      </section>

      <div className='wrapMenu' ref={socialMenuRef}>
        <div className={isSocialMenuOpen ? 'menu menu--bottom-right active' : 'menu menu--bottom-right menu-closed'} id='menu_bottom_right'>
          <a
            className='menu__btn'
            href='#contact-menu'
            aria-expanded={isSocialMenuOpen}
            aria-label='Contact links'
            onClick={(event) => {
              event.preventDefault();
              setIsSocialMenuOpen((open) => !open);
            }}
          >
            <i className='fa fa-info' aria-hidden='true'></i>
          </a>
          <ul className='menu__list'>
            <li><a href='mailto:mc2@hkust-gz.edu.cn' aria-label='Email MC2'><i className='fa-solid fa-envelope' aria-hidden='true'></i></a></li>
            <li><a href='#' aria-label='WeChat'><i className='fa-brands fa-weixin' aria-hidden='true'></i></a></li>
            <li><a href='https://medium.com/@mc2.hkust.hkustgz' aria-label='Medium'><i className='fa-brands fa-medium' aria-hidden='true'></i></a></li>
            <li><a href='https://www.youtube.com/@MC2HKUSTGZCWB' aria-label='YouTube'><i className='fa-brands fa-youtube' aria-hidden='true'></i></a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
