import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import AdminNewsEditor from '../components/admin/AdminNewsEditor';
import { adminApi, AdminApiError, type AdminSession, type PeopleContent, type PeopleSnapshot } from '../lib/adminApi';
import type { AlumniEntry, MemberProfile, MemberRole } from '../types/legacyPages';
import '../styles/admin.css';

type Language = 'en' | 'zh-CN';
type Selection = { kind: 'member'; key: string } | { kind: 'alumni'; group: number; entry: number | null } | null;
type Tab = 'members' | 'alumni' | 'news';
const languages: Language[] = ['en', 'zh-CN'];
const roleLabels: Record<Exclude<MemberRole, 'all'>, string> = {
  chair: 'Chair / 教授', postdoc: 'Postdoc / 博士后', admin: 'Administration / 行政',
  phd: 'PhD / 博士生', mphil: 'MPhil / 硕士生', ra: 'Research Assistant / 研究助理',
  leader: 'Leader / 负责人', other: 'Other / 其他',
};

function sitePhoto(value: string): boolean {
  if (!value) return true;
  try {
    return /^\/(images\/|media\/people\/)/.test(value) && websiteValid(value);
  } catch { return false; }
}

function websiteValid(value: string): boolean {
  if (!value) return true;
  try {
    const decoded = decodeURIComponent(value);
    if (/\s/.test(value) || /[\u0000-\u001f\\]/.test(decoded)) return false;
    if (value.startsWith('/')) return !value.startsWith('//') && !decoded.split(/[?#]/)[0].split('/').includes('..');
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password && (!url.port || url.port === '443');
  } catch { return false; }
}

function validate(content: PeopleContent): string {
  const enKeys = content.en.members.map(member => member.key);
  const zhKeys = content['zh-CN'].members.map(member => member.key);
  if (new Set(enKeys).size !== enKeys.length || enKeys.length !== zhKeys.length || enKeys.some(key => !zhKeys.includes(key))) {
    return '中英文成员条目未对应或存在重复标识。请加载最新内容后重试。';
  }
  if (content.en.alumniGroups.length !== content['zh-CN'].alumniGroups.length) return '中英文校友分组未对应，请加载最新内容后重试。';
  for (const language of languages) {
    const label = language === 'en' ? '英文' : '中文';
    for (const member of content[language].members) {
      if (!member.name.trim()) return `请补齐所有成员的${label}姓名。`;
      if (!member.positionTitle.trim()) return `请补齐 ${member.name} 的${label}职务名称。`;
      if (!sitePhoto(member.photo)) return `${member.name} 的照片须上传，或使用 /images/、/media/people/ 下的站内路径。`;
      if (!websiteValid(member.website)) return `${member.name} 的个人主页须为 HTTPS 链接或站内路径，且不含空格。`;
      if (member.cohortYear !== null && (!Number.isInteger(member.cohortYear) || member.cohortYear < 1950 || member.cohortYear > 2100)) return `${member.name} 的入组年份应为 1950–2100 之间的整数，或留空。`;
    }
    for (const [index, group] of content[language].alumniGroups.entries()) {
      if (!group.heading.trim()) return `请填写第 ${index + 1} 个校友分组的${label}标题。`;
      if (group.entries.length !== content.en.alumniGroups[index].entries.length) return '中英文校友条目未对应，请加载最新内容后重试。';
      if (group.entries.some(entry => !entry.name.trim())) return `请补齐“${group.heading}”中所有校友的${label}姓名。`;
    }
  }
  return '';
}

function snapshotValid(value: PeopleSnapshot): boolean {
  return Boolean(value && (typeof value.revision === 'string' || typeof value.revision === 'number') &&
    languages.every(language => Array.isArray(value.content?.[language]?.members) && Array.isArray(value.content?.[language]?.alumniGroups)));
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="mc2-admin-field"><span>{label}</span>{children}{hint && <small className="mc2-admin-muted">{hint}</small>}</label>;
}

function Portrait({ src, name, large = false }: { src: string; name: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && sitePhoto(src) && !failed
    ? <img src={src} alt={large ? `${name || '成员'}的照片预览` : ''} loading="lazy" onError={() => setFailed(true)} />
    : <span className={large ? 'mc2-admin-photo-placeholder' : 'mc2-admin-avatar-fallback'}>{large ? '暂无照片' : name.slice(0, 1) || '·'}</span>;
}

function Login({ onSession, message }: { onSession: (session: AdminSession) => void; message?: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { onSession(await adminApi.login(username.trim(), password)); setPassword(''); }
    catch (cause) { setError(cause instanceof AdminApiError && cause.status === 401 ? '用户名或密码不正确，请重试。' : (cause as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="mc2-admin-auth">
    <h1>网站后台登录</h1><p>使用管理员或编辑账号登录。</p>
    {message && <div className="mc2-admin-notice" role="status">{message}</div>}
    <form onSubmit={submit}>
      <Field label="用户名"><input autoComplete="username" autoCapitalize="none" spellCheck={false} required value={username} onChange={event => setUsername(event.target.value)} disabled={busy} /></Field>
      <Field label="密码"><input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /></Field>
      {error && <p className="mc2-admin-alert" role="alert">{error}</p>}
      <button className="mc2-admin-btn mc2-admin-btn-primary" disabled={busy}>{busy ? '正在登录…' : '登录'}</button>
    </form>
  </section>;
}

function PasswordForm({ session, onSession, onCancel, onBusyChange }: { session: AdminSession; onSession: (value: AdminSession) => void; onCancel?: () => void; onBusyChange: (busy: boolean) => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { onBusyChange(busy); return () => onBusyChange(false); }, [busy, onBusyChange]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (next !== confirm) { setError('两次输入的新密码不一致。'); return; }
    if (next === current) { setError('请使用与当前密码不同的新密码。'); return; }
    setBusy(true);
    try {
      await adminApi.password(session.csrfToken, current, next);
      setCurrent(''); setNext(''); setConfirm('');
      onSession(await adminApi.session());
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="mc2-admin-auth">
    <h1>{session.user.mustChangePassword ? '设置你的新密码' : '修改密码'}</h1>
    <p>{session.user.mustChangePassword ? '首次登录需更换初始密码后才能使用后台。' : '修改后，其他登录会话将退出。'}建议使用至少 16 个字符。</p>
    <form onSubmit={submit}>
      <Field label="当前密码"><input type="password" autoComplete="current-password" required maxLength={128} disabled={busy} value={current} onChange={event => setCurrent(event.target.value)} /></Field>
      <Field label="新密码" hint="至少 14 个字符。"><input type="password" autoComplete="new-password" required minLength={14} maxLength={128} disabled={busy} value={next} onChange={event => setNext(event.target.value)} /></Field>
      <Field label="确认新密码"><input type="password" autoComplete="new-password" required minLength={14} maxLength={128} disabled={busy} value={confirm} onChange={event => setConfirm(event.target.value)} /></Field>
      {error && <p className="mc2-admin-alert" role="alert">{error}</p>}
      <div className="mc2-admin-actions"><button className="mc2-admin-btn mc2-admin-btn-primary" disabled={busy}>{busy ? '正在保存…' : '保存新密码'}</button>{onCancel && <button type="button" className="mc2-admin-btn" disabled={busy} onClick={onCancel}>返回内容</button>}</div>
    </form>
  </section>;
}

export function AdminPeoplePage(): JSX.Element {
  const secureAccess = window.isSecureContext || ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const [session, setSession] = useState<AdminSession | null>(null);
  const sessionIdentity = useRef<string | null>(null);
  const canEditPeople = session?.user.role === 'admin';
  const roleLabel = session?.user.role === 'admin' ? '管理员' : session?.user.role === 'editor' ? '编辑' : '权限未知';
  const [checking, setChecking] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [draft, setDraft] = useState<PeopleSnapshot | null>(null);
  const [savedContent, setSavedContent] = useState('');
  const [selection, setSelection] = useState<Selection>(null);
  const [tab, setTab] = useState<Tab>('members');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [conflict, setConflict] = useState(false);
  const [passwordView, setPasswordView] = useState(false);
  const [reauthenticate, setReauthenticate] = useState(false);
  const [newsVisited, setNewsVisited] = useState(false);
  const [newsDirty, setNewsDirty] = useState(false);
  const [newsBusy, setNewsBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const peopleDirty = Boolean(draft && JSON.stringify(draft.content) !== savedContent);
  const dirty = peopleDirty || newsDirty;
  const isBusy = Boolean(busy) || newsBusy || passwordBusy;
  const onNewsUnauthorized = useCallback(() => setReauthenticate(true), []);

  function acceptSession(value: AdminSession) {
    const identity = `${value.user.username}:${value.user.role}`;
    if (sessionIdentity.current !== null && sessionIdentity.current !== identity) {
      setDraft(null); setSavedContent(''); setSelection(null); setSearch('');
      setConflict(false); setNotice(''); setTab('members');
      setNewsVisited(false); setNewsDirty(false); setNewsBusy(false);
    }
    sessionIdentity.current = identity;
    setSession(value);
  }

  async function checkSession() {
    setChecking(true); setSessionError('');
    try { acceptSession(await adminApi.session()); }
    catch (cause) {
      if (cause instanceof AdminApiError && cause.status === 401) setSession(null);
      else setSessionError((cause as Error).message);
    } finally { setChecking(false); }
  }
  useEffect(() => { if (secureAccess) void checkSession(); }, []);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = '网站内容管理 | MC2 Lab';
    return () => { document.title = previousTitle; };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    if (session && !session.user.mustChangePassword && !draft) void loadPeople(false);
  }, [session?.user.username, session?.user.role, session?.user.mustChangePassword]);

  function handleError(cause: unknown) {
    const failure = cause as Error;
    setError(failure.message);
    if (cause instanceof AdminApiError && cause.status === 401) setReauthenticate(true);
    if (cause instanceof AdminApiError && cause.status === 409) setConflict(true);
    if (cause instanceof AdminApiError && cause.code === 'requirePasswordChange' && session) {
      setSession({ ...session, user: { ...session.user, mustChangePassword: true } });
    }
  }

  async function loadPeople(confirmDiscard = true) {
    if (confirmDiscard && peopleDirty && !window.confirm('加载最新内容会放弃成员与校友的未保存修改。继续吗？')) return;
    const owner = sessionIdentity.current;
    setBusy('load'); setError(''); setNotice('');
    try {
      const result = await adminApi.people();
      if (owner !== sessionIdentity.current) return;
      if (!snapshotValid(result)) throw new Error('网站返回的成员数据格式不完整，请稍后重试。');
      setDraft(result); setSavedContent(JSON.stringify(result.content)); setConflict(false);
      setSelection(result.content.en.members[0] ? { kind: 'member', key: result.content.en.members[0].key } : null);
      setTab('members'); setSearch('');
    } catch (cause) { handleError(cause); }
    finally { setBusy(''); }
  }

  function updateContent(change: (content: PeopleContent) => void) {
    if (!canEditPeople) return;
    setDraft(current => {
      if (!current) return current;
      const content = structuredClone(current.content);
      change(content);
      return { ...current, content };
    });
    setNotice('');
  }
  function updateMember(language: Language, key: string, field: keyof MemberProfile, value: string | number | null) {
    updateContent(content => {
      const member = content[language].members.find(item => item.key === key);
      if (member) Object.assign(member, { [field]: value });
    });
  }
  function updateSharedMember(key: string, field: 'role' | 'photo' | 'cohortYear' | 'cohortTerm' | 'website', value: string | number | null) {
    updateContent(content => languages.forEach(language => {
      const member = content[language].members.find(item => item.key === key);
      if (member) Object.assign(member, { [field]: value });
    }));
  }
  function addMember() {
    if (!canEditPeople) return;
    if (draft && draft.content.en.members.length >= 1000) { setError('成员数量已达上限（1000）。'); return; }
    const key = `member-${crypto.randomUUID()}`;
    updateContent(content => languages.forEach(language => content[language].members.push({
      key, name: '', role: 'phd', positionTitle: '', cohortTerm: '', cohortYear: null,
      photo: '', researchDirection: '', website: '',
    })));
    setSelection({ kind: 'member', key }); setSearch('');
  }
  function deleteMember(key: string, name: string) {
    if (!canEditPeople) return;
    if (draft && draft.content.en.members.length <= 1) { setError('网站至少需要保留一位当前成员。'); return; }
    if (!window.confirm(`删除“${name || '未命名成员'}”的中英文资料？保存更改后会从公开网站移除。`)) return;
    updateContent(content => languages.forEach(language => { content[language].members = content[language].members.filter(item => item.key !== key); }));
    setSelection(null);
  }
  function addGroup() {
    if (!canEditPeople) return;
    if (!draft) return;
    if (draft.content.en.alumniGroups.length >= 100) { setError('校友分组已达上限（100）。'); return; }
    const group = draft.content.en.alumniGroups.length;
    updateContent(content => languages.forEach(language => content[language].alumniGroups.push({ heading: '', entries: [] })));
    setSelection({ kind: 'alumni', group, entry: null }); setSearch('');
  }
  function addAlumni(groupIndex?: number) {
    if (!canEditPeople) return;
    if (!draft) return;
    if (draft.content.en.alumniGroups.reduce((count, group) => count + group.entries.length, 0) >= 2000) { setError('校友数量已达上限（2000）。'); return; }
    const group = groupIndex ?? (selection?.kind === 'alumni' ? selection.group : 0);
    const exists = Boolean(draft.content.en.alumniGroups[group]);
    const entry = exists ? draft.content.en.alumniGroups[group].entries.length : 0;
    updateContent(content => languages.forEach(language => {
      if (!exists) content[language].alumniGroups.push({ heading: '', entries: [] });
      content[language].alumniGroups[exists ? group : 0].entries.push({ name: '', detail: '' });
    }));
    setSelection({ kind: 'alumni', group: exists ? group : 0, entry }); setSearch('');
  }
  function deleteAlumni(group: number, entry: number | null) {
    if (!canEditPeople) return;
    if (!draft) return;
    const target = draft.content.en.alumniGroups[group];
    const name = entry === null ? target.heading || '未命名分组' : target.entries[entry].name || '未命名校友';
    if (!window.confirm(entry === null ? `删除“${name}”分组及其中 ${target.entries.length} 位校友的中英文资料？保存后生效。` : `删除“${name}”的中英文校友资料？保存后生效。`)) return;
    updateContent(content => languages.forEach(language => {
      if (entry === null) content[language].alumniGroups.splice(group, 1);
      else content[language].alumniGroups[group].entries.splice(entry, 1);
    }));
    setSelection(entry === null ? null : { kind: 'alumni', group, entry: null });
  }
  function updateAlumni(language: Language, group: number, entry: number | null, field: keyof AlumniEntry | 'heading', value: string) {
    updateContent(content => {
      if (field === 'heading') content[language].alumniGroups[group].heading = value;
      else if (entry !== null) content[language].alumniGroups[group].entries[entry][field] = value;
    });
  }

  async function save() {
    if (!canEditPeople || !draft || !session || isBusy) return;
    const invalid = validate(draft.content);
    if (invalid) { setError(invalid); return; }
    setBusy('save'); setError(''); setNotice('');
    try {
      const result = await adminApi.save(session.csrfToken, draft);
      if (typeof result?.revision !== 'string' && typeof result?.revision !== 'number') throw new Error('保存响应缺少版本信息。请先加载最新内容，确认本次保存状态。');
      setDraft({ ...draft, revision: result.revision }); setSavedContent(JSON.stringify(draft.content));
      setConflict(false); setNotice('已保存，中英文成员与校友资料已更新。');
    } catch (cause) { handleError(cause); }
    finally { setBusy(''); }
  }
  async function uploadPhoto(key: string, file?: File) {
    if (!canEditPeople || !file || !session) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('请选择 JPEG、PNG 或 WebP 照片。'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('照片不能超过 5 MiB。'); return; }
    setBusy('upload'); setError(''); setNotice('');
    try {
      const result = await adminApi.upload(session.csrfToken, file);
      if (!result?.url || !sitePhoto(result.url)) throw new Error('上传返回的照片地址无效，请重试。');
      updateSharedMember(key, 'photo', result.url); setNotice('照片已上传。点击“保存更改”后才会用于该成员资料。');
    } catch (cause) { handleError(cause); }
    finally { setBusy(''); }
  }
  async function logout() {
    if (!session || isBusy) return;
    if (dirty && !window.confirm('退出会放弃当前未保存的修改。确定退出吗？')) return;
    setBusy('logout'); setError('');
    try { await adminApi.logout(session.csrfToken); setSession(null); sessionIdentity.current = null; setDraft(null); setSavedContent(''); setSelection(null); setPasswordView(false); setNotice(''); setNewsVisited(false); setReauthenticate(false); }
    catch (cause) {
      if (cause instanceof AdminApiError && cause.status === 401) { setSession(null); sessionIdentity.current = null; setDraft(null); setSavedContent(''); setNewsVisited(false); setReauthenticate(false); }
      else handleError(cause);
    } finally { setBusy(''); }
  }
  function downloadDraft() {
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'mc2-people-unsaved-draft.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const query = search.trim().toLocaleLowerCase();
  const filteredMembers = useMemo(() => draft?.content.en.members.filter(member => {
    const translated = draft.content['zh-CN'].members.find(item => item.key === member.key);
    return !query || [member.name, member.positionTitle, member.researchDirection, translated?.name, translated?.positionTitle, translated?.researchDirection].some(value => value?.toLocaleLowerCase().includes(query));
  }) ?? [], [draft, query]);
  const selectedMember = selection?.kind === 'member' ? draft?.content.en.members.find(item => item.key === selection.key) : undefined;
  const selectedAlumniGroup = selection?.kind === 'alumni' ? draft?.content.en.alumniGroups[selection.group] : undefined;
  const alumniCount = draft?.content.en.alumniGroups.reduce((sum, group) => sum + group.entries.length, 0) ?? 0;

  return <div className="mc2-admin">
    <header className="mc2-admin-header">
      <div className="mc2-admin-brand">MC2 LAB<span>网站内容管理</span></div>
      <div className="mc2-admin-header-actions">
        <a href="/people" target="_blank" rel="noreferrer">查看公开页面 ↗</a>
        {session && <><span className="mc2-admin-muted">{session.user.username} · {roleLabel}</span>{!session.user.mustChangePassword && <button className="mc2-admin-btn mc2-admin-btn-quiet" disabled={isBusy} onClick={() => setPasswordView(true)}>修改密码</button>}<button className="mc2-admin-btn" disabled={isBusy} onClick={() => void logout()}>退出</button></>}
      </div>
    </header>
    {!secureAccess ? <section className="mc2-admin-auth"><h1>请使用安全管理入口</h1><p>此页面使用 HTTP，不能登录或提交密码。</p><a className="mc2-admin-btn mc2-admin-btn-primary" href="https://mc2.hkust-gz.edu.cn/admin">打开 HTTPS 管理入口</a></section>
      : checking ? <p className="mc2-admin-loading" role="status">正在检查登录状态…</p>
      : sessionError ? <section className="mc2-admin-auth"><p className="mc2-admin-alert" role="alert">{sessionError}</p><button className="mc2-admin-btn" onClick={() => void checkSession()}>重试</button></section>
        : !session ? <Login onSession={value => { acceptSession(value); setError(''); }} message={dirty ? '登录已过期。此页面中的未保存修改仍保留，重新登录后可继续。' : undefined} />
          : <>
              {reauthenticate ? <Login onSession={value => { acceptSession(value); setReauthenticate(false); setError(''); }} message="登录已过期，未保存内容仍保留。请重新登录后继续。" />
                : passwordView || session.user.mustChangePassword ? <PasswordForm session={session} onBusyChange={setPasswordBusy} onSession={value => { acceptSession(value); setPasswordView(false); setNotice('密码已更新。'); }} onCancel={session.user.mustChangePassword ? undefined : () => setPasswordView(false)} /> : null}
              <main className="mc2-admin-main" hidden={passwordView || reauthenticate || session.user.mustChangePassword}>
              <div className="mc2-admin-heading"><div><h1>{tab === 'news' ? 'News 文章' : '成员与校友'}</h1><p className="mc2-admin-muted">{tab === 'news' ? (canEditPeople ? '编辑与发布实验室新闻。' : '编辑新闻草稿，由管理员发布。') : (canEditPeople ? '中英文资料分别编辑，保存后同步到公开页面。' : '查看中英文成员与校友资料。')}</p></div><div className="mc2-admin-actions">
                {tab !== 'news' && <><span className="mc2-admin-status" data-dirty={peopleDirty} role="status">{busy === 'upload' ? '照片上传中…' : busy === 'save' ? '正在保存…' : peopleDirty ? '有未保存的修改' : draft ? '已与网站同步' : ''}</span>
                <button className="mc2-admin-btn" disabled={isBusy} onClick={() => void loadPeople()}>加载最新内容</button>
                {canEditPeople && <button className="mc2-admin-btn mc2-admin-btn-primary" disabled={!peopleDirty || isBusy || conflict} onClick={() => void save()}>{busy === 'save' ? '正在保存…' : '保存更改'}</button>}</>}
              </div></div>
              <nav className="mc2-admin-tabs" aria-label="内容类型"><button className="mc2-admin-tab" aria-pressed={tab === 'members'} disabled={isBusy} onClick={() => { setTab('members'); setSearch(''); setSelection(null); }}>当前成员{draft ? ` · ${draft.content.en.members.length}` : ''}</button><button className="mc2-admin-tab" aria-pressed={tab === 'alumni'} disabled={isBusy} onClick={() => { setTab('alumni'); setSearch(''); setSelection(null); }}>校友{draft ? ` · ${alumniCount}` : ''}</button><button className="mc2-admin-tab" aria-pressed={tab === 'news'} disabled={isBusy} onClick={() => { setNewsVisited(true); setTab('news'); }}>News{newsDirty ? ' · 未保存' : ''}</button></nav>
              {newsVisited && <div hidden={tab !== 'news'}><AdminNewsEditor key={`${session.user.username}:${session.user.role}`} role={session.user.role} csrfToken={session.csrfToken} onUnauthorized={onNewsUnauthorized} onDirtyChange={setNewsDirty} onBusyChange={setNewsBusy} /></div>}
              <div hidden={tab === 'news'}>
              {!canEditPeople && <p className="mc2-admin-notice" role="status">{session.user.role === 'editor' ? '编辑账号可在 News 中新建和修改未发布的新闻草稿。成员与校友资料保存后会直接更新公开网站，因此仅管理员可修改。' : '未识别到有效账号权限，内容暂为只读。请重新登录或联系管理员。'}</p>}
              {(error || conflict) && <div className="mc2-admin-alert" role="alert"><p>{conflict ? '另一位管理员已更新了内容。你的修改仍保留在此页面，尚未覆盖网站。请先下载草稿，再加载最新内容并重新应用修改。' : error}</p>{conflict && <div className="mc2-admin-actions"><button className="mc2-admin-btn" onClick={downloadDraft}>下载本地草稿</button><button className="mc2-admin-btn" disabled={isBusy} onClick={() => void loadPeople()}>加载最新内容</button></div>}</div>}
              {notice && <p className="mc2-admin-notice" role="status">{notice}</p>}
              {!draft ? <p className="mc2-admin-empty" role="status">{busy === 'load' ? '正在加载成员资料…' : '尚未加载资料，请点击“加载最新内容”重试。'}</p> : <>

                <div className="mc2-admin-workspace">
                  <aside className="mc2-admin-sidebar" aria-label={tab === 'members' ? '成员列表' : '校友列表'}>
                    <input className="mc2-admin-search" type="search" aria-label="搜索中英文姓名与资料" placeholder="搜索姓名、职务或方向…" value={search} onChange={event => setSearch(event.target.value)} />
                    {canEditPeople && <div className="mc2-admin-actions">{tab === 'members' ? <button className="mc2-admin-btn" disabled={isBusy} onClick={addMember}>＋ 新增成员</button> : <><button className="mc2-admin-btn" disabled={isBusy} onClick={() => addAlumni()}>＋ 新增校友</button><button className="mc2-admin-btn mc2-admin-btn-quiet" disabled={isBusy} onClick={addGroup}>新增分组</button></>}</div>}
                    <div className="mc2-admin-roster">
                      {tab === 'members' ? filteredMembers.length ? filteredMembers.map(member => <button type="button" className="mc2-admin-row" key={member.key} aria-pressed={selection?.kind === 'member' && selection.key === member.key} disabled={isBusy} onClick={() => setSelection({ kind: 'member', key: member.key })}><Portrait src={member.photo} name={member.name} /><span><strong>{member.name || '未命名成员'}</strong><small>{draft.content['zh-CN'].members.find(item => item.key === member.key)?.name || roleLabels[member.role]}</small></span></button>) : <p className="mc2-admin-empty">没有匹配的成员。</p>
                        : draft.content.en.alumniGroups.map((group, groupIndex) => {
                          const translated = draft.content['zh-CN'].alumniGroups[groupIndex];
                          const groupMatches = !query || `${group.heading} ${translated?.heading}`.toLocaleLowerCase().includes(query);
                          const entries = group.entries.map((entry, index) => ({ entry, index })).filter(({ entry, index }) => groupMatches || `${entry.name} ${entry.detail} ${translated?.entries[index]?.name} ${translated?.entries[index]?.detail}`.toLocaleLowerCase().includes(query));
                          if (!groupMatches && !entries.length) return null;
                          return <div key={groupIndex}><button className="mc2-admin-group-title" disabled={isBusy} onClick={() => setSelection({ kind: 'alumni', group: groupIndex, entry: null })}>{translated?.heading || group.heading || '未命名分组'} · {canEditPeople ? '编辑分组' : '查看分组'}</button>{entries.map(({ entry, index }) => <button className="mc2-admin-row" key={index} disabled={isBusy} aria-pressed={selection?.kind === 'alumni' && selection.group === groupIndex && selection.entry === index} onClick={() => setSelection({ kind: 'alumni', group: groupIndex, entry: index })}><span><strong>{entry.name || '未命名校友'}</strong><small>{translated?.entries[index]?.name || entry.detail}</small></span></button>)}</div>;
                        })}
                    </div>
                  </aside>
                  <section className="mc2-admin-editor" aria-label={canEditPeople ? '资料编辑' : '资料查看'}>
                    {selection?.kind === 'member' && selectedMember ? <>
                      <div className="mc2-admin-editor-head"><h2>{selectedMember.name || '新增成员'}</h2>{canEditPeople && <button className="mc2-admin-btn mc2-admin-btn-danger" disabled={isBusy} onClick={() => deleteMember(selectedMember.key, selectedMember.name)}>删除成员</button>}</div>
                      <fieldset disabled={isBusy || !canEditPeople}>
                        <div className="mc2-admin-photo"><Portrait src={selectedMember.photo} name={selectedMember.name} large /><div><Field label="照片路径" hint="可使用已有站内照片，或上传 JPEG、PNG、WebP（最多 5 MiB）。"><input maxLength={2048} value={selectedMember.photo} placeholder="/images/Team_Profile_Pic/…" onChange={event => updateSharedMember(selectedMember.key, 'photo', event.target.value)} /></Field>{canEditPeople && <label className="mc2-admin-upload">上传照片<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="上传成员照片" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void uploadPhoto(selectedMember.key, file); }} /></label>}</div></div>
                        <div className="mc2-admin-common"><Field label="成员类别" hint="这里的行政职务只用于公开页面分类。"><select value={selectedMember.role} onChange={event => updateSharedMember(selectedMember.key, 'role', event.target.value)}>{Object.entries(roleLabels).map(([role, label]) => <option value={role} key={role}>{label}</option>)}</select></Field><Field label="入组年份（可留空）"><input type="number" min={1950} max={2100} value={selectedMember.cohortYear ?? ''} onChange={event => updateSharedMember(selectedMember.key, 'cohortYear', event.target.value === '' ? null : Number(event.target.value))} /></Field></div>
                        <div className="mc2-admin-common"><Field label="入组学期 · Term"><select value={selectedMember.cohortTerm} onChange={event => updateSharedMember(selectedMember.key, 'cohortTerm', event.target.value)}><option value="">未填写</option><option value="Spring">Spring / 春季</option><option value="Fall">Fall / 秋季</option></select></Field><Field label="个人主页 · Website" hint="HTTPS 链接或站内路径；中英文页面共用。"><input maxLength={2048} value={selectedMember.website} placeholder="https://… 或 /people#…" onChange={event => updateSharedMember(selectedMember.key, 'website', event.target.value)} /></Field></div>
                        <div className="mc2-admin-columns">{languages.map(language => {
                          const member = draft.content[language].members.find(item => item.key === selectedMember.key);
                          if (!member) return <p key={language} role="alert">缺少对应语言资料，请加载最新内容。</p>;
                          return <div key={language} lang={language}><h3 className="mc2-admin-language">{language === 'en' ? 'English' : '中文'}</h3>
                            <Field label={language === 'en' ? '姓名 · Name *' : '姓名 *'}><input required maxLength={160} value={member.name} onChange={event => updateMember(language, member.key, 'name', event.target.value)} /></Field>
                            <Field label="职务名称 · Position *"><input required maxLength={300} value={member.positionTitle} onChange={event => updateMember(language, member.key, 'positionTitle', event.target.value)} /></Field>
                            <Field label="研究方向 · Research"><textarea maxLength={2000} value={member.researchDirection} onChange={event => updateMember(language, member.key, 'researchDirection', event.target.value)} /></Field>
                          </div>;
                        })}</div>
                      </fieldset>
                    </> : selection?.kind === 'alumni' && selectedAlumniGroup ? <>
                      <div className="mc2-admin-editor-head"><h2>{selection.entry === null ? selectedAlumniGroup.heading || '新增分组' : selectedAlumniGroup.entries[selection.entry]?.name || '新增校友'}</h2>{canEditPeople && <button className="mc2-admin-btn mc2-admin-btn-danger" disabled={isBusy} onClick={() => deleteAlumni(selection.group, selection.entry)}>{selection.entry === null ? '删除分组' : '删除校友'}</button>}</div>
                      <fieldset disabled={isBusy || !canEditPeople}><div className="mc2-admin-columns">{languages.map(language => {
                        const group = draft.content[language].alumniGroups[selection.group];
                        const entry = selection.entry !== null ? group?.entries[selection.entry] : undefined;
                        if (!group) return <p key={language} role="alert">缺少对应语言分组，请加载最新内容。</p>;
                        return <div key={language} lang={language}><h3 className="mc2-admin-language">{language === 'en' ? 'English' : '中文'}</h3><Field label="分组标题 · Group *"><input required maxLength={160} value={group.heading} onChange={event => updateAlumni(language, selection.group, null, 'heading', event.target.value)} /></Field>{entry && <><Field label="姓名 · Name *"><input required maxLength={160} value={entry.name} onChange={event => updateAlumni(language, selection.group, selection.entry, 'name', event.target.value)} /></Field><Field label="校友信息 · Details"><textarea maxLength={2000} value={entry.detail} placeholder={language === 'en' ? 'Degree, graduation year, destination…' : '学位、毕业年份、去向等…'} onChange={event => updateAlumni(language, selection.group, selection.entry, 'detail', event.target.value)} /></Field></>}</div>;
                      })}</div></fieldset>
                      {canEditPeople && selection.entry === null && <button className="mc2-admin-btn" disabled={isBusy} onClick={() => addAlumni(selection.group)}>＋ 在此分组新增校友</button>}
                    </> : <p className="mc2-admin-empty">从左侧选择{tab === 'members' ? '成员' : '校友或分组'}{canEditPeople ? '，或新增一条资料。' : '查看详情。'}</p>}
                  </section>
                </div>
              </>}
              </div>
              </main>
            </>}
  </div>;
}

export default AdminPeoplePage;
