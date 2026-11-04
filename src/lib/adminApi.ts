import type { PeoplePageContent } from '../types/legacyPages';

export type PeopleContent = { en: PeoplePageContent; 'zh-CN': PeoplePageContent };
export type PeopleRevision = number | string;
export interface PeopleSnapshot { revision: PeopleRevision; content: PeopleContent }
export type AdminRole = 'admin' | 'editor';
export interface AdminSession {
  user: { username: string; mustChangePassword: boolean; role: AdminRole };
  csrfToken: string;
}

export class AdminApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'AdminApiError';
  }
}

async function request<T>(path: string, options: {
  method?: string; body?: unknown; csrfToken?: string; signal?: AbortSignal;
} = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  const isForm = options.body instanceof FormData;
  if (options.body !== undefined && !isForm) headers.set('Content-Type', 'application/json');
  if (options.csrfToken) headers.set('X-CSRF-Token', options.csrfToken);
  let response: Response;
  try {
    response = await fetch(path, {
      method: options.method ?? 'GET', credentials: 'same-origin', cache: 'no-store', headers,
      body: options.body === undefined ? undefined : isForm ? options.body as FormData : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new AdminApiError('无法连接网站服务，请检查网络后重试。', 0);
  }
  const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok) {
    const fallback = response.status === 401 ? '登录已过期，请重新登录。'
      : response.status === 403 ? '当前账号没有此操作权限。'
      : response.status === 409 ? '内容已被其他管理员更新。请保留本地草稿，再加载最新内容。'
        : response.status === 429 ? '操作过于频繁，请稍后重试。' : `请求失败（${response.status}），请重试。`;
    const message = typeof payload?.message === 'string' ? payload.message
      : typeof payload?.error === 'string' ? payload.error : fallback;
    throw new AdminApiError(message, response.status, typeof payload?.code === 'string' ? payload.code : payload?.requirePasswordChange === true ? 'requirePasswordChange' : undefined);
  }
  return payload as T;
}

export const adminApi = {
  session: (signal?: AbortSignal) => request<AdminSession>('/api/admin/session', { signal }),
  login: (username: string, password: string) => request<AdminSession>('/api/admin/login', { method: 'POST', body: { username, password } }),
  logout: (csrfToken: string) => request<void>('/api/admin/logout', { method: 'POST', csrfToken }),
  password: (csrfToken: string, currentPassword: string, newPassword: string) => request<unknown>('/api/admin/password', {
    method: 'POST', csrfToken, body: { currentPassword, newPassword },
  }),
  people: (signal?: AbortSignal) => request<PeopleSnapshot>('/api/people', { signal }),
  save: (csrfToken: string, snapshot: PeopleSnapshot) => request<{ revision: PeopleRevision }>('/api/admin/people', {
    method: 'PUT', csrfToken, body: snapshot,
  }),
  upload: (csrfToken: string, file: File) => {
    const body = new FormData();
    body.append('file', file);
    return request<{ url: string }>('/api/admin/photos', { method: 'POST', csrfToken, body });
  },
};
