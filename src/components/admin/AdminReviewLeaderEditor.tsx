import { useState } from 'react';
import { adminApi, type PeopleContent } from '../../lib/adminApi';
import type { LeaderContent } from '../../types/legacyPages';
import type { Locale } from '../../types/common';
import defaultLeader from '../../data/leaderContent.json';

const fields: { key: keyof Pick<LeaderContent, 'pageLabel' | 'documentTitle' | 'profileAlt' | 'title' | 'subtitle' | 'meta' | 'homepageLabel' | 'photo' | 'homepage' | 'projectsTitle'>; label: string; max: number; multiline?: boolean }[] = [
  { key: 'title', label: '姓名与头衔', max: 300 }, { key: 'subtitle', label: '职务 / 简介', max: 1000, multiline: true },
  { key: 'meta', label: '荣誉 / 简要资料', max: 1000, multiline: true },
  { key: 'photo', label: '照片路径', max: 2048 }, { key: 'profileAlt', label: '照片说明', max: 300 },
  { key: 'homepage', label: '个人主页链接', max: 2048 }, { key: 'homepageLabel', label: '主页链接文字', max: 160 },
  { key: 'pageLabel', label: '页面栏目名', max: 160 }, { key: 'documentTitle', label: '浏览器标题', max: 300 },
  { key: 'projectsTitle', label: '研究项目标题', max: 300 },
];

export default function AdminReviewLeaderEditor({ content, disabled, csrfToken, onChange, onBusyChange, onError }: {
  content: PeopleContent; disabled: boolean; csrfToken: string;
  onChange: (change: (content: PeopleContent) => void) => void;
  onBusyChange: (busy: boolean) => void; onError: (cause: unknown) => void;
}) {
  const [language, setLanguage] = useState<Locale>('zh-CN');
  const [uploading, setUploading] = useState(false);
  const leader = content[language].leader ?? defaultLeader[language];
  function edit(change: (leader: LeaderContent) => void) {
    onChange(draft => {
      for (const locale of ['en', 'zh-CN'] as const) if (!draft[locale].leader) draft[locale].leader = structuredClone(defaultLeader[locale]);
      change(draft[language].leader!);
    });
  }
  async function upload(file?: File) {
    if (!file || disabled) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { onError(new Error('请选择不超过 5 MiB 的 JPEG、PNG 或 WebP 图片。')); return; }
    setUploading(true); onBusyChange(true);
    try {
      const { url } = await adminApi.upload(csrfToken, file);
      onChange(draft => {
        for (const locale of ['en', 'zh-CN'] as const) {
          if (!draft[locale].leader) draft[locale].leader = structuredClone(defaultLeader[locale]);
          draft[locale].leader!.photo = url;
        }
      });
    } catch (cause) { onError(cause); } finally { setUploading(false); onBusyChange(false); }
  }
  return <section className="mc2-admin-editor" aria-label="负责人完整资料编辑">
    <div className="mc2-admin-editor-head"><div><h2>负责人独立页面</h2><p className="mc2-admin-muted">编辑介绍、学术经历、荣誉和研究项目。成员列表中的名片请在“当前成员”里编辑。</p></div><label className="mc2-admin-field"><span>编辑语言</span><select value={language} disabled={disabled} onChange={event => setLanguage(event.target.value as Locale)}><option value="zh-CN">中文</option><option value="en">English</option></select></label></div>
    <fieldset disabled={disabled || uploading}>
      <div className="mc2-admin-photo">{leader.photo && <img src={leader.photo} alt={leader.profileAlt} />}<label className="mc2-admin-upload">{uploading ? '正在上传…' : '上传负责人照片（中英文共用）'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void upload(file); }} /></label></div>
      <div className="mc2-admin-columns">{fields.map(({ key, label, max, multiline }) => <label className="mc2-admin-field" key={key}><span>{label}</span>{multiline ? <textarea value={leader[key]} maxLength={max} onChange={event => edit(value => { value[key] = event.target.value; })} /> : <input value={leader[key]} maxLength={max} onChange={event => edit(value => { value[key] = event.target.value; })} />}</label>)}</div>
      <h3 className="mc2-admin-language">介绍与经历</h3>
      {leader.sections.map((section, sectionIndex) => <section className="mc2-review-leader-section" key={sectionIndex}>
        <label className="mc2-admin-field"><span>第 {sectionIndex + 1} 节标题</span><input value={section.title} maxLength={300} onChange={event => edit(value => { value.sections[sectionIndex].title = event.target.value; })} /></label>
        {section.paragraphs.map((paragraph, paragraphIndex) => <div key={paragraphIndex}><label className="mc2-admin-field"><span>段落 {paragraphIndex + 1}</span><textarea value={paragraph} maxLength={10000} onChange={event => edit(value => { value.sections[sectionIndex].paragraphs[paragraphIndex] = event.target.value; })} /></label><button className="mc2-admin-btn mc2-admin-btn-quiet" onClick={() => edit(value => { value.sections[sectionIndex].paragraphs.splice(paragraphIndex, 1); })}>删除此段落</button></div>)}
        <div className="mc2-admin-actions"><button className="mc2-admin-btn" disabled={section.paragraphs.length >= 30} onClick={() => edit(value => { value.sections[sectionIndex].paragraphs.push(''); })}>新增段落</button><button className="mc2-admin-btn mc2-admin-btn-danger" onClick={() => { if (window.confirm(`从草稿中删除“${section.title || '此章节'}”？`)) edit(value => { value.sections.splice(sectionIndex, 1); }); }}>删除章节</button></div>
      </section>)}
      <button className="mc2-admin-btn" disabled={leader.sections.length >= 20} onClick={() => edit(value => { value.sections.push({ title: '', paragraphs: [''] }); })}>新增介绍章节</button>
      <h3 className="mc2-admin-language">研究项目</h3>
      {leader.projects.map((project, index) => <section className="mc2-review-leader-section" key={index}><label className="mc2-admin-field"><span>项目 {index + 1} 名称</span><input value={project.title} maxLength={300} onChange={event => edit(value => { value.projects[index].title = event.target.value; })} /></label><label className="mc2-admin-field"><span>项目介绍</span><textarea value={project.body} maxLength={10000} onChange={event => edit(value => { value.projects[index].body = event.target.value; })} /></label><button className="mc2-admin-btn mc2-admin-btn-danger" onClick={() => { if (window.confirm(`从草稿中删除“${project.title || '此项目'}”？`)) edit(value => { value.projects.splice(index, 1); }); }}>删除项目</button></section>)}
      <button className="mc2-admin-btn" disabled={leader.projects.length >= 30} onClick={() => edit(value => { value.projects.push({ title: '', body: '' }); })}>新增研究项目</button>
    </fieldset>
  </section>;
}
