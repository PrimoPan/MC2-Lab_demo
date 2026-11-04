import { useCallback, useEffect, useState } from 'react';
import { peoplePageContent } from '../data/legacyPageContent';
import type { LocalizedContent, PeoplePageContent } from '../types/legacyPages';

const usesApi = import.meta.env.VITE_PEOPLE_API_ENABLED === 'true';

/** Campus content comes from the database. Static-only mirrors keep their build snapshot. */
export function usePeopleData() {
  const [content, setContent] = useState<LocalizedContent<PeoplePageContent> | null>(usesApi ? null : peoplePageContent);
  const [error, setError] = useState(false);
  const [request, setRequest] = useState(0);
  const reload = useCallback(() => setRequest((value) => value + 1), []);

  useEffect(() => {
    if (!usesApi) return;
    const controller = new AbortController();
    setError(false);
    fetch('/api/people', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('People data unavailable');
        const result = await response.json();
        if (!Array.isArray(result.content?.en?.members) || !Array.isArray(result.content?.['zh-CN']?.members)) {
          throw new Error('Invalid people data');
        }
        setContent(result.content);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [request]);

  useEffect(() => {
    if (!usesApi) return;
    window.addEventListener('focus', reload);
    return () => window.removeEventListener('focus', reload);
  }, [reload]);

  return { content, error, reload };
}
