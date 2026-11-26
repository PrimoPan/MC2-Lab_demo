import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AdminRole } from '../../lib/adminApi';
import type { Locale } from '../../types/common';
import type { NewsPost, NewsSection, NewsImage, NewsLayout, NewsTemplate, NewsText } from '../../types/newsPost';
import ManagedNewsArticle from '../news/ManagedNewsArticle';
import { createNewsTemplateSections, emptyNewsText, newNewsSection, newsTemplates } from '../../lib/newsTemplates';
import './adminNews.css';

type Bilingual = NewsText;
interface NewsSnapshot { revision: number; posts: NewsPost[] }
interface Props {
  role: AdminRole;
  csrfToken: string;
  onUnauthorized: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  onSaved?: (revision: number) => void;
  workspaceRevision?: number;
}
class NewsRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
const automaticSlug = (title: string, date: string, id: string) =>
  title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100).replace(/-$/g, '') || `news-${date}-${id.slice(0, 8)}`;
const samePost = (a: NewsPost | undefined, b: NewsPost) => !!a && JSON.stringify(a) === JSON.stringify(b);

function validate(post: NewsPost, posts: NewsPost[]): string | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || post.slug.length > 100) return '网址名称请使用小写英文字母、数字及单个连字符，最多 100 个字符。';
  if (posts.some((item) => item.id !== post.id && item.slug === post.slug)) return '该网址名称已被另一条新闻使用，请更换。';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || !Number.isFinite(Date.parse(`${post.date}T00:00:00Z`)) || new Date(`${post.date}T00:00:00Z`).toISOString().slice(0, 10) !== post.date) return '请选择有效的新闻日期。';
  for (const [field, label, limit] of [['title', '标题', 200], ['summary', '摘要', 1000], ['body', '正文', 50000]] as const) {
    if (field === 'title' && !post[field].en.trim()) return '请填写英文标题。';
    if (field === 'body' && !post.body.en.trim() && !post.sections?.some(section => section.body.en.trim() || (section.layout !== 'text' && section.images.some(image => image.url)))) return '请填写英文正文，或添加含英文文字／图片的图文段落。';
    if (Object.values(post[field]).some((value) => value.length > limit)) return `${label}每种语言最多 ${limit.toLocaleString()} 个字符。`;
  }
  if (post.image && !/^\/(?:images\/|media\/people\/)/.test(post.image)) return '请选择站内图片或重新上传封面。';
  return null;
}

const layoutNames: Record<NewsLayout, string> = { text: '纯文字', 'image-left': '左图右文', 'image-right': '右图左文', gallery: '图片画廊' };

