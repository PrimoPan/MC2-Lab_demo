import React from 'react';
import PeopleContent from '../components/people/PeopleContent';
import { PEOPLE_SHELL_CLASS } from '../components/people/peopleStyles';
import SitePageShell from '../components/SitePageShell';
import { usePeopleData } from '../hooks/usePeopleData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Locale } from '../types/common';

interface PeoplePageProps {
  locale?: Locale;
}

export default function PeoplePage({ locale = 'en' }: PeoplePageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');
  const { content, error, reload } = usePeopleData();
  return (
    <SitePageShell className={PEOPLE_SHELL_CLASS} ariaLabel={locale === 'zh-CN' ? '成员' : 'People'} locale={locale} activeRoute='people'>
      {content ? <PeopleContent content={content[locale]} /> : (
        <div className='px-8! pt-40! text-center! text-white!' role={error ? 'alert' : 'status'}>
          <p>{error ? (locale === 'zh-CN' ? '暂时无法读取成员资料，请重试。' : 'Member information is temporarily unavailable. Please try again.') : (locale === 'zh-CN' ? '正在加载成员资料…' : 'Loading members…')}</p>
          {error && <button type='button' className='mt-4! rounded! border! px-5! py-2!' onClick={reload}>{locale === 'zh-CN' ? '重试' : 'Try again'}</button>}
        </div>
      )}
    </SitePageShell>
  );
}
