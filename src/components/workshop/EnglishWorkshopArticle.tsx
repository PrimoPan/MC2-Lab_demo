import { hideAffiliationTileImage, hideOrganizerBrandImage, useFallbackPhoto } from './workshopImageHandlers';

export default function EnglishWorkshopArticle(): JSX.Element {
  return (
    <div className='news-section'>
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-12 pt-[100px]! text-center text-white!'>
            <h3>{"News"}</h3>
          </div>
          <div className='col-lg-10 mt-4 mb-5'>
            <article className='news-article-card'>
              <h2 className='article-title'>{"AI as Catalyst Workshop to Explore AI in Healthcare and Education at HKUST(GZ)"}</h2>
              <p className='article-meta'>
                <strong>{"Published:"}</strong>
                {" April 10, 2026"}
              </p>
              <section className='affiliation-showcase' aria-label='Workshop organizers and participating institutions'>
                <div className='affiliation-group'>
                  <p className='affiliation-group__title'>{"Organizers"}</p>
                  <div className='organizer-lockup'>
                    <div className='organizer-lockup__row organizer-lockup__row--single'>
                      <div className='organizer-pair organizer-pair--schools'>
                        <div className='organizer-brand organizer-brand--mit'>
                          <div className='organizer-brand__visual'>
                            <img src='https://1000logos.net/wp-content/uploads/2026/01/MIT-logo.png' alt='MIT logo' className='organizer-brand__logo organizer-brand__logo--mit' />
                          </div>
                          <div className='organizer-brand__meta'>
                            <span className='organizer-brand__zh'>{"Massachusetts Institute of Technology"}</span>
                            <span className='organizer-brand__en'>{"MIT"}</span>
                          </div>
                        </div>
                        <span className='organizer-pair__mark' aria-hidden='true'>{"×"}</span>
                        <div className='organizer-brand organizer-brand--hkustgz'>
                          <div className='organizer-brand__visual'>
                            <img src='/images/UST-GZ-EN.png' alt='HKUST(GZ) logo' className='organizer-brand__logo organizer-brand__logo--hkustgz' onError={hideOrganizerBrandImage} />
                          </div>
                          <div className='organizer-brand__meta'>
                            <span className='organizer-brand__zh'>{"The Hong Kong University of Science and Technology (Guangzhou)"}</span>
                            <span className='organizer-brand__en'>{"HKUST(GZ)"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='organizer-lockup__row organizer-lockup__row--single'>
                      <div className='organizer-pair organizer-pair--institutions'>
                        <div className='organizer-brand organizer-brand--critical-data'>
                          <div className='organizer-brand__visual'>
                            <img src='https://criticaldatathon.github.io/static/img/logo.svg' alt='MIT Critical Data logo' className='organizer-brand__logo organizer-brand__logo--critical-data' onError={hideOrganizerBrandImage} />
                          </div>
                          <div className='organizer-brand__meta'>
                            <span className='organizer-brand__zh'>{"MIT Critical Data"}</span>
                          </div>
                        </div>
                        <span className='organizer-pair__mark' aria-hidden='true'>{"×"}</span>
                        <div className='organizer-brand organizer-brand--cma'>
                          <div className='organizer-brand__visual'>
                            <img src='/images/workshop-logos/cma-official.png' alt='Computational Media and Arts Thrust logo' className='organizer-brand__logo organizer-brand__logo--cma' onError={hideOrganizerBrandImage} />
                          </div>
                          <div className='organizer-brand__meta'>
                            <span className='organizer-brand__zh'>{"Computational Media and Arts"}</span>
                          </div>
                        </div>
                        <span className='organizer-pair__mark' aria-hidden='true'>{"×"}</span>
                        <div className='organizer-brand organizer-brand--mc2'>
                          <div className='organizer-brand__visual'>
                            <img src='/images/MC2.png' alt='MC2 logo' className='organizer-brand__logo organizer-brand__logo--mc2' onError={hideOrganizerBrandImage} />
                          </div>
                          <div className='organizer-brand__meta'>
                            <span className='organizer-brand__zh'>
                              {"MC"}
                              <sup>{"2"}</sup>
                              {" Lab"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='affiliation-group affiliation-group--is-hidden'>
                  <p className='affiliation-group__title'>{"Participating Institutions"}</p>
                  <div className='affiliation-grid affiliation-grid--participants'>
                    <article className='affiliation-tile'>
                      <div className='affiliation-tile__media affiliation-tile__media--dark'>
                        <img src='/images/UST-EN.png' alt='HKUST main campus logo' className='affiliation-tile__logo affiliation-tile__logo--participant' onError={hideAffiliationTileImage} />
                      </div>
                      <p className='affiliation-tile__name'>{"HKUST"}</p>
                    </article>
                    <article className='affiliation-tile'>
                      <div className='affiliation-tile__media affiliation-tile__media--participant'>
                        <img src='/images/workshop-logos/harvard.png' alt='Harvard University logo' className='affiliation-tile__logo affiliation-tile__logo--participant affiliation-tile__logo--participant-crest affiliation-tile__logo--participant-harvard' onError={hideAffiliationTileImage} />
                      </div>
                      <p className='affiliation-tile__name'>{"Harvard"}</p>
                    </article>
                    <article className='affiliation-tile'>
                      <div className='affiliation-tile__media affiliation-tile__media--participant'>
                        <img src='/images/workshop-logos/nus.png' alt='National University of Singapore logo' className='affiliation-tile__logo affiliation-tile__logo--participant' onError={hideAffiliationTileImage} />
                      </div>
                      <p className='affiliation-tile__name'>{"National University of Singapore"}</p>
                    </article>
                    <article className='affiliation-tile'>
                      <div className='affiliation-tile__media affiliation-tile__media--participant'>
                        <img src='/images/workshop-logos/hku.png' alt='The University of Hong Kong logo' className='affiliation-tile__logo affiliation-tile__logo--participant affiliation-tile__logo--participant-crest' onError={hideAffiliationTileImage} />
                      </div>
                      <p className='affiliation-tile__name'>{"The University of Hong Kong"}</p>
                    </article>
                    <article className='affiliation-tile'>
                      <div className='affiliation-tile__media affiliation-tile__media--participant'>
                        <img src='/images/workshop-logos/cuhk.png' alt='The Chinese University of Hong Kong logo' className='affiliation-tile__logo affiliation-tile__logo--participant' onError={hideAffiliationTileImage} />
                      </div>
                      <p className='affiliation-tile__name'>{"The Chinese University of Hong Kong"}</p>
                    </article>
                    <article className='affiliation-tile'>
                      <div className='affiliation-tile__media affiliation-tile__media--participant'>
                        <img src='/images/workshop-logos/emory.png' alt='Emory University logo' className='affiliation-tile__logo affiliation-tile__logo--participant' onError={hideAffiliationTileImage} />
                      </div>
                      <p className='affiliation-tile__name'>{"Emory University"}</p>
                    </article>
                  </div>
                </div>
              </section>
              <img className='article-cover' src='/images/20260410_ai_as_catalyst_workshop_cover.jpg' alt='HKUST(GZ) campus image for the AI as Catalyst workshop.' onError={useFallbackPhoto} />
              <div className='article-info-grid'>
                <div className='article-info-box'>
                  <span className='info-label'>{"Event Date"}</span>
                  <span className='info-value'>{"May 12, 2026"}</span>
                </div>
                <div className='article-info-box'>
                  <span className='info-label'>{"Location"}</span>
                  <span className='info-value'>{"Guangzhou, China"}</span>
                </div>
                <div className='article-info-box'>
                  <span className='info-label'>{"Format"}</span>
                  <span className='info-value'>{"Full-day workshop and panel"}</span>
                </div>
              </div>
              <p>
                <strong>{"AI as Catalyst"}</strong>
                {" is a full-day workshop taking place on May 12, 2026 at HKUST(GZ), bringing together students, educators, clinicians, and researchers to examine how artificial intelligence should be designed, evaluated, and governed in healthcare and education.\n                    "}
              </p>
              <p>{"\n                        The program combines hands-on experimentation, interdisciplinary discussion, and collaborative design. Rather than treating AI as a shortcut for efficiency, the workshop is framed around critical engagement: participants will test capabilities, examine failure modes, and discuss the social and institutional safeguards needed for responsible deployment.\n                    "}</p>
              <h4>{"Program Snapshot"}</h4>
              <div className='agenda-snapshot'>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"09:00-09:30"}</span>
                  <div>
                    <strong>{"Registration & Welcome"}</strong>
                    <p>{"Check-in."}</p>
                  </div>
                </div>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"09:30-09:45"}</span>
                  <div>
                    <strong>{"Opening Ceremony"}</strong>
                    <p>
                      {"Workshops Overview / Opening Remarks. Leads: "}
                      <a href='#speaker-pan-hui' className='agenda-speaker-link'>{"Pan Hui"}</a>
                      {" and "}
                      <a href='#speaker-leo-anthony-celi' className='agenda-speaker-link'>{"Leo Anthony Celi"}</a>
                      {"."}
                    </p>
                  </div>
                </div>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"09:45-11:05"}</span>
                  <div>
                    <strong>{"Workshop 1"}</strong>
                    <p>
                      {"The Art of Healing: Creative Arts as Pedagogical Practice. Lead: "}
                      <a href='#speaker-tengjia-zuo' className='agenda-speaker-link'>{"Tengjia Zuo"}</a>
                      {"."}
                    </p>
                  </div>
                </div>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"11:05-11:15"}</span>
                  <div>
                    <strong>{"Break"}</strong>
                    <p>{"Networking."}</p>
                  </div>
                </div>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"11:15-12:45"}</span>
                  <div>
                    <strong>{"Workshop 2"}</strong>
                    <p>
                      {"Health AI Systems Thinking for Community (HASTC). Lead: "}
                      <a href='#speaker-mornin-feng' className='agenda-speaker-link'>{"Mornin Feng"}</a>
                      {"."}
                    </p>
                  </div>
                </div>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"12:45-14:35"}</span>
                  <div>
                    <strong>
                      {"Lunch & "}
                      <a href='https://surreality.world/' target='_blank' rel='noopener noreferrer'>
                        <em>{"Surreality Exhibition"}</em>
                      </a>
                      {" Viewing"}
                    </strong>
                  </div>
                </div>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"14:35-15:35"}</span>
                  <div>
                    <strong>{"Panel Discussion"}</strong>
                    <p>
                      {"Panel Title: From Personal Agency to Systemic Safety: Real-World AI in Healthcare. Lead: "}
                      <a href='#speaker-qiushi-zhou' className='agenda-speaker-link'>{"Qiushi Zhou"}</a>
                      {"."}
                    </p>
                  </div>
                </div>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"15:35-15:55"}</span>
                  <div>
                    <strong>
                      <a href='#sponsor-wsc' className='agenda-speaker-link'>{"WSC Coffee Break"}</a>
                    </strong>
                  </div>
                </div>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"15:55-17:15"}</span>
                  <div>
                    <strong>{"Workshop 3"}</strong>
                    <p>
                      {"LLM-a-thon: From Use Case to Ground Truth. Lead: "}
                      <a href='#speaker-calvin-kalun-or' className='agenda-speaker-link'>{"Calvin K.L. Or"}</a>
                      {"."}
                    </p>
                  </div>
                </div>
                <div className='agenda-snapshot__item'>
                  <span className='agenda-snapshot__time'>{"17:15-17:30"}</span>
                  <div>
                    <strong>{"Closing"}</strong>
                    <p>
                      {"Key Takeaways / Next Steps / Wrap-Up. Leads: "}
                      <a href='#speaker-pan-hui' className='agenda-speaker-link'>{"Pan Hui"}</a>
                      {" and "}
                      <a href='#speaker-leo-anthony-celi' className='agenda-speaker-link'>{"Leo Anthony Celi"}</a>
                      {"."}
                    </p>
                  </div>
                </div>
              </div>
              <h4>{"Speakers and Organizers"}</h4>
              <p>{"\n                        The workshop features an interdisciplinary group of speakers and organizers from HKUST(GZ), HKUST, MIT, Harvard, the National University of Singapore, The University of Hong Kong, The Chinese University of Hong Kong, Emory University, and partner institutions. Click any card to expand the short biography.\n                    "}</p>
              <div className='speaker-grid-news'>
                <article className='speaker-card-news' id='speaker-pan-hui' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/pan_hui.jpg?v=20260412-2' alt='Pan Hui' className='speaker-card-news__image speaker-card-news__image--pan-hui' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Pan Hui"}</h5>
                    <p className='speaker-card-news__role'>{"Chair Professor"}</p>
                    <p className='speaker-card-news__org'>
                      {"HKUST(GZ) / MC"}
                      <sup>{"2"}</sup>
                      {" Lab"}
                    </p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"FREng (International Fellow of the Royal Academy of Engineering), IEEE Fellow, ACM Distinguished Scientist, Member of Academia Europaea, and Chair Professor of Computational Media and Arts at HKUST(GZ). His research focuses on ubiquitous computing, mobile computing, augmented/virtual reality, data science, social and mobile networks, and metaverse-related systems."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' id='speaker-leo-anthony-celi' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/leo_celi.jpg' alt='Leo Anthony Celi' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Leo Anthony Celi"}</h5>
                    <p className='speaker-card-news__role'>{"Senior Research Scientist & Associate Professor"}</p>
                    <p className='speaker-card-news__org'>{"MIT / Harvard"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Senior Research Scientist at Massachusetts Institute of Technology, Clinical Research Director of the MIT Laboratory for Computational Physiology, Co-Director of MIT Sana, Staff Physician in the Division of Pulmonary, Critical Care and Sleep Medicine at Beth Israel Deaconess Medical Center, and Part-time Associate Professor of Medicine at Harvard Medical School. His work focuses on using data science and AI to improve critical care, with particular emphasis on open clinical data and reducing bias in healthcare systems."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/Chenlei.png' alt='Lei Chen' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Lei Chen"}</h5>
                    <p className='speaker-card-news__role'>{"Dean / Chair Professor"}</p>
                    <p className='speaker-card-news__org'>{"HKUST(GZ) / Information Hub"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"ACM Fellow, IEEE Fellow, Dean of Information Hub at The Hong Kong University of Science and Technology (Guangzhou), Director of HKUST Big Data Institute, and Chair Professor in the Thrust of Data Science and Analytics and the Thrust of Artificial Intelligence at HKUST (Guangzhou). His research interests include data-driven machine learning, crowd-sourcing-based data processing, uncertain and probabilistic databases, web information management, multimedia systems, knowledge graphs, blockchain, data privacy, and spatial-temporal data management."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' id='speaker-mornin-feng' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/mornin_feng.jpg' alt='Mornin Feng' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Mornin Feng"}</h5>
                    <p className='speaker-card-news__role'>{"Associate Professor"}</p>
                    <p className='speaker-card-news__org'>{"National University of Singapore"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Associate Professor at the National University of Singapore (Saw Swee Hock School of Public Health), Director of the AI for Public Health (AI4PH) Programme, Domain Lead for Biostatistics, Modelling, AI and Data Analytics (B.MAD), Associate Professor (Joint) at the Yong Loo Lin School of Medicine, Biomedical Engineering Department, and Institute of Data Science, and Chair of the Singapore Chapter of Observational Health Data Sciences and Informatics (OHDSI). His research focuses on healthcare AI, machine learning for clinical data, and data-driven decision-making, with applications in medical imaging, treatment optimization, and clinical NLP."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' id='speaker-calvin-kalun-or' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/calvin_or.jpg' alt='Calvin Kalun Or' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Calvin Kalun Or"}</h5>
                    <p className='speaker-card-news__role'>{"Associate Professor"}</p>
                    <p className='speaker-card-news__org'>{"The University of Hong Kong"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Associate Professor and Assistant Head of Department at the The University of Hong Kong (Department of Data and Systems Engineering). His research focuses on human factors and ergonomics, human-computer interaction, and healthcare informatics, particularly the design, implementation, and evaluation of health information technologies to improve patient safety, system performance, and quality of care."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/Lowell_Ling.jpg' alt='Lowell Ling' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Lowell Ling"}</h5>
                    <p className='speaker-card-news__role'>{"Associate Professor"}</p>
                    <p className='speaker-card-news__org'>{"The Chinese University of Hong Kong"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Associate Professor in the Department of Anaesthesia and Intensive Care at the The Chinese University of Hong Kong, and Assistant Professor in the Intensive Care Unit at Prince of Wales Hospital. His research focuses on sepsis, organ dysfunction, and critical care, particularly the epidemiology of sepsis in Hong Kong and its genomic mechanisms."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/xiangliangzhang.jpg' alt='Nancy Zhang' className='speaker-card-news__image speaker-card-news__image--xianglilan' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Nancy Zhang"}</h5>
                    <p className='speaker-card-news__role'>{"Assistant Professor"}</p>
                    <p className='speaker-card-news__org'>{"The Chinese University of Hong Kong"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Assistant Professor at the Faculty of Medicine, The Chinese University of Hong Kong. Her research focuses on applying artificial intelligence and machine learning to clinical diagnosis, disease surveillance, and treatment decision support, with applications in precision medicine and critical care."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' id='speaker-qiushi-zhou' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/qiushi_zhou_20260423.png' alt='Qiushi Zhou' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Qiushi Zhou"}</h5>
                    <p className='speaker-card-news__role'>{"Assistant Professor"}</p>
                    <p className='speaker-card-news__org'>{"HKUST(GZ)"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Assistant Professor at the Hong Kong University of Science and Technology (Guangzhou), affiliated with the Thrust of Computational Media and Arts and the Thrust of Internet of Things. His research focuses on Human-Computer Interaction and Extended Reality, particularly novel interaction techniques integrating XR, AI, and IoT."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/xin_tong.jpg' alt='Xin Tong' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Xin Tong"}</h5>
                    <p className='speaker-card-news__role'>{"Assistant Professor"}</p>
                    <p className='speaker-card-news__org'>{"HKUST(GZ)"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Assistant Professor at Thrusts of Computational Media and Arts (CMA), Hong Kong University of Science and Technology (Guangzhou). She is working on human-computer interaction and human-AI collaboration, with a focus on healthcare, wellbeing, and accessibility using technologies such as VR/AR and generative AI."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' id='speaker-tengjia-zuo' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/tengjia_zuo.jpg' alt='Tengjia Zuo' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Tengjia Zuo"}</h5>
                    <p className='speaker-card-news__role'>{"Assistant Professor"}</p>
                    <p className='speaker-card-news__org'>{"HKUST(GZ)"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Assistant Professor at Computational Media and Arts, Hong Kong University of Science and Technology (Guangzhou). Her research focuses on mixed reality, serious games, and human-computer interaction, particularly game-based learning and player experience design."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/Hyunjung.jpg' alt='Hyunjung Gloria Kwak' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Hyunjung Gloria Kwak"}</h5>
                    <p className='speaker-card-news__role'>{"Assistant Professor"}</p>
                    <p className='speaker-card-news__org'>{"Emory University"}</p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Assistant Professor at Emory University's School of Nursing. Her research focuses on applying artificial intelligence and machine learning to improve clinical decision-making, with an emphasis on advancing equity and reducing health disparities in healthcare."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/james_formal.jpg' alt='James Yiming Zhu' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"James Yiming Zhu"}</h5>
                    <p className='speaker-card-news__role'>{"PhD Student"}</p>
                    <p className='speaker-card-news__org'>
                      {"HKUST(GZ) / MC"}
                      <sup>{"2"}</sup>
                      {" Lab"}
                    </p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Ph.D. candidate at the Hong Kong University of Science and Technology, affiliated with the MC² Lab. His research interests lie in social computing, data science, and natural language processing."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/yulin_yao.jpg' alt='Yulin Yao' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Yulin Yao"}</h5>
                    <p className='speaker-card-news__role'>{"PhD Student / Visual Artist"}</p>
                    <p className='speaker-card-news__org'>
                      {"HKUST(GZ) / MC"}
                      <sup>{"2"}</sup>
                      {" Lab"}
                    </p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Yulin Yao is a PhD student in Computational Media and Arts at The Hong Kong University of Science and Technology (Guangzhou) and a digital visual artist. Her work operates at the intersection of immersive storytelling, VR and HCI. Grounded in spatial design and exhibition practice across Europe and China, she creates immersive digital environments exploring technology's impact on memory, emotion, and culture. Her practice bridges computational media and visual art, treating space itself as a medium for psychological inquiry and immersive world-building."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/bianca_yang.jpg' alt='Bianca Ruoshan Yang' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Bianca Ruoshan Yang"}</h5>
                    <p className='speaker-card-news__role'>{"PhD Student / Musician"}</p>
                    <p className='speaker-card-news__org'>
                      {"HKUST(GZ) / MC"}
                      <sup>{"2"}</sup>
                      {" Lab"}
                    </p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Bianca Ruoshan Yang is a Ph.D. Student at Hong Kong University of Science and Technology, affiliated with the MC2 Lab. Her research sits at the intersection of Multimodal AI, Learning-Centered XR Design, and Intangible Cultural Heritage."}</p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/primo_formal.jpeg' alt='Primo Dongyijie Pan' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Primo Dongyijie Pan"}</h5>
                    <p className='speaker-card-news__role'>{"MPhil Student"}</p>
                    <p className='speaker-card-news__org'>
                      {"HKUST(GZ) / MC"}
                      <sup>{"2"}</sup>
                      {" Lab"}
                    </p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>
                        {"Primo's research explores how established psychotherapeutic approaches, especially cognitive behavioral therapy, can be translated into the language of human-computer interaction. He has contributed to projects including Lingolift and Virtual AI-SP, with work accepted at venues such as CHI and recognized by the China Computer Federation and the Tencent Light Foundation. In his future doctoral research, he aims to combine AI and XR with emerging lifestyle intervention methods to create new possibilities for chronic disease management. Personal homepage: "}
                        <a href='https://primopan.github.io/about/' target='_blank' rel='noopener noreferrer'>{"https://primopan.github.io/about/"}</a>
                      </p>
                    </div>
                  </div>
                </article>
                <article className='speaker-card-news' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/Boen.jpg' alt='Boen Liu' className='speaker-card-news__image' onError={useFallbackPhoto} />
                  <div className='speaker-card-news__body'>
                    <h5>{"Boen Liu"}</h5>
                    <p className='speaker-card-news__role'>{"Research Assistant"}</p>
                    <p className='speaker-card-news__org'>
                      {"HKUST(GZ) / MC"}
                      <sup>{"2"}</sup>
                      {" Lab"}
                    </p>
                    <p className='speaker-card-news__hint'>{"Click to view bio"}</p>
                    <div className='speaker-card-news__details'>
                      <p className='speaker-card-news__bio'>{"Research Assistant at MC² Lab, The Hong Kong University of Science and Technology (Guangzhou), and a student at Duke Kunshan University. His research focuses on social computing, graph learning and social network analysis."}</p>
                    </div>
                  </div>
                </article>
              </div>
              <h4>{"Three Hands-on Tracks"}</h4>
              <div className='track-grid'>
                <section className='track-card'>
                  <div className='track-card__head'>
                    <h5>{"The Art of Healing: Creative Arts as Pedagogical Practice"}</h5>
                  </div>
                  <div className='track-card__meta'>
                    <p className='track-card__lead'>
                      <strong>{"Leads:"}</strong>
                      <a href='#speaker-tengjia-zuo' className='agenda-speaker-link'>{"Tengjia Zuo"}</a>
                    </p>
                    <p className='track-card__time'>{"09:45 - 11:05 (80 minutes)"}</p>
                  </div>
                  <p className='track-card__body'>{"This session treats artistic practice not as an \"add-on\" to medical education, but as an essential way of knowing required for healing. Participants move through \"creative shifts\"—engaging in music, visual art, and narrative practices before translating those insights into educational design. Rather than producing polished curricula, the track focuses on creating pedagogical prototypes—concrete learning activities that embed creative disciplines into core medical training to cultivate capacities like deep listening, presence with suffering, and tolerance for ambiguity."}</p>
                </section>
                <section className='track-card'>
                  <div className='track-card__head'>
                    <h5>{"Health AI Systems Thinking for Community (HASTC)"}</h5>
                  </div>
                  <div className='track-card__meta'>
                    <p className='track-card__lead'>
                      <strong>{"Leads:"}</strong>
                      <a href='#speaker-mornin-feng' className='agenda-speaker-link'>{"Mornin Feng"}</a>
                    </p>
                    <p className='track-card__time'>{"11:15 - 12:45 (90 minutes)"}</p>
                  </div>
                  <p className='track-card__body'>{"This session encourages cross-disciplinary discussions and collaborative analyses of recent case studies regarding problems arising from clinical AI. Participants will critically review articles on algorithmic bias, model transparency, accountability, and unintended consequences in healthcare. Beyond identifying risks—such as data bias, hallucinations, and fairness limitations—the workshop asks teams to brainstorm and develop meaningful safeguards at the regulatory, institutional, and clinical levels to ensure technology does not exacerbate health inequities."}</p>
                </section>
                <section className='track-card'>
                  <div className='track-card__head'>
                    <h5>{"LLM-a-thon"}</h5>
                  </div>
                  <div className='track-card__meta'>
                    <p className='track-card__lead'>
                      <strong>{"Leads:"}</strong>
                      <a href='#speaker-calvin-kalun-or' className='agenda-speaker-link'>{"Calvin K.L. Or"}</a>
                    </p>
                    <p className='track-card__time'>{"15:55 - 17:15 (80 minutes)"}</p>
                  </div>
                  <p className='track-card__body'>{"This session invites participants to experiment with AI prompts and test the power of Large Language Models (LLMs) in clinical and mental health scenarios. Participants will compare responses across at least three different models to identify what is helpful, unhelpful, or risky in real-world use. A central goal is to experience LLM weaknesses firsthand, such as sycophancy bias, where systems may agree with users' leading questions rather than providing necessary medical guidance. The session culminates in an \"LLM as a Judge\" evaluation to critically analyze model safety, empathy, and advice quality."}</p>
                </section>
              </div>
              <h4>{"Venue"}</h4>
              <p>
                {"\n                        The workshop will be held at "}
                <strong>{"The Hong Kong University of Science and Technology (Guangzhou)"}</strong>
                {", 1 Duxue Road, Nansha District, Guangzhou, Guangdong, China. The event rooms are E4 1F 101 and E4 1F 102.\n                    "}
              </p>
              <p>{"\n                        By bringing healthcare, education, HCI, and AI governance into the same conversation, AI as Catalyst positions the campus as a space for practical experimentation, critical reflection, and cross-disciplinary collaboration around responsible AI.\n                    "}</p>
              <section className='sponsor-showcase sponsor-showcase--after-venue' aria-label='Workshop sponsors'>
                <div className='sponsor-showcase__intro'>
                  <span className='sponsor-showcase__eyebrow'>{"With Thanks to Our Sponsors"}</span>
                  <p className='sponsor-showcase__deck'>{"We gratefully acknowledge two technology companies whose support helps make this workshop possible."}</p>
                </div>
                <div className='sponsor-grid'>
                  <article className='sponsor-card'>
                    <div className='sponsor-card__header'>
                      <div className='sponsor-card__logo-frame'>
                        <img src='/images/workshop-sponsors/qingsong-health-logo.jpg' alt='QingSong Health Corporation logo' className='sponsor-card__logo sponsor-card__logo--qingsong' />
                      </div>
                      <div className='sponsor-card__heading'>
                        <h5>{"QingSong Health Corporation"}</h5>
                        <p className='sponsor-card__lead'>{"Founded in 2014, QingSong Health Corporation (HKEX: 02661.HK) is a leading one-stop health technology platform in China, specializing in integrated healthcare services and health insurance solutions. Leveraging its strengths in health education scenarios, industrial ecosystem synergy, and a continuously evolving technical framework, the Group builds a digital health service system driven by Artificial Intelligence to address users' needs across their entire life cycle."}</p>
                      </div>
                    </div>
                    <p>{"In terms of AI capability building, QingSong Health Corporation has established a full-stack technical ecosystem centered on its proprietary technology stack \"Alcare\" and its foundational medical health large language model \"Dr.GPT.\" This system covers critical scenarios such as health literacy, medical research, clinical decision-making, insurance services, and corporate health management, driving the evolution of health services from \"information connectivity\" to \"intelligent decision-making.\""}</p>
                    <p>{"Recently, the Group launched the evidence-based medicine AI agent \"ZhengYuanFang\" and unveiled the industry's first AI skills store, the ZhengYuanFang MedClaw Skills Store. By integrating massive volumes of authoritative medical literature and clinical guidelines, the platform upgrades evidence-based medicine from a traditional \"expert-experience-driven\" model to an \"intelligent-invocation-driven\" model. This provides doctors with more efficient and traceable clinical decision support, steering the healthcare service system toward greater standardization and intelligence."}</p>
                  </article>
                  <article className='sponsor-card' id='sponsor-wsc'>
                    <div className='sponsor-card__header'>
                      <div className='sponsor-card__logo-frame'>
                        <img src='/images/workshop-sponsors/wsc-holding-logo.jpg' alt='WSC HOLDING LIMITED logo' className='sponsor-card__logo sponsor-card__logo--wsc' />
                      </div>
                      <div className='sponsor-card__heading'>
                        <h5>{"WSC HOLDING LIMITED"}</h5>
                        <p className='sponsor-card__lead'>{"WSC HOLDING LIMITED is a dynamic biotechnology startup driven by a grand vision to revolutionize global healthcare. We are committed to developing innovative solutions across two strategic pillars: pioneering dental products and a holistic healthy aging platform. By forging strategic partnerships with world-renowned universities, we leverage cutting-edge biotechnology to create precise, high-efficiency medical solutions aimed at elevating human health standards and enhancing quality of life."}</p>
                      </div>
                    </div>
                    <p>{"Our dental project is currently in the early feasibility research stage, with the goal of developing a breakthrough product that redefines industry standards. Concurrently, our integrated healthy aging platform empowers individuals to maintain cardiovascular and bone health while optimizing daily habits through continuous monitoring and multi-modal interventions. Our mission is to enable people to remain vibrant throughout their lives, meeting the sophisticated demands for refined health management in the new consumer era."}</p>
                  </article>
                </div>
              </section>
              <h4>{"Registration"}</h4>
              <div className='registration-panel'>
                <div className='registration-panel__content'>
                  <p className='registration-panel__lead'>{"Please complete the registration form if you plan to attend the workshop."}</p>
                  <a className='registration-panel__link' href='https://forms.gle/h9GphSJ8dzZkESZ17' target='_blank' rel='noopener noreferrer'>{"Open registration form"}</a>
                  <p className='registration-panel__subtext'>{"You can also scan the QR code to register on mobile."}</p>
                </div>
                <a className='registration-panel__qr' href='https://forms.gle/h9GphSJ8dzZkESZ17' target='_blank' rel='noopener noreferrer' aria-label='Open the registration form'>
                  <img src='/images/workshop/ai_as_catalyst_registration_qr.png' alt='QR code for the AI as Catalyst workshop registration form.' />
                </a>
              </div>
              <a className='back-news-link' href='/news' target='_top' rel='noopener noreferrer'>{"← Back to News"}</a>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
