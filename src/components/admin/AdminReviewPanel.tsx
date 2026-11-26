import { useEffect, useMemo, useState } from 'react';
import { adminApi, AdminApiError, type ReviewSnapshot } from '../../lib/adminApi';
import type { Locale } from '../../types/common';
import type { MemberProfile } from '../../types/legacyPages';
import ManagedNewsArticle from '../news/ManagedNewsArticle';
import { LeaderContentView } from '../../pages/LeaderPage';
import defaultLeader from '../../data/leaderContent.json';

const statusLabels = { draft: '草稿 · 尚未提交', submitted: '已提交审核 · 等待批准', published: '已审核发布', rejected: '已退回 · 请修改后重新提交' };
const fieldNames: Record<string, string> = { en: 'English', 'zh-CN': '中文', name: '姓名', role: '类别', positionTitle: '职务', researchDirection: '研究方向', photo: '照片', website: '个人主页', cohortYear: '入组年份', cohortTerm: '入组学期', heading: '分组标题', entries: '校友条目', detail: '校友信息', title: '标题', summary: '摘要', body: '正文', image: '封面', date: '日期', published: '批准后公开', slug: '文章路径', template: '图文模板', blocks: '图文内容', sections: '章节', paragraphs: '段落', projects: '研究项目', pageLabel: '页面栏目', documentTitle: '浏览器标题', profileAlt: '照片说明', subtitle: '职务与简介', meta: '荣誉', homepageLabel: '主页链接文字', homepage: '个人主页', projectsTitle: '研究项目标题' };
type Change = { path: string; before: string; after: string };
const display = (value: unknown): string => value === undefined ? '（无）' : typeof value === 'string' ? value || '（空）' : typeof value === 'boolean' ? value ? '是' : '否' : JSON.stringify(value, null, 2);

function differences(before: unknown, after: unknown, path = ''): Change[] {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (before && after && typeof before === 'object' && typeof after === 'object' && !Array.isArray(before) && !Array.isArray(after)) {
    const left = before as Record<string, unknown>, right = after as Record<string, unknown>;
    return [...new Set([...Object.keys(left), ...Object.keys(right)])].flatMap(key => differences(left[key], right[key], `${path}${path ? ' / ' : ''}${fieldNames[key] || key}`));
  }
  return [{ path, before: display(before), after: display(after) }];
}

function MemberPreview({ member }: { member: MemberProfile }) {
  return <article className="mc2-review-member">
    {member.photo && <img src={member.photo} alt={`${member.name}的照片`} loading="lazy" />}
    <div><h4>{member.name}</h4><p>{member.positionTitle}</p><p>{[member.cohortTerm, member.cohortYear].filter(Boolean).join(' ')}</p><p>{member.researchDirection}</p>{member.website && <a href={member.website} target="_blank" rel="noreferrer">个人主页 ↗</a>}</div>
  </article>;
}

