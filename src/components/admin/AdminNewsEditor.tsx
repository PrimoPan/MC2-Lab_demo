import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminRole } from '../../lib/adminApi';
import './adminNews.css';

type Bilingual = { en: string; 'zh-CN': string };
interface NewsPost {
  id: string;
  slug: string;
  date: string;
  title: Bilingual;
  summary: Bilingual;
  body: Bilingual;
  image: string;
  published: boolean;
}
interface NewsSnapshot { revision: number; posts: NewsPost[] }
interface Props {
  role: AdminRole;
  csrfToken: string;
  onUnauthorized: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
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
    if (field !== 'summary' && !post[field].en.trim()) return `请填写英文${label}。`;
    if (Object.values(post[field]).some((value) => value.length > limit)) return `${label}每种语言最多 ${limit.toLocaleString()} 个字符。`;
  }
  if (post.image && !/^\/(?:images\/|media\/people\/)/.test(post.image)) return '请选择站内图片或重新上传封面。';
  return null;
}

export default function AdminNewsEditor({ role, csrfToken, onUnauthorized, onDirtyChange, onBusyChange }: Props): JSX.Element {
  const [snapshot, setSnapshot] = useState<NewsSnapshot | null>(null);
  const [drafts, setDrafts] = useState<Record<string, NewsPost>>({});
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loadRequest, setLoadRequest] = useState(0);
  const manualSlugs = useRef(new Set<string>());
  const mounted = useRef(true);
  const callbacks = useRef({ onUnauthorized, onDirtyChange, onBusyChange });
  callbacks.current = { onUnauthorized, onDirtyChange, onBusyChange };
  const busy = loading || saving || uploading;
  const dirty = Object.values(drafts).some((post) => !samePost(snapshot?.posts.find((item) => item.id === post.id), post));
  const selected = drafts[selectedId] ?? snapshot?.posts.find((post) => post.id === selectedId);
  const stored = snapshot?.posts.find((post) => post.id === selectedId);
  const selectedDirty = !!selected && !samePost(stored, selected);
  const canPublish = role === 'admin';
  const canCreate = canPublish || role === 'editor';
  const canEditSelected = Boolean(selected && (canPublish || (role === 'editor' && !stored?.published && !selected.published)));
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
        : response.status === 403 ? (payload?.requirePasswordChange === true ? '请先完成初始密码修改。' : '当前账号没有此操作权限；编辑账号仅可修改未发布的新闻草稿。')
          : response.status === 409 ? '另一位管理员已更新新闻。请先重新加载最新内容，再编辑保存。'
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

  function edit(patch: Partial<NewsPost>) {
    if (!canEditSelected || !selected || busy) return;
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
    if (!canCreate || busy || !snapshot || allPosts.length >= 500) return;
    const id = crypto.randomUUID();
    const post: NewsPost = { id, slug: '', date: today(), title: { en: '', 'zh-CN': '' }, summary: { en: '', 'zh-CN': '' }, body: { en: '', 'zh-CN': '' }, image: '', published: false };
    setDrafts((current) => ({ ...current, [id]: post })); setSelectedId(id); setQuery(''); setError(''); setNotice('');
  }
  function reload() {
    if (busy || (dirty && !window.confirm('重新加载会放弃所有尚未保存的新闻修改。请先复制需要保留的文字。继续吗？'))) return;
    setNotice(''); setLoadRequest((value) => value + 1);
  }
  async function savePost(published: boolean) {
    if (!canEditSelected || (!canPublish && published) || !snapshot || !selected || busy || conflict) return;
    const next = { ...clone(selected), slug: selected.slug || automaticSlug(selected.title.en, selected.date, selected.id), published };
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
      setNotice(published ? '新闻已发布，公开页面将显示本次保存的内容。' : stored?.published ? '已撤回发布，新闻现保存为草稿。' : '草稿已保存，尚未公开。');
    } catch (cause) { if (mounted.current) showError(cause); }
    finally { if (mounted.current) setSaving(false); }
  }
  async function deletePost() {
    if (!canEditSelected || !snapshot || !selected || busy || conflict || !window.confirm(`删除“${selected.title['zh-CN'] || selected.title.en || '未命名新闻'}”？${stored?.published ? '该新闻及其公开页面将被移除。' : stored ? '已保存的草稿将被删除。' : '尚未保存的内容将被丢弃。'}`)) return;
    const deletedId = selected.id;
    const posts = snapshot.posts.filter((post) => post.id !== deletedId);
    setSaving(true); setError(''); setNotice('');
    try {
      if (stored) {
        const result = await request<NewsSnapshot>('/api/admin/news', 'PUT', { revision: snapshot.revision, posts });
        if (!mounted.current) return;
        if (!Number.isInteger(result.revision)) throw new Error('Missing revision');
        setSnapshot({ revision: result.revision, posts: Array.isArray(result.posts) ? result.posts : posts });
      }
      setDrafts((current) => { const remaining = { ...current }; delete remaining[deletedId]; return remaining; });
      manualSlugs.current.delete(deletedId);
      setSelectedId(allPosts.find((post) => post.id !== deletedId)?.id ?? '');
      setNotice(stored ? '新闻已删除。' : '未保存的新闻已丢弃。');
    } catch (cause) { if (mounted.current) showError(cause); }
    finally { if (mounted.current) setSaving(false); }
  }
  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
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
      setDrafts((current) => ({ ...current, [id]: { ...(current[id] ?? post), image: result.url } }));
      setNotice('封面已上传；保存新闻后才会用于该新闻。');
    } catch (cause) { if (mounted.current) showError(cause); }
    finally { if (mounted.current) setUploading(false); }
  }

  return (
    <section className='mc2-admin-news' aria-label='新闻管理' aria-busy={busy}>
      <div className='news-toolbar'>
        <div><h2>新闻管理</h2><p>{canPublish ? '编辑新闻并选择何时公开。' : role === 'editor' ? '新建与编辑新闻草稿，发布由管理员完成。' : '当前权限未知，仅可查看内容。'}中文留空时，公开页面使用英文内容。</p></div>
        <button type='button' onClick={reload} disabled={busy}>重新加载</button>
      </div>
      {role === 'editor' && <p className='news-notice' role='status'>编辑账号可以新增、修改、删除未发布的新闻草稿及上传封面；已发布新闻仅可查看。发布和撤回由管理员处理。</p>}
      {error && <div className='news-error' role='alert'>{error}</div>}
      {conflict && <div className='news-error' role='alert'>为避免覆盖他人的更新，保存已暂停。请保留需要的文字，再选择“重新加载”。</div>}
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
                  <span>{post.date} · {original?.published ? '已发布' : original ? '草稿' : '未保存'}{!samePost(original, post) ? ' · 有修改' : ''}</span>
                </button>;
              })}
              {!visiblePosts.length && <p className='news-empty'>{allPosts.length ? '没有匹配的新闻。' : canCreate ? '点击“新增新闻”开始撰写。' : '暂无新闻。'}</p>}
            </div>
          </aside>
          {selected ? <form className='news-editor' onSubmit={(event) => { event.preventDefault(); void savePost(selected.published); }}>
            <div className='news-editor-heading'><h3>{!canEditSelected ? '查看新闻' : stored ? '编辑新闻' : '新增新闻'}</h3><span>{selectedDirty ? '有未保存修改' : stored?.published ? '已发布' : '草稿已保存'}</span></div>
            <fieldset disabled={busy || conflict || !canEditSelected}>
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
                <label><span>正文{locale === 'en' ? ' *' : ''}</span><textarea className='news-body' required={locale === 'en'} maxLength={50000} rows={14} placeholder='直接输入文字，使用空行分隔段落。' value={selected.body[locale]} onChange={(event) => editText('body', locale, event.target.value)} /><small>纯文本正文，使用空行分段。</small></label>
              </div>)}</div>
            </fieldset>
            {canEditSelected && <div className='news-form-actions'>
              <div className='news-action-group'>
                <button type='submit' className={selected.published ? 'news-primary' : ''} disabled={busy || conflict || (!selectedDirty && !!stored)}>{saving ? '正在保存…' : selected.published ? '保存更新' : '保存草稿'}</button>
                {canPublish && !selected.published && <button type='button' className='news-primary' disabled={busy || conflict} onClick={() => { void savePost(true); }}>发布新闻</button>}
                {canPublish && selected.published && <button type='button' disabled={busy || conflict} onClick={() => { if (window.confirm('撤回发布后，读者将无法在公开页面看到这条新闻。继续吗？')) void savePost(false); }}>撤回发布</button>}
              </div>
              <button type='button' className='news-danger' disabled={busy || conflict} onClick={() => { void deletePost(); }}>{stored ? '删除新闻' : '丢弃此新闻'}</button>
            </div>}
            <p className='news-save-note'>{!canEditSelected ? '此新闻仅供查看，修改已发布内容需使用管理员账号。' : uploading ? '正在上传封面…' : canPublish ? '每次保存仅更新当前新闻，其他未保存的编辑会保留在当前页面。' : '保存仅更新草稿；请由管理员审核并发布。其他未保存的编辑会保留在当前页面。'}</p>
          </form> : <p className='news-empty'>{canCreate ? '选择一条新闻，或新增新闻。' : '选择一条新闻查看。'}</p>}
        </div>
      )}
    </section>
  );
}
