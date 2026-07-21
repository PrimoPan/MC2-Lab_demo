import { hideAffiliationTileImage, hideOrganizerBrandImage, useFallbackPhoto } from './workshopImageHandlers';
import { workshopClass } from './workshopStyles';

export default function ChineseWorkshopArticle(): JSX.Element {
  return (
    <div className={workshopClass('news-section workshop-locale-zh')}>
      <div className={workshopClass('container')}>
        <div className={workshopClass('row justify-content-center')}>
          <div className={workshopClass('col-12 pt-[100px]! text-center text-white!')}>
            <h3>{"新闻"}</h3>
          </div>
          <div className={workshopClass('col-lg-10 mt-4 mb-5')}>
            <article className={workshopClass('news-article-card')}>
              <h2 className={workshopClass('article-title')}>{"AI as Catalyst 工作坊将在香港科技大学（广州）聚焦 AI 与医疗、教育的交汇"}</h2>
              <p className={workshopClass('article-meta')}>
                <strong>{"发布日期："}</strong>
                {"2026年4月10日"}
              </p>
              <section className={workshopClass('affiliation-showcase')} aria-label='工作坊组织机构与参与机构'>
                <div className={workshopClass('affiliation-group')}>
                  <p className={workshopClass('affiliation-group__title')}>{"组织机构"}</p>
                  <div className={workshopClass('organizer-lockup')}>
                    <div className={workshopClass('organizer-lockup__row organizer-lockup__row--single')}>
                      <div className={workshopClass('organizer-pair organizer-pair--schools')}>
                        <div className={workshopClass('organizer-brand organizer-brand--mit')}>
                          <div className={workshopClass('organizer-brand__visual')}>
                            <img src='https://1000logos.net/wp-content/uploads/2026/01/MIT-logo.png' alt='麻省理工学院标识' className={workshopClass('organizer-brand__logo organizer-brand__logo--mit')} />
                          </div>
                          <div className={workshopClass('organizer-brand__meta')}>
                            <span className={workshopClass('organizer-brand__zh')}>{"麻省理工学院"}</span>
                            <span className={workshopClass('organizer-brand__en')}>{"MIT"}</span>
                          </div>
                        </div>
                        <span className={workshopClass('organizer-pair__mark')} aria-hidden='true'>{"×"}</span>
                        <div className={workshopClass('organizer-brand organizer-brand--hkustgz')}>
                          <div className={workshopClass('organizer-brand__visual')}>
                            <img src='/images/UST-GZ-EN.png' alt='香港科技大学（广州）标识' className={workshopClass('organizer-brand__logo organizer-brand__logo--hkustgz')} onError={hideOrganizerBrandImage} />
                          </div>
                          <div className={workshopClass('organizer-brand__meta')}>
                            <span className={workshopClass('organizer-brand__zh')}>{"香港科技大学（广州）"}</span>
                            <span className={workshopClass('organizer-brand__en')}>{"HKUST(GZ)"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={workshopClass('organizer-lockup__row organizer-lockup__row--single')}>
                      <div className={workshopClass('organizer-pair organizer-pair--institutions')}>
                        <div className={workshopClass('organizer-brand organizer-brand--critical-data')}>
                          <div className={workshopClass('organizer-brand__visual')}>
                            <img src='https://criticaldatathon.github.io/static/img/logo.svg' alt='MIT Critical Data 标识' className={workshopClass('organizer-brand__logo organizer-brand__logo--critical-data')} onError={hideOrganizerBrandImage} />
                          </div>
                          <div className={workshopClass('organizer-brand__meta')}>
                            <span className={workshopClass('organizer-brand__zh')}>{"MIT 关键数据项目"}</span>
                            <span className={workshopClass('organizer-brand__en')}>{"MIT Critical Data"}</span>
                          </div>
                        </div>
                        <span className={workshopClass('organizer-pair__mark')} aria-hidden='true'>{"×"}</span>
                        <div className={workshopClass('organizer-brand organizer-brand--cma')}>
                          <div className={workshopClass('organizer-brand__visual')}>
                            <img src='/images/workshop-logos/cma-official.png' alt='计算媒体与艺术学域标识' className={workshopClass('organizer-brand__logo organizer-brand__logo--cma')} onError={hideOrganizerBrandImage} />
                          </div>
                          <div className={workshopClass('organizer-brand__meta')}>
                            <span className={workshopClass('organizer-brand__zh')}>{"计算媒体与艺术学域"}</span>
                            <span className={workshopClass('organizer-brand__en')}>{"Computational Media and Arts"}</span>
                          </div>
                        </div>
                        <span className={workshopClass('organizer-pair__mark')} aria-hidden='true'>{"×"}</span>
                        <div className={workshopClass('organizer-brand organizer-brand--mc2')}>
                          <div className={workshopClass('organizer-brand__visual')}>
                            <img src='/images/MC2.png' alt='元宇宙与计算创意中心（MC²）标识' className={workshopClass('organizer-brand__logo organizer-brand__logo--mc2')} onError={hideOrganizerBrandImage} />
                          </div>
                          <div className={workshopClass('organizer-brand__meta')}>
                            <span className={workshopClass('organizer-brand__zh')}>
                              {"元宇宙与计算创意中心（MC"}
                              <sup>{"2"}</sup>
                              {"）"}
                            </span>
                            <span className={workshopClass('organizer-brand__en')}>
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
                <div className={workshopClass('affiliation-group affiliation-group--is-hidden')}>
                  <p className={workshopClass('affiliation-group__title')}>{"参与机构"}</p>
                  <div className={workshopClass('affiliation-grid affiliation-grid--participants')}>
                    <article className={workshopClass('affiliation-tile')}>
                      <div className={workshopClass('affiliation-tile__media affiliation-tile__media--dark')}>
                        <img src='/images/UST-EN.png' alt='香港科技大学校徽' className={workshopClass('affiliation-tile__logo affiliation-tile__logo--participant')} onError={hideAffiliationTileImage} />
                      </div>
                      <p className={workshopClass('affiliation-tile__name')}>{"香港科技大学"}</p>
                    </article>
                    <article className={workshopClass('affiliation-tile')}>
                      <div className={workshopClass('affiliation-tile__media affiliation-tile__media--participant')}>
                        <img src='/images/workshop-logos/harvard.png' alt='哈佛大学校徽' className={workshopClass('affiliation-tile__logo affiliation-tile__logo--participant affiliation-tile__logo--participant-crest affiliation-tile__logo--participant-harvard')} onError={hideAffiliationTileImage} />
                      </div>
                      <p className={workshopClass('affiliation-tile__name')}>{"哈佛大学"}</p>
                    </article>
                    <article className={workshopClass('affiliation-tile')}>
                      <div className={workshopClass('affiliation-tile__media affiliation-tile__media--participant')}>
                        <img src='/images/workshop-logos/nus.png' alt='新加坡国立大学校徽' className={workshopClass('affiliation-tile__logo affiliation-tile__logo--participant')} onError={hideAffiliationTileImage} />
                      </div>
                      <p className={workshopClass('affiliation-tile__name')}>{"新加坡国立大学"}</p>
                    </article>
                    <article className={workshopClass('affiliation-tile')}>
                      <div className={workshopClass('affiliation-tile__media affiliation-tile__media--participant')}>
                        <img src='/images/workshop-logos/hku.png' alt='香港大学校徽' className={workshopClass('affiliation-tile__logo affiliation-tile__logo--participant affiliation-tile__logo--participant-crest')} onError={hideAffiliationTileImage} />
                      </div>
                      <p className={workshopClass('affiliation-tile__name')}>{"香港大学"}</p>
                    </article>
                    <article className={workshopClass('affiliation-tile')}>
                      <div className={workshopClass('affiliation-tile__media affiliation-tile__media--participant')}>
                        <img src='/images/workshop-logos/cuhk.png' alt='香港中文大学校徽' className={workshopClass('affiliation-tile__logo affiliation-tile__logo--participant')} onError={hideAffiliationTileImage} />
                      </div>
                      <p className={workshopClass('affiliation-tile__name')}>{"香港中文大学"}</p>
                    </article>
                    <article className={workshopClass('affiliation-tile')}>
                      <div className={workshopClass('affiliation-tile__media affiliation-tile__media--participant')}>
                        <img src='/images/workshop-logos/emory.png' alt='埃默里大学校徽' className={workshopClass('affiliation-tile__logo affiliation-tile__logo--participant')} onError={hideAffiliationTileImage} />
                      </div>
                      <p className={workshopClass('affiliation-tile__name')}>{"埃默里大学"}</p>
                    </article>
                  </div>
                </div>
              </section>
              <img className={workshopClass('article-cover')} src='/images/20260410_ai_as_catalyst_workshop_cover.jpg' alt='AI as Catalyst 工作坊香港科技大学（广州）校园配图。' onError={useFallbackPhoto} />
              <div className={workshopClass('article-info-grid')}>
                <div className={workshopClass('article-info-box')}>
                  <span className={workshopClass('info-label')}>{"活动日期"}</span>
                  <span className={workshopClass('info-value')}>{"2026年5月12日"}</span>
                </div>
                <div className={workshopClass('article-info-box')}>
                  <span className={workshopClass('info-label')}>{"地点"}</span>
                  <span className={workshopClass('info-value')}>{"中国广州"}</span>
                </div>
                <div className={workshopClass('article-info-box')}>
                  <span className={workshopClass('info-label')}>{"形式"}</span>
                  <span className={workshopClass('info-value')}>{"全天工作坊与圆桌讨论"}</span>
                </div>
              </div>
              <p>
                <strong>{"AI as Catalyst"}</strong>
                {" 将于 2026 年 5 月 12 日在香港科技大学（广州）举行。这是一场面向学生、教育者、临床工作者与研究者的全天工作坊，聚焦人工智能在医疗与教育中的设计、评估、应用与治理。\n                    "}
              </p>
              <p>{"\n                        整场活动将动手实验、跨学科讨论与协作式设计结合在一起。它并不把 AI 视作单纯提升效率的工具，而是强调批判性参与：参与者既要测试能力边界，也要识别失效情境，并进一步讨论在真实部署前所需的社会与制度保障。\n                    "}</p>
              <h4>{"议程速览"}</h4>
              <div className={workshopClass('agenda-snapshot')}>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"09:00-09:30"}</span>
                  <div>
                    <strong>{"签到与欢迎"}</strong>
                    <p>{"签到入座。"}</p>
                  </div>
                </div>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"09:30-09:45"}</span>
                  <div>
                    <strong>{"开幕式"}</strong>
                    <p>
                      {"工作坊概览 / 欢迎致辞。主持："}
                      <a href='#speaker-pan-hui' className={workshopClass('agenda-speaker-link')}>{"Pan Hui"}</a>
                      {" 与 "}
                      <a href='#speaker-leo-anthony-celi' className={workshopClass('agenda-speaker-link')}>{"Leo Anthony Celi"}</a>
                      {"。"}
                    </p>
                  </div>
                </div>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"09:45-11:05"}</span>
                  <div>
                    <strong>{"工作坊一"}</strong>
                    <p>
                      {"治愈的艺术：作为教学实践的创意艺术。主讲："}
                      <a href='#speaker-tengjia-zuo' className={workshopClass('agenda-speaker-link')}>{"Tengjia Zuo"}</a>
                      {"。"}
                    </p>
                  </div>
                </div>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"11:05-11:15"}</span>
                  <div>
                    <strong>{"中场休息"}</strong>
                    <p>{"交流。"}</p>
                  </div>
                </div>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"11:15-12:45"}</span>
                  <div>
                    <strong>{"工作坊二"}</strong>
                    <p>
                      {"面向社群的健康 AI 系统思维（HASTC）。主讲："}
                      <a href='#speaker-mornin-feng' className={workshopClass('agenda-speaker-link')}>{"Mornin Feng"}</a>
                      {"。"}
                    </p>
                  </div>
                </div>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"12:45-14:35"}</span>
                  <div>
                    <strong>
                      {"午餐与"}
                      <a href='https://surreality.world/' target='_blank' rel='noopener noreferrer'>
                        <em>{"Surreality元宇宙艺术展"}</em>
                      </a>
                      {"参观"}
                    </strong>
                    <p>{"午餐与艺术展参观。"}</p>
                  </div>
                </div>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"14:35-15:35"}</span>
                  <div>
                    <strong>{"座谈会"}</strong>
                    <p>
                      {"座谈题目：从个人能动性到系统性安全：医疗领域的真实 AI 实践。主持："}
                      <a href='#speaker-qiushi-zhou' className={workshopClass('agenda-speaker-link')}>{"Qiushi Zhou"}</a>
                      {"。"}
                    </p>
                  </div>
                </div>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"15:35-15:55"}</span>
                  <div>
                    <strong>
                      <a href='#sponsor-wsc' className={workshopClass('agenda-speaker-link')}>{"WSC 冠名茶歇"}</a>
                    </strong>
                  </div>
                </div>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"15:55-17:15"}</span>
                  <div>
                    <strong>{"工作坊三"}</strong>
                    <p>
                      {"LLM-a-thon：从使用场景到事实校验。主讲："}
                      <a href='#speaker-calvin-kalun-or' className={workshopClass('agenda-speaker-link')}>{"Calvin K.L. Or"}</a>
                      {"。"}
                    </p>
                  </div>
                </div>
                <div className={workshopClass('agenda-snapshot__item')}>
                  <span className={workshopClass('agenda-snapshot__time')}>{"17:15-17:30"}</span>
                  <div>
                    <strong>{"闭幕式"}</strong>
                    <p>
                      {"关键收获 / 后续安排 / 总结。主持："}
                      <a href='#speaker-pan-hui' className={workshopClass('agenda-speaker-link')}>{"Pan Hui"}</a>
                      {" 与 "}
                      <a href='#speaker-leo-anthony-celi' className={workshopClass('agenda-speaker-link')}>{"Leo Anthony Celi"}</a>
                      {"。"}
                    </p>
                  </div>
                </div>
              </div>
              <h4>{"主讲人与组织者"}</h4>
              <p>{"\n                        本次工作坊邀请了来自香港科技大学（广州）、香港科技大学、麻省理工学院、哈佛大学、新加坡国立大学、香港大学、香港中文大学、埃默里大学及相关合作机构的主讲人与组织者。点击任意卡片即可展开查看人物简介。\n                    "}</p>
              <div className={workshopClass('speaker-grid-news')}>
                <article className={workshopClass('speaker-card-news')} id='speaker-pan-hui' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/pan_hui.jpg?v=20260412-2' alt='Pan Hui' className={workshopClass('speaker-card-news__image speaker-card-news__image--pan-hui')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Pan Hui"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"讲席教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>
                      {"香港科技大学（广州） / 元宇宙与计算创意中心（MC"}
                      <sup>{"2"}</sup>
                      {"）"}
                    </p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"英国皇家工程院国际院士、IEEE Fellow、ACM Distinguished Scientist、欧洲科学院院士，现任香港科技大学（广州）计算媒体与艺术讲席教授。他的研究聚焦于普适计算、移动计算、增强/虚拟现实、数据科学、社交与移动网络，以及元宇宙相关系统。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} id='speaker-leo-anthony-celi' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/leo_celi.jpg' alt='Leo Anthony Celi' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Leo Anthony Celi"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"高级研究科学家 / 副教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"麻省理工学院 / 哈佛大学"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现任麻省理工学院高级研究科学家、MIT 计算生理学实验室临床研究主任、MIT Sana 联合主任、Beth Israel Deaconess Medical Center 肺与危重症科医生，并兼任哈佛医学院医学副教授。他的工作聚焦于利用数据科学与人工智能改进重症医疗，尤其关注开放临床数据以及减少医疗系统中的偏差。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/Chenlei.png' alt='Lei Chen' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Lei Chen"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"信息枢纽院长 / 讲席教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"香港科技大学（广州） / 信息枢纽"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"陈雷现任香港科技大学（广州）信息枢纽院长、香港科技大学大数据研究所所长，并在数据科学与分析学域及人工智能学域担任讲席教授。他是 ACM Fellow、IEEE Fellow。其研究兴趣包括数据驱动的机器学习、基于众包的数据处理、不确定与概率数据库、Web 信息管理、多媒体系统、知识图谱、区块链、数据隐私以及时空数据管理。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} id='speaker-mornin-feng' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/mornin_feng.jpg' alt='Mornin Feng' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Mornin Feng"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"副教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"新加坡国立大学"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现任新加坡国立大学 Saw Swee Hock 公共卫生学院副教授、AI for Public Health（AI4PH）项目主任、生物统计、建模、AI 与数据分析（B.MAD）领域负责人，并兼任杨潞龄医学院、生物医学工程系与数据科学研究所副教授，以及 OHDSI 新加坡分会主席。他的研究聚焦于健康医疗 AI、临床数据机器学习与数据驱动决策，应用涵盖医学影像、治疗优化与临床自然语言处理。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} id='speaker-calvin-kalun-or' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/calvin_or.jpg' alt='Calvin Kalun Or' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Calvin Kalun Or"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"副教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"香港大学"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现任香港大学数据与系统工程学系副教授兼副系主任。他的研究聚焦于人因工程、人机交互与医疗信息学，特别关注如何通过健康信息技术的设计、实施与评估提升患者安全、系统表现与医疗服务质量。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/Lowell_Ling.jpg' alt='Lowell Ling' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Lowell Ling"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"副教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"香港中文大学"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现任香港中文大学麻醉与深切治疗学系副教授，并于威尔斯亲王医院深切治疗部担任助理教授。他的研究聚焦于脓毒症、器官功能障碍与重症医学，尤其关注香港地区脓毒症的流行病学及其基因组机制。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/xiangliangzhang.jpg' alt='Nancy Zhang' className={workshopClass('speaker-card-news__image speaker-card-news__image--xianglilan')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Nancy Zhang"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"助理教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"香港中文大学"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现任香港中文大学医学院助理教授。她的研究聚焦于将人工智能与机器学习应用于临床诊断、疾病监测与治疗决策支持，在精准医疗和重症医学等方向开展研究。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} id='speaker-qiushi-zhou' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/qiushi_zhou_20260423.png' alt='Qiushi Zhou' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Qiushi Zhou"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"助理教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"香港科技大学（广州）"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现任香港科技大学（广州）助理教授，隶属计算媒体与艺术学域及物联网学域。他的研究聚焦于人机交互与扩展现实，尤其关注 XR、AI 与 IoT 融合下的新型交互技术。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/xin_tong.jpg' alt='Xin Tong' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Xin Tong"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"助理教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"香港科技大学（广州）"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现任香港科技大学（广州）计算媒体与艺术学域助理教授。她主要从事人机交互与人机协作研究，关注医疗、福祉与无障碍等议题，并探索 VR/AR 与生成式 AI 等技术在这些场景中的应用。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} id='speaker-tengjia-zuo' tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/tengjia_zuo.jpg' alt='Tengjia Zuo' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Tengjia Zuo"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"助理教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"香港科技大学（广州）"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现任香港科技大学（广州）计算媒体与艺术学域助理教授。她的研究聚焦于混合现实、严肃游戏与人机交互，特别关注游戏化学习与玩家体验设计。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/Hyunjung.jpg' alt='Hyunjung Gloria Kwak' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Hyunjung Gloria Kwak"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"助理教授"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>{"埃默里大学"}</p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现任埃默里大学护理学院助理教授。她的研究聚焦于利用人工智能与机器学习提升临床决策质量，尤其关注公平性推进与医疗健康差异的缩减。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/james_formal.jpg' alt='James Yiming Zhu' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"James Yiming Zhu"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"博士生"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>
                      {"香港科技大学（广州） / 元宇宙与计算创意中心（MC"}
                      <sup>{"2"}</sup>
                      {"）"}
                    </p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现为香港科技大学（广州）博士生，并隶属于元宇宙与计算创意中心（MC²）。他的研究兴趣主要包括社会计算、数据科学与自然语言处理。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/yulin_yao.jpg' alt='Yulin Yao' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Yulin Yao"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"博士生 / 视觉艺术家"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>
                      {"香港科技大学（广州） / 元宇宙与计算创意中心（MC"}
                      <sup>{"2"}</sup>
                      {"）"}
                    </p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"Yulin Yao 是香港科技大学（广州）计算媒体与艺术方向博士生，同时也是一名数字视觉艺术家。她的工作位于沉浸式叙事、VR 与 HCI 的交叉处。基于其在欧洲与中国长期积累的空间设计和展览实践，她创作沉浸式数字环境，探索技术如何影响记忆、情感与文化。她的实践连接计算媒体与视觉艺术，并将空间本身视为心理探询与沉浸式世界构建的媒介。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/bianca_yang.jpg' alt='Bianca Ruoshan Yang' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Bianca Ruoshan Yang"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"博士生 / 音乐人"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>
                      {"香港科技大学（广州） / 元宇宙与计算创意中心（MC"}
                      <sup>{"2"}</sup>
                      {"）"}
                    </p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"Bianca Ruoshan Yang 是香港科技大学（广州）博士生，隶属于元宇宙与计算创意中心（MC²）。她的研究位于多模态 AI、以学习为中心的 XR 设计，以及非物质文化遗产的交叉地带。"}</p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/Team_Profile_Pic/primo_formal.jpeg' alt='Primo Dongyijie Pan' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Primo Dongyijie Pan"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"MPhil Student"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>
                      {"香港科技大学（广州） / 元宇宙与计算创意中心（MC"}
                      <sup>{"2"}</sup>
                      {"）"}
                    </p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>
                        {"Primo 的研究关注如何将现有心理治疗技术，尤其是认知行为疗法，转译为人机交互的语言。他参与开发的 Lingolift、Virtual AI-SP 等项目已在 CHI 等会议发表，并获得中国计算机学会和腾讯 Light 基金会的认可与奖励。面向博士阶段的研究，他希望推动 AI、XR 等技术与前沿生活干预方法结合，为慢病管理带来更多可能。个人主页："}
                        <a href='https://primopan.github.io/about/' target='_blank' rel='noopener noreferrer'>{"https://primopan.github.io/about/"}</a>
                      </p>
                    </div>
                  </div>
                </article>
                <article className={workshopClass('speaker-card-news')} tabIndex={0} role='button' aria-expanded='false'>
                  <img src='/images/workshop-speakers/Boen.jpg' alt='Boen Liu' className={workshopClass('speaker-card-news__image')} onError={useFallbackPhoto} />
                  <div className={workshopClass('speaker-card-news__body')}>
                    <h5>{"Boen Liu"}</h5>
                    <p className={workshopClass('speaker-card-news__role')}>{"Research Assistant"}</p>
                    <p className={workshopClass('speaker-card-news__org')}>
                      {"香港科技大学（广州） / 元宇宙与计算创意中心（MC"}
                      <sup>{"2"}</sup>
                      {"）"}
                    </p>
                    <p className={workshopClass('speaker-card-news__hint')}>{"点击查看简介"}</p>
                    <div className={workshopClass('speaker-card-news__details')}>
                      <p className={workshopClass('speaker-card-news__bio')}>{"现于香港科技大学（广州）元宇宙与计算创意中心（MC²）担任研究助理，并就读于昆山杜克大学。他的研究聚焦于社会计算、图学习与社交网络分析。"}</p>
                    </div>
                  </div>
                </article>
              </div>
              <h4>{"三条实践工作坊主线"}</h4>
              <div className={workshopClass('track-grid')}>
                <section className={workshopClass('track-card')}>
                  <div className={workshopClass('track-card__head')}>
                    <h5>{"治愈的艺术：创意艺术作为教学实践"}</h5>
                  </div>
                  <div className={workshopClass('track-card__meta')}>
                    <p className={workshopClass('track-card__lead')}>
                      <strong>{"主讲："}</strong>
                      <a href='#speaker-tengjia-zuo' className={workshopClass('agenda-speaker-link')}>{"Tengjia Zuo"}</a>
                    </p>
                    <p className={workshopClass('track-card__time')}>{"09:45 - 11:05（80分钟）"}</p>
                  </div>
                  <p className={workshopClass('track-card__body')}>{"本场工作坊并不将艺术实践视为医学教育中的“附加项”，而是将其理解为疗愈所必需的一种根本性认知方式。参与者将经历一系列“创造性转向”——先投入音乐、视觉艺术与叙事实践，再把这些体验与洞见转化为教育设计。与其着手打磨一套完整成熟的课程方案，这一环节更强调产出教学原型：即把创意学科嵌入核心医学训练的具体学习活动，以培养深度倾听、与痛苦同在，以及面对不确定性的能力。"}</p>
                </section>
                <section className={workshopClass('track-card')}>
                  <div className={workshopClass('track-card__head')}>
                    <h5>{"面向社群的健康 AI 系统思维（HASTC）"}</h5>
                  </div>
                  <div className={workshopClass('track-card__meta')}>
                    <p className={workshopClass('track-card__lead')}>
                      <strong>{"主讲："}</strong>
                      <a href='#speaker-mornin-feng' className={workshopClass('agenda-speaker-link')}>{"Mornin Feng"}</a>
                    </p>
                    <p className={workshopClass('track-card__time')}>{"11:15 - 12:45（90分钟）"}</p>
                  </div>
                  <p className={workshopClass('track-card__body')}>{"本场工作坊鼓励围绕近期临床 AI 案例中暴露的问题，展开跨学科讨论与协作分析。参与者将批判性审阅有关算法偏见、模型透明性、问责机制以及医疗场景中非预期后果的相关文章。除了识别风险——例如数据偏差、模型幻觉与公平性局限——工作坊还将邀请各小组从监管、机构与临床多个层面共同构思并提出切实可行的防护机制，确保技术不会进一步加剧健康不平等。"}</p>
                </section>
                <section className={workshopClass('track-card')}>
                  <div className={workshopClass('track-card__head')}>
                    <h5>{"LLM-a-thon"}</h5>
                  </div>
                  <div className={workshopClass('track-card__meta')}>
                    <p className={workshopClass('track-card__lead')}>
                      <strong>{"主讲："}</strong>
                      <a href='#speaker-calvin-kalun-or' className={workshopClass('agenda-speaker-link')}>{"Calvin K.L. Or"}</a>
                    </p>
                    <p className={workshopClass('track-card__time')}>{"15:55 - 17:15（80分钟）"}</p>
                  </div>
                  <p className={workshopClass('track-card__body')}>{"本场工作坊邀请参与者围绕 AI 提示词展开实验，并在临床与心理健康情境中测试大语言模型（LLMs）的能力。参与者将比较至少三种不同模型的回答，以识别哪些输出在真实应用中有帮助、无帮助或存在风险。一个核心目标，是让参与者亲身体验 LLM 的局限性，例如“迎合性偏差”（sycophancy bias）：系统可能顺着用户带有倾向性的提问附和，而不是提供必要的医疗指引。最后，本场环节将以“LLM as a Judge”评估收束，从模型安全性、共情能力与建议质量等维度展开批判性分析。"}</p>
                </section>
              </div>
              <h4>{"举办地点"}</h4>
              <p>
                {"\n                        活动将在"}
                <strong>{"香港科技大学（广州）"}</strong>
                {"举行，地址为中国广东省广州市南沙区笃学路1号，具体活动教室为 E4 1F 101 和 E4 1F 102。\n                    "}
              </p>
              <p>{"\n                        通过把医疗、教育、人机交互与 AI 治理放进同一个讨论现场，AI as Catalyst 也把校园变成了一个用于实践检验、批判反思与跨学科协作的空间，让“负责任 AI”不只停留在口号层面，而进入具体方法与真实场景。\n                    "}</p>
              <section className={workshopClass('sponsor-showcase sponsor-showcase--after-venue')} aria-label='工作坊赞助支持'>
                <div className={workshopClass('sponsor-showcase__intro')}>
                  <span className={workshopClass('sponsor-showcase__eyebrow')}>{"鸣谢赞助支持"}</span>
                  <p className={workshopClass('sponsor-showcase__deck')}>{"感谢两家科技企业对本次工作坊的支持，使这一跨学科交流与实践活动得以顺利开展。"}</p>
                </div>
                <div className={workshopClass('sponsor-grid')}>
                  <article className={workshopClass('sponsor-card')}>
                    <div className={workshopClass('sponsor-card__header')}>
                      <div className={workshopClass('sponsor-card__logo-frame')}>
                        <img src='/images/workshop-sponsors/qingsong-health-logo.jpg' alt='轻松健康集团标识' className={workshopClass('sponsor-card__logo sponsor-card__logo--qingsong')} />
                      </div>
                      <div className={workshopClass('sponsor-card__heading')}>
                        <h5>{"轻松健康集团"}</h5>
                        <p className={workshopClass('sponsor-card__lead')}>{"轻松健康集团（港股代码：02661.HK）成立于 2014 年，是国内领先的一站式健康科技平台，专注于提供综合健康服务与健康保险解决方案。依托健康教育场景优势、产业生态协同能力与持续迭代的技术体系，集团围绕用户全生命周期健康需求，持续构建以人工智能为核心驱动力的数字健康服务体系。"}</p>
                      </div>
                    </div>
                    <p>{"在 AI 能力建设方面，轻松健康集团形成了以自研技术栈“Alcare”和医疗健康基座大模型“Dr.GPT”为核心的全链路技术体系，覆盖健康科普、医学研究、临床决策、保险服务及企业健康管理等多个关键场景，推动健康服务从“信息连接”向“智能决策”升级。"}</p>
                    <p>{"近期，集团推出循证医学智能体“证元芳”，并发布医疗行业首个 AI 技能商店——证元芳 MedClaw Skills Store。通过整合海量权威医学文献与临床指南，将循证医学能力从传统“专家经验驱动”，升级为“智能调用驱动”，为医生提供更加高效、可溯源的临床决策支持，推动医疗服务体系向标准化、智能化迈进。"}</p>
                  </article>
                  <article className={workshopClass('sponsor-card')} id='sponsor-wsc'>
                    <div className={workshopClass('sponsor-card__header')}>
                      <div className={workshopClass('sponsor-card__logo-frame')}>
                        <img src='/images/workshop-sponsors/wsc-holding-logo.jpg' alt='WSC控股有限公司标识' className={workshopClass('sponsor-card__logo sponsor-card__logo--wsc')} />
                      </div>
                      <div className={workshopClass('sponsor-card__heading')}>
                        <h5>{"WSC控股有限公司（WSC HOLDING LIMITED）"}</h5>
                        <p className={workshopClass('sponsor-card__lead')}>{"WSC控股有限公司（WSC HOLDING LIMITED）是一家充满活力的生物科技初创公司，怀揣着为全球医疗健康事业带来革新性改变的宏伟愿景，致力于在两大关键领域开发创新解决方案：创新牙科产品和整体健康老龄化平台。我们正通过与世界知名大学的战略合作推进这些重点项目，运用前沿的生物技术，开发精准、高效的医疗解决方案，以提升人类健康水准，改善人们生活品质。"}</p>
                      </div>
                    </div>
                    <p>{"我们的牙科项目目前正处于早期可行性研究阶段，目标是开发一款突破性的新产品。与此同时，我们的综合健康老龄化平台通过持续监测和多模式干预，帮助人们维护心血管与骨骼健康、优化日常习惯，让人们能够终身保持活力，满足新消费时代下精细化健康管理需求。"}</p>
                  </article>
                </div>
              </section>
              <h4>{"报名方式"}</h4>
              <div className={workshopClass('registration-panel')}>
                <div className={workshopClass('registration-panel__content')}>
                  <p className={workshopClass('registration-panel__lead')}>{"如计划参加本次工作坊，请填写报名问卷完成登记。"}</p>
                  <a className={workshopClass('registration-panel__link')} href='https://forms.gle/h9GphSJ8dzZkESZ17' target='_blank' rel='noopener noreferrer'>{"打开报名问卷"}</a>
                  <p className={workshopClass('registration-panel__subtext')}>{"也可以直接扫描二维码，在手机上完成报名。"}</p>
                </div>
                <a className={workshopClass('registration-panel__qr')} href='https://forms.gle/h9GphSJ8dzZkESZ17' target='_blank' rel='noopener noreferrer' aria-label='打开报名问卷'>
                  <img src='/images/workshop/ai_as_catalyst_registration_qr.png' alt='AI as Catalyst 工作坊报名问卷二维码。' />
                </a>
              </div>
              <a className={workshopClass('back-news-link')} href='/zh/news' target='_top' rel='noopener noreferrer'>{"← 返回新闻列表"}</a>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