function SectionFields({ section, onChange, onUpload }: {
  section: NewsSection;
  onChange: (patch: Partial<NewsSection>) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>, imageId: string) => void;
}) {
  function updateImage(id: string, patch: Partial<NewsImage>) {
    onChange({ images: section.images.map(image => image.id === id ? { ...image, ...patch } : image) });
  }
  function moveImage(index: number, direction: -1 | 1) {
    const images = [...section.images];
    [images[index], images[index + direction]] = [images[index + direction], images[index]];
    onChange({ images });
  }
  return <div className='news-section-fields'>
    <label><span>段落布局</span><select value={section.layout} onChange={event => onChange({ layout: event.target.value as NewsLayout })}>{Object.entries(layoutNames).map(([layout, name]) => <option value={layout} key={layout}>{name}</option>)}</select></label>
    <div className='news-languages'>{(['en', 'zh-CN'] as const).map(locale => <div key={locale}>
      <label><span>{locale === 'en' ? 'English heading' : '中文标题 · 可选'}</span><input maxLength={300} value={section.heading[locale]} onChange={event => onChange({ heading: { ...section.heading, [locale]: event.target.value } })} /></label>
      <label><span>{locale === 'en' ? 'English text' : '中文正文 · 可选'}</span><textarea rows={7} maxLength={50000} value={section.body[locale]} onChange={event => onChange({ body: { ...section.body, [locale]: event.target.value } })} placeholder='使用空行分隔段落。' /></label>
    </div>)}</div>
    {section.layout !== 'text' && <div className='news-section-images'>
      {section.images.map((image, index) => <div className='news-image-editor' key={image.id}>
        <div className='news-section-bar'><strong>图片 {index + 1}</strong><button type='button' aria-label={`上移图片 ${index + 1}`} disabled={index === 0} onClick={() => moveImage(index, -1)}>↑</button><button type='button' aria-label={`下移图片 ${index + 1}`} disabled={index === section.images.length - 1} onClick={() => moveImage(index, 1)}>↓</button><button type='button' className='news-danger' onClick={() => onChange({ images: section.images.filter(item => item.id !== image.id) })}>移除图片</button></div>
        <div className='news-cover'>{image.url ? <img src={image.url} alt={image.alt['zh-CN'] || image.alt.en || '段落图片预览'} /> : <div className='news-cover-placeholder'>等待上传</div>}<label className='news-upload'><span>{image.url ? '更换图片' : '上传图片'}</span><input type='file' accept='image/jpeg,image/png,image/webp' onChange={event => onUpload(event, image.id)} /><small>JPEG、PNG 或 WebP，最大 5 MiB。</small></label></div>
        <div className='news-languages'>{(['en', 'zh-CN'] as const).map(locale => <div key={locale}>
          <label><span>{locale === 'en' ? 'Image description (alt text)' : '图片替代文本 · 可选'}</span><input maxLength={500} value={image.alt[locale]} onChange={event => updateImage(image.id, { alt: { ...image.alt, [locale]: event.target.value } })} /></label>
          <label><span>{locale === 'en' ? 'Image caption' : '图片说明 · 可选'}</span><textarea rows={2} maxLength={1000} value={image.caption[locale]} onChange={event => updateImage(image.id, { caption: { ...image.caption, [locale]: event.target.value } })} /></label>
        </div>)}</div>
      </div>)}
      <button type='button' disabled={section.images.length >= 8} onClick={() => onChange({ images: [...section.images, { id: crypto.randomUUID(), url: '', alt: emptyNewsText(), caption: emptyNewsText() }] })}>＋ 添加图片 ({section.images.length}/8)</button>
    </div>}
    {section.layout === 'text' && section.images.length > 0 && <p className='news-save-note'>此段落的图片已保留，切换到图文或画廊布局可继续编辑和显示。</p>}
  </div>;
}

function ArticlePreview({ post, onClose }: { post: NewsPost; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [locale, setLocale] = useState<Locale>('en');
  const [phone, setPhone] = useState(false);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); previous?.focus(); };
  }, []);
  useEffect(() => {
    if (!mount) return;
    const doc = mount.ownerDocument;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    doc.addEventListener('keydown', escape);
    return () => doc.removeEventListener('keydown', escape);
  }, [mount, onClose]);
  return <dialog ref={dialog} className='news-preview-dialog' aria-labelledby='news-preview-heading' onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className='news-preview-toolbar'><div><h3 id='news-preview-heading'>文章预览</h3><p>包含尚未保存的修改。保存草稿后仍需提交审核。</p></div><button type='button' autoFocus onClick={onClose}>返回编辑</button>
      <div className='news-action-group' role='group' aria-label='预览语言'><button type='button' aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</button><button type='button' aria-pressed={locale === 'zh-CN'} onClick={() => setLocale('zh-CN')}>中文</button></div>
      <div className='news-action-group' role='group' aria-label='预览尺寸'><button type='button' aria-pressed={!phone} onClick={() => setPhone(false)}>桌面</button><button type='button' aria-pressed={phone} onClick={() => setPhone(true)}>手机</button></div>
    </div>
    <div className='news-preview-scroll'><iframe title='新闻文章预览' className={phone ? 'news-preview-phone' : 'news-preview-desktop'} sandbox='allow-same-origin' srcDoc="<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'></head><body style='margin:0'><div id='news-preview-root'></div></body></html>" onLoad={event => {
      const doc = event.currentTarget.contentDocument;
      if (!doc) return;
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => doc.head.append(style.cloneNode(true)));
      setMount(doc.getElementById('news-preview-root'));
    }} /></div>
    {mount && createPortal(<ManagedNewsArticle post={post} locale={locale} preview />, mount)}
  </dialog>;
}