export default function AdminReviewPanel({ csrfToken, onSnapshot, onUnauthorized, onBusyChange }: {
  csrfToken: string; onSnapshot: (snapshot: ReviewSnapshot) => void;
  onUnauthorized: () => void; onBusyChange: (busy: boolean) => void;
}) {
  const [snapshot, setSnapshot] = useState<ReviewSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reason, setReason] = useState('');
  const [locale, setLocale] = useState<Locale>('zh-CN');
  const [view, setView] = useState<'changes' | 'preview'>('changes');
  useEffect(() => { onBusyChange(busy); return () => onBusyChange(false); }, [busy, onBusyChange]);
  function accept(value: ReviewSnapshot) { setSnapshot(value); onSnapshot(value); }
  function fail(cause: unknown) {
    if (cause instanceof AdminApiError && cause.status === 401) onUnauthorized();
    setError(cause instanceof Error ? cause.message : '无法读取审核内容，请重试。');
  }
  async function load() {
    setBusy(true); setError(''); setNotice('');
    try { accept(await adminApi.review()); } catch (cause) { fail(cause); } finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, []);
  const changes = useMemo(() => {
    if (!snapshot) return [];
    const rows: { title: string; kind: string; fields: Change[] }[] = [];
    for (const language of ['en', 'zh-CN'] as const) {
      const before = snapshot.live.people.content[language], after = snapshot.content[language];
      for (const key of new Set([...before.members, ...after.members].map(member => member.key))) {
        const left = before.members.find(member => member.key === key), right = after.members.find(member => member.key === key);
        const fields = differences(left, right);
        if (fields.length) rows.push({ title: `${right?.name || left?.name} · ${language}`, kind: !left ? '新增成员' : !right ? '删除成员' : (right.role === 'chair' || right.role === 'leader') ? '修改负责人' : '修改成员', fields });
      }
      if (JSON.stringify(before.members.map(m => m.key)) !== JSON.stringify(after.members.map(m => m.key))) rows.push({ title: `成员列表 · ${language}`, kind: '列表变化', fields: differences(before.members.map(m => m.name), after.members.map(m => m.name), '成员及顺序') });
      for (let index = 0; index < Math.max(before.alumniGroups.length, after.alumniGroups.length); index++) {
        const left = before.alumniGroups[index], right = after.alumniGroups[index];
        const fields = differences(left, right);
        if (fields.length) rows.push({ title: `${right?.heading || left?.heading || '校友分组'} · ${language}`, kind: '校友变化', fields });
      }
      const leaderFields = differences(before.leader ?? defaultLeader[language], after.leader ?? defaultLeader[language]);
      if (leaderFields.length) rows.push({ title: `负责人独立页面 · ${language}`, kind: '修改负责人', fields: leaderFields });
      const { members: _leftMembers, alumniGroups: _leftGroups, leader: _leftLeader, ...leftRest } = before;
      const { members: _rightMembers, alumniGroups: _rightGroups, leader: _rightLeader, ...rightRest } = after;
      const fields = differences(leftRest, rightRest);
      if (fields.length) rows.push({ title: `页面文字 · ${language}`, kind: '其他资料变化', fields });
    }
    for (const id of new Set([...snapshot.live.news.posts, ...snapshot.posts].map(post => post.id))) {
      const left = snapshot.live.news.posts.find(post => post.id === id), right = snapshot.posts.find(post => post.id === id);
      const fields = differences(left, right);
      if (fields.length) rows.push({ title: right?.title['zh-CN'] || right?.title.en || left?.title.en || id, kind: !left ? '新增新闻' : !right ? '删除新闻' : '修改新闻', fields });
    }
    if (JSON.stringify(snapshot.live.news.posts.map(post => post.id)) !== JSON.stringify(snapshot.posts.map(post => post.id))) rows.push({ title: '新闻列表', kind: '列表变化', fields: differences(snapshot.live.news.posts.map(post => post.title.en), snapshot.posts.map(post => post.title.en), '新闻及顺序') });
    return rows;
  }, [snapshot]);
  async function action(kind: 'submit' | 'approve' | 'reject') {
    if (!snapshot || busy) return;
    if (kind === 'reject' && !reason.trim()) { setError('请填写退回原因。'); return; }
    const messages = { submit: '将本次已保存的成员、校友、负责人和新闻全部提交审核？官网将在审核批准后更新。', approve: '批准并发布当前预览中的全部变更？所有成员、校友、负责人和新闻变化将同时生效。', reject: '退回本次全部变更供编辑修改？官网将保持当前内容。' };
    if (!window.confirm(messages[kind])) return;
    setBusy(true); setError(''); setNotice('');
    try {
      accept(await adminApi.reviewAction(csrfToken, kind, snapshot.revision, reason.trim()));
      setNotice(kind === 'submit' ? '已提交审核，等待最终审核人批准。官网尚未变化。' : kind === 'approve' ? '全部变更已审核发布，官网现已更新。' : '已退回编辑，官网尚未变化。');
      setReason('');
    } catch (cause) { fail(cause); } finally { setBusy(false); }
  }
  return <section className="mc2-review" aria-label="全量预览与审核">
    <div className="mc2-admin-editor-head"><div><h2>全量预览与审核</h2><p className="mc2-admin-muted">这里汇总所有已保存的修改；只有最终审核人可批准发布。</p></div><button className="mc2-admin-btn" disabled={busy} onClick={() => void load()}>刷新审核内容</button></div>
    {error && <p className="mc2-admin-alert" role="alert">{error}</p>}
    {notice && <p className="mc2-admin-notice" role="status">{notice}</p>}
    {!snapshot ? <p role="status">{busy ? '正在读取完整变更…' : '暂时无法读取审核内容。'}</p> : <>
      <div className="mc2-review-status"><strong>{statusLabels[snapshot.workflow.status]}</strong><span>版本 {snapshot.revision} · {changes.length} 项变化</span>{snapshot.workflow.submittedBy && <span>提交人：{snapshot.workflow.submittedBy}</span>}</div>
      {snapshot.workflow.reason && <p className="mc2-admin-alert">退回原因：{snapshot.workflow.reason}</p>}
      <div className="mc2-admin-actions mc2-review-controls"><button className="mc2-admin-btn" aria-pressed={view === 'changes'} onClick={() => setView('changes')}>对比全部变化</button><button className="mc2-admin-btn" aria-pressed={view === 'preview'} onClick={() => setView('preview')}>预览修改后的内容</button></div>
      {view === 'changes' ? <div className="mc2-review-diffs">{changes.length === 0 ? <p className="mc2-admin-empty">暂无待发布的内容变化。</p> : changes.map((change, index) => <details className="mc2-review-diff" key={index} open={changes.length <= 4}><summary><span>{change.kind}</span> {change.title}</summary><div className="mc2-review-table-wrap"><table><thead><tr><th>字段</th><th>当前官网 / 已批准内容</th><th>本次待审核内容</th></tr></thead><tbody>{change.fields.map((field, fieldIndex) => <tr key={fieldIndex}><th>{field.path || '完整记录'}</th><td><pre>{field.before}</pre></td><td><pre>{field.after}</pre></td></tr>)}</tbody></table></div></details>)}</div> : <div className="mc2-review-preview">
        <label className="mc2-admin-field"><span>预览语言</span><select value={locale} onChange={event => setLocale(event.target.value as Locale)}><option value="zh-CN">中文</option><option value="en">English</option></select></label>
        <h3>负责人独立页面</h3><details className="mc2-review-diff"><summary>预览负责人完整页面</summary><div className="mc2-review-leader-preview"><LeaderContentView content={snapshot.content[locale].leader ?? defaultLeader[locale]} /></div></details>
        <h3>成员与负责人名片</h3><div className="mc2-review-members">{snapshot.content[locale].members.map(member => <MemberPreview key={member.key} member={member} />)}</div>
        <h3>校友</h3>{snapshot.content[locale].alumniGroups.map((group, index) => <section className="mc2-review-alumni" key={index}><h4>{group.heading}</h4><ul>{group.entries.map((entry, entryIndex) => <li key={entryIndex}><strong>{entry.name}</strong> {entry.detail}</li>)}</ul></section>)}
        <h3>新闻</h3>{snapshot.posts.length ? snapshot.posts.map(post => <details className="mc2-review-diff" key={post.id}><summary>{post.title[locale] || post.title.en} · {post.published ? '批准后公开' : '保留为新闻草稿'}</summary><ManagedNewsArticle post={post} locale={locale} preview /></details>) : <p>暂无新闻。</p>}
      </div>}
      <footer className="mc2-review-footer">
        {snapshot.workflow.status !== 'submitted' && <button className="mc2-admin-btn mc2-admin-btn-primary" disabled={busy || changes.length === 0} onClick={() => void action('submit')}>提交审核 · 全部变更</button>}
        {snapshot.workflow.status === 'submitted' && !snapshot.workflow.canReview && <p>已提交审核。最终审核人：{snapshot.workflow.reviewer || 'primo'}。如继续编辑保存，本次提交将退回草稿，需要重新提交。</p>}
        {snapshot.workflow.canReview && snapshot.workflow.status === 'submitted' && <><p>本次操作覆盖上述全部变化。发布版本：{snapshot.revision}。</p><label className="mc2-admin-field"><span>退回原因（退回时必填）</span><textarea maxLength={2000} value={reason} disabled={busy} onChange={event => setReason(event.target.value)} /></label><div className="mc2-admin-actions"><button className="mc2-admin-btn mc2-admin-btn-primary" disabled={busy} onClick={() => void action('approve')}>批准并发布全部变更</button><button className="mc2-admin-btn mc2-admin-btn-danger" disabled={busy} onClick={() => void action('reject')}>退回修改</button></div></>}
      </footer>
    </>}
  </section>;
}
