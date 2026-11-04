import { useCallback, useEffect, useState } from 'react';
import type { NewsPost } from '../types/newsPost';

export function useNewsPosts() {
  const enabled = import.meta.env.VITE_PEOPLE_API_ENABLED === 'true';
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);
  const [request, setRequest] = useState(0);
  const reload = useCallback(() => setRequest((value) => value + 1), []);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch('/api/news', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('News unavailable');
        const result = await response.json();
        if (!Array.isArray(result.posts)) throw new Error('Invalid news');
        setPosts(result.posts.filter((post: NewsPost) => post.published));
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [enabled, request]);
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [enabled, reload]);
  return { posts, loading, error, reload };
}
