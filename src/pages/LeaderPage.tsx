import React from 'react';
import LegacyFramePage from '../components/LegacyFramePage';

interface LeaderPageProps {
  locale?: 'en' | 'zh-CN';
}

export default function LeaderPage({ locale = 'en' }: LeaderPageProps): JSX.Element {
  const pagePath = locale === 'zh-CN' ? '/legacy/zh/leader.html' : '/legacy/leader.html';
  const title = locale === 'zh-CN' ? '领导' : 'Leader';
  return <LegacyFramePage title={title} pagePath={pagePath} />;
}