export default function AdminNewsEditor({ role, csrfToken, onUnauthorized, onDirtyChange, onBusyChange, onSaved, workspaceRevision }: Props): JSX.Element {
  const [snapshot, setSnapshot] = useState<NewsSnapshot | null>(null);
  const [drafts, setDrafts] = useState<Record<string, NewsPost>>({});
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loadRequest, setLoadRequest] = useState(0);
  const [preview, setPreview] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const observedRevision = useRef(workspaceRevision);
  const manualSlugs = useRef(new Set<string>());
  const mounted = useRef(true);
  const callbacks = useRef({ onUnauthorized, onDirtyChange, onBusyChange, onSaved });
  callbacks.current = { onUnauthorized, onDirtyChange, onBusyChange, onSaved };
  const writing = loading || saving || uploading;
  const busy = writing || syncing;
  const dirty = Object.values(drafts).some((post) => !samePost(snapshot?.posts.find((item) => item.id === post.id), post));
  const selected = drafts[selectedId] ?? snapshot?.posts.find((post) => post.id === selectedId);
  const stored = snapshot?.posts.find((post) => post.id === selectedId);
  const selectedDirty = !!selected && !samePost(stored, selected);
  const canCreate = role === 'admin' || role === 'editor';
  const canEditSelected = Boolean(selected && canCreate);
  const allPosts = useMemo(() => {
    const rows = new Map((snapshot?.posts ?? []).map((post) => [post.id, post]));
    Object.values(drafts).forEach((post) => rows.set(post.id, post));
    return [...rows.values()].sort((a, b) => b.date.localeCompare(a.date) || a.title.en.localeCompare(b.title.en));
  }, [snapshot, drafts]);
  const visiblePosts = allPosts.filter((post) => `${post.title.en} ${post.title['zh-CN']} ${post.date}`.toLowerCase().includes(query.trim().toLowerCase()));

  async function request<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
    const form = body instanceof FormData;
    const headers = new Headers({ Accept: 'application/json' });
    if (body !== undefined && !form) headers.set('Content-Type', 'application/json');
    if (method !== 'GET') headers.set('X-CSRF-Token', csrfToken);
    const response = await fetch(path, {
      method, headers, credentials: 'same-origin', cache: 'no-store', signal,
      body: body === undefined ? undefined : form ? body : JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
    if (!response.ok) {
      const fallback = response.status === 401 ? '登录已过期，请重新登录。'
        : response.status === 403 ? (payload?.requirePasswordChange === true ? '请先完成初始密码修改。' : '当前账号没有此操作权限。')
          : response.status === 409 ? '工作区已更新。请保留本地修改，重新加载最新内容后再保存。'
            : response.status === 413 ? '图片太大，请选择不超过 5 MiB 的文件。' : `请求失败（${response.status}），请重试。`;
      throw new NewsRequestError(typeof payload?.message === 'string' ? payload.message : typeof payload?.error === 'string' ? payload.error : fallback, response.status);
    }
    if (!payload) throw new Error('服务返回的数据不完整，请重试。');
    return payload as T;
  }

  function showError(cause: unknown) {
    if (cause instanceof NewsRequestError && cause.status === 401) { callbacks.current.onUnauthorized(); return; }
    if (cause instanceof NewsRequestError && cause.status === 409) setConflict(true);
    setError(cause instanceof NewsRequestError ? cause.message : '暂时无法连接新闻服务，请检查网络后重试。');
    setNotice('');
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      callbacks.current.onDirtyChange?.(false);
      callbacks.current.onBusyChange?.(false);
    };
  }, []);
  useEffect(() => { callbacks.current.onDirtyChange?.(dirty); }, [dirty]);
  useEffect(() => { callbacks.current.onBusyChange?.(busy); }, [busy]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty || saving || uploading) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving, uploading]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    request<NewsSnapshot>('/api/admin/news', 'GET', undefined, controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(data.posts) || !Number.isInteger(data.revision)) throw new Error('Invalid news snapshot');
      setSnapshot(data); setDrafts({}); setConflict(false); manualSlugs.current.clear();
      setSelectedId((current) => data.posts.some((post) => post.id === current) ? current : data.posts[0]?.id ?? '');
    }).catch((cause: unknown) => { if (!controller.signal.aborted) showError(cause); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
    // Session refreshes are handled by the containing administrator page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRequest]);

  useEffect(() => {
    if (workspaceRevision === undefined || workspaceRevision === observedRevision.current || !snapshot || writing) return;
    observedRevision.current = workspaceRevision;
    if (workspaceRevision === snapshot.revision) return;
    const controller = new AbortController();
    setSyncing(true);
    request<NewsSnapshot>('/api/admin/news', 'GET', undefined, controller.signal).then(latest => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(latest.posts) || !Number.isInteger(latest.revision)) throw new Error('Invalid news snapshot');
      if (dirty && JSON.stringify(latest.posts) !== JSON.stringify(snapshot.posts)) {
        setConflict(true);
      } else {
        // A people-only save advances the shared revision without changing news.
        // Preserve local article edits when their saved baseline is unchanged.
        setSnapshot(latest);
        setConflict(false);
        if (!dirty) {
          setDrafts({});
          setSelectedId(current => latest.posts.some(post => post.id === current) ? current : latest.posts[0]?.id ?? '');
        }
      }
    }).catch((cause: unknown) => { if (!controller.signal.aborted) { showError(cause); setConflict(true); } })
      .finally(() => { if (!controller.signal.aborted) setSyncing(false); });
    return () => { controller.abort(); setSyncing(false); };
    // Rebase after writes finish; session callbacks and CSRF refresh independently.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceRevision, snapshot, dirty, writing]);

  function edit(patch: Partial<NewsPost>) {
    if (!canEditSelected || !selected || busy || conflict) return;
    setDrafts((current) => ({ ...current, [selected.id]: { ...clone(selected), ...patch } }));
    setNotice(''); setError('');
  }
  function editText(field: 'title' | 'summary' | 'body', locale: keyof Bilingual, value: string) {
    if (!canEditSelected || !selected) return;
    const patch: Partial<NewsPost> = { [field]: { ...selected[field], [locale]: value } };
    if (field === 'title' && locale === 'en' && !stored && !manualSlugs.current.has(selected.id)) patch.slug = automaticSlug(value, selected.date, selected.id);
    edit(patch);
  }
  function addPost() {
    if (!canCreate || busy || conflict || !snapshot || allPosts.length >= 500) return;
    const id = crypto.randomUUID();
    const post: NewsPost = { id, slug: '', date: today(), title: { en: '', 'zh-CN': '' }, summary: { en: '', 'zh-CN': '' }, body: { en: '', 'zh-CN': '' }, image: '', published: true, template: 'announcement', sections: [] };
    setDrafts((current) => ({ ...current, [id]: post })); setSelectedId(id); setQuery(''); setError(''); setNotice('');
  }
  function reload() {
    if (busy || (dirty && !window.confirm('重新加载会放弃所有尚未保存的新闻修改。请先复制需要保留的文字。继续吗？'))) return;
    setNotice(''); setLoadRequest((value) => value + 1);
  }
  async function savePost() {
    if (!canEditSelected || !snapshot || !selected || busy || conflict) return;
    const next = { ...clone(selected), slug: selected.slug || automaticSlug(selected.title.en, selected.date, selected.id) };
    const invalid = validate(next, allPosts);
    if (invalid) { setError(invalid); setNotice(''); return; }
    const posts = stored ? snapshot.posts.map((post) => post.id === next.id ? next : post) : [next, ...snapshot.posts];
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await request<NewsSnapshot>('/api/admin/news', 'PUT', { revision: snapshot.revision, posts });
      if (!mounted.current) return;
      if (!Number.isInteger(result.revision)) throw new Error('Missing revision');
      setSnapshot({ revision: result.revision, posts: Array.isArray(result.posts) ? result.posts : posts });
      setDrafts((current) => { const remaining = { ...current }; delete remaining[next.id]; return remaining; });
      callbacks.current.onSaved?.(result.revision);
      setNotice('新闻草稿已保存。请在“预览与提交审核”提交全部变更，由 Primo 审核后统一发布。');
    } catch (cause) { if (mounted.current) showError(cause); }
    finally { if (mounted.current) setSaving(false); }
  }
  async function deletePost() {
    if (!canEditSelected || !snapshot || !selected || busy || conflict || !window.confirm(`删除“${selected.title['zh-CN'] || selected.title.en || '未命名新闻'}”？${stored ? '删除会保存到待审核草稿，Primo 批准前官网保持原样。' : '尚未保存的内容将被丢弃。'}`)) return;
    const deletedId = selected.id;
    const posts = snapshot.posts.filter((post) => post.id !== deletedId);
    setSaving(true); setError(''); setNotice('');
    try {
      if (stored) {
        const result = await request<NewsSnapshot>('/api/admin/news', 'PUT', { revision: snapshot.revision, posts });
        if (!mounted.current) return;
        if (!Number.isInteger(result.revision)) throw new Error('Missing revision');
        setSnapshot({ revision: result.revision, posts: Array.isArray(result.posts) ? result.posts : posts });
        callbacks.current.onSaved?.(result.revision);
      }
      setDrafts((current) => { const remaining = { ...current }; delete remaining[deletedId]; return remaining; });
      manualSlugs.current.delete(deletedId);
      setSelectedId(allPosts.find((post) => post.id !== deletedId)?.id ?? '');
      setNotice(stored ? '删除已保存到草稿；提交审核并获批后才会从官网移除。' : '未保存的新闻已丢弃。');
    } catch (cause) { if (mounted.current) showError(cause); }
    finally { if (mounted.current) setSaving(false); }
  }
  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>, sectionId?: string, imageId?: string) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!canEditSelected || !file || !selected || busy) return;
    if (file.size > 5 * 1024 * 1024) { setError('图片不能超过 5 MiB。'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('请选择 JPEG、PNG 或 WebP 图片。'); return; }
    const id = selected.id;
    const post = clone(selected);
    const body = new FormData(); body.append('file', file);
    setUploading(true); setError(''); setNotice('');
    try {
      const result = await request<{ url: string }>('/api/admin/photos', 'POST', body);
      if (!mounted.current) return;
      if (typeof result.url !== 'string' || !result.url.startsWith('/media/people/')) throw new Error('Invalid uploaded image');
      setDrafts(current => {
        const latest = current[id] ?? post;
        const next = sectionId ? { ...latest, sections: (latest.sections ?? []).map(section => section.id !== sectionId ? section : { ...section, images: section.images.map(image => image.id !== imageId ? image : { ...image, url: result.url }) }) } : { ...latest, image: result.url };
        return { ...current, [id]: next };
      });
      setNotice('图片已上传到草稿；提交审核并获批后才会公开。');
    } catch (cause) { if (mounted.current) showError(cause); }
    finally { if (mounted.current) setUploading(false); }
  }

  function updateSection(id: string, patch: Partial<NewsSection>) {
    if (selected) edit({ sections: (selected.sections ?? []).map(section => section.id === id ? { ...section, ...patch } : section) });
  }
  function moveSection(index: number, direction: -1 | 1) {
    if (!selected) return;
    const sections = [...(selected.sections ?? [])];
    [sections[index], sections[index + direction]] = [sections[index + direction], sections[index]];
    edit({ sections });
  }
  function applyTemplate(template: NewsTemplate) {
    if (!selected) return;
    const sections = selected.sections ?? [];
    const added = createNewsTemplateSections(template);
    if (sections.length + added.length > 40) { setError('每条新闻最多 40 个图文段落。'); return; }
    edit({ template, sections: [...sections, ...added] });
    setExpanded(added[0]?.id ?? null);
    setNotice('已追加模板段落，已有正文和图片均保留。打开段落填写内容，也可更改布局。');
  }
  function downloadDrafts() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(allPosts, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `mc2-news-drafts-${today()}.json`; link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className='mc2-admin-news' aria-label='新闻管理' aria-busy={busy}>
      <div className='news-toolbar'>
        <div><h2>新闻管理</h2><p>新增、修改与删除均先保存为草稿，预览后提交审核，由 Primo 统一批准发布。中文留空时使用英文内容。</p></div>
        <button type='button' onClick={reload} disabled={busy}>重新加载</button>
      </div>
      {error && <div className='news-error' role='alert'>{error}</div>}
      {conflict && <div className='news-error' role='alert'>工作区有新版本，保存已暂停，本地修改仍在。<button type='button' onClick={downloadDrafts}>下载本地草稿</button> 保存副本后选择“重新加载”。</div>}
      {notice && <div className='news-notice' role='status'>{notice}</div>}
      {loading ? <p className='news-empty' role='status'>正在加载新闻…</p> : !snapshot ? <p className='news-empty'>新闻尚未加载，请重试。</p> : (
        <div className='news-workspace'>
          <aside className='news-sidebar' aria-label='新闻列表'>
            {canCreate && <button type='button' className='news-primary news-new' onClick={addPost} disabled={busy || conflict || allPosts.length >= 500}>＋ 新增新闻</button>}
            <label className='news-search'><span>搜索新闻</span><input type='search' placeholder='搜索标题或日期' value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <p className='news-count'>{allPosts.length} 条新闻 · {Object.values(drafts).filter((post) => !samePost(snapshot.posts.find((item) => item.id === post.id), post)).length} 条未保存</p>
            <div className='news-list'>
              {visiblePosts.map((post) => {
                const original = snapshot.posts.find((item) => item.id === post.id);
                return <button type='button' key={post.id} className='news-list-row' aria-pressed={post.id === selectedId} disabled={busy} onClick={() => { setSelectedId(post.id); setError(''); setNotice(''); }}>
                  <strong>{post.title['zh-CN'] || post.title.en || '未命名新闻'}</strong>
                  <span>{post.date} · {original ? '工作区草稿' : '未保存'}{!samePost(original, post) ? ' · 有修改' : ''}</span>
                </button>;
              })}
              {!visiblePosts.length && <p className='news-empty'>{allPosts.length ? '没有匹配的新闻。' : canCreate ? '点击“新增新闻”开始撰写。' : '暂无新闻。'}</p>}
            </div>
          </aside>
          {selected ? <form className='news-editor' onSubmit={(event) => { event.preventDefault(); void savePost(); }}>
            <div className='news-editor-heading'><h3>{!canEditSelected ? '查看新闻' : stored ? '编辑新闻' : '新增新闻'}</h3><span>{selectedDirty ? '有未保存修改' : '草稿已保存'}<button type='button' onClick={() => setPreview(true)} disabled={busy}>预览文章</button></span></div>
            <fieldset disabled={busy || conflict || !canEditSelected}>
              <div className='news-template-heading'><h4>选择图文模板</h4><p>选择后追加可编辑段落，保留已有内容。可随时预览完整文章。</p></div>
              <div className='news-templates'>{newsTemplates.map(template => <button type='button' key={template.id} className='news-template' aria-label={`使用${template.name}模板`} onClick={() => applyTemplate(template.id)}>
                <span className={`news-template-mini news-template-${template.id}`} aria-hidden='true'><i /><span><b /><b /><b /></span></span><strong>{template.name}</strong><small>{template.description}</small>
              </button>)}</div>
              <div className='news-metadata'>
                <label><span>日期</span><input type='date' required value={selected.date} onChange={(event) => edit({ date: event.target.value })} /></label>
                <label><span>网址名称</span><input value={selected.slug} maxLength={100} readOnly={!!stored} placeholder='输入英文标题后自动生成' onChange={(event) => { manualSlugs.current.add(selected.id); edit({ slug: event.target.value }); }} /><small>{stored ? '保存后的网址保持不变，已有链接可继续访问。' : '可使用小写英文字母、数字和连字符。'}</small></label>
              </div>
              <div className='news-cover'>
                {selected.image ? <img src={selected.image} alt='新闻封面预览' /> : <div className='news-cover-placeholder'>暂无封面</div>}
                {canEditSelected && <div><label className='news-upload'><span>上传封面</span><input type='file' accept='image/jpeg,image/png,image/webp' onChange={(event) => { void uploadPhoto(event); }} /></label><small>JPEG、PNG 或 WebP，最大 5 MiB。</small>{selected.image && <button type='button' className='news-quiet' onClick={() => edit({ image: '' })}>移除封面</button>}</div>}
              </div>
              <div className='news-languages'>{(['en', 'zh-CN'] as const).map((locale) => <div key={locale}>
                <h4>{locale === 'en' ? 'English' : '中文 · 可选'}</h4>
                <label><span>标题{locale === 'en' ? ' *' : ''}</span><input required={locale === 'en'} maxLength={200} value={selected.title[locale]} onChange={(event) => editText('title', locale, event.target.value)} /></label>
                <label><span>摘要 · 可选</span><textarea maxLength={1000} rows={4} value={selected.summary[locale]} onChange={(event) => editText('summary', locale, event.target.value)} /></label>
                <label><span>正文 · 可选，也可使用下方图文段落</span><textarea className='news-body' maxLength={50000} rows={14} placeholder='直接输入文字，使用空行分隔段落。' value={selected.body[locale]} onChange={(event) => editText('body', locale, event.target.value)} /><small>纯文本正文，使用空行分段。</small></label>
              </div>)}</div>
              <label className='news-visibility'><input type='checkbox' checked={selected.published} onChange={event => edit({ published: event.target.checked })} /><span>审核通过后在官网显示这条新闻</span><small>取消勾选是申请下架，须由 Primo 批准后生效。</small></label>
              <div className='news-sections-heading'><h4>图文段落 · {(selected.sections ?? []).length}/40</h4><button type='button' disabled={(selected.sections ?? []).length >= 40} onClick={() => { const section = newNewsSection(); edit({ sections: [...(selected.sections ?? []), section] }); setExpanded(section.id); }}>＋ 添加段落</button></div>
              {(selected.sections ?? []).map((section, index, sections) => <div className='news-section-editor' key={section.id}>
                <div className='news-section-bar'><button type='button' className='news-section-toggle' aria-expanded={expanded === section.id} onClick={() => setExpanded(expanded === section.id ? null : section.id)}>{index + 1}. {section.heading['zh-CN'] || section.heading.en || '未命名段落'} · {layoutNames[section.layout]}</button><button type='button' disabled={index === 0} aria-label={`上移第 ${index + 1} 段`} onClick={() => moveSection(index, -1)}>↑</button><button type='button' disabled={index === sections.length - 1} aria-label={`下移第 ${index + 1} 段`} onClick={() => moveSection(index, 1)}>↓</button><button type='button' className='news-danger' onClick={() => { if (window.confirm('移除此段落及其图片？保存草稿前可重新加载恢复。')) edit({ sections: sections.filter(item => item.id !== section.id) }); }}>移除</button></div>
                {expanded === section.id && <SectionFields section={section} onChange={patch => updateSection(section.id, patch)} onUpload={(event, imageId) => { void uploadPhoto(event, section.id, imageId); }} />}
              </div>)}
            </fieldset>
            {canEditSelected && <div className='news-form-actions'>
              <div className='news-action-group'>
                <button type='submit' className='news-primary' disabled={busy || conflict || (!selectedDirty && !!stored)}>{saving ? '正在保存…' : '保存新闻草稿'}</button>
                <button type='button' onClick={() => setPreview(true)} disabled={busy}>预览文章</button>
              </div>
              <button type='button' className='news-danger' disabled={busy || conflict} onClick={() => { void deletePost(); }}>{stored ? '申请删除新闻' : '丢弃此新闻'}</button>
            </div>}
            <p className='news-save-note'>{uploading ? '正在上传图片…' : '保存仅更新当前新闻草稿；其他未保存的新闻仍保留在当前页面。请保存所有修改，再到“预览与提交审核”提交审核。'}</p>
          </form> : <p className='news-empty'>{canCreate ? '选择一条新闻，或新增新闻。' : '选择一条新闻查看。'}</p>}
        </div>
      )}
      {preview && selected && <ArticlePreview post={selected} onClose={() => setPreview(false)} />}
    </section>
  );
}
