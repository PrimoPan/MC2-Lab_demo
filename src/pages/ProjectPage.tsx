import React from 'react';
import LegacyFramePage from '../components/LegacyFramePage';
import type { Locale } from '../types/common';

interface ProjectPageProps {
  locale?: Locale;
}

export default function ProjectPage({ locale = 'en' }: ProjectPageProps): JSX.Element {
  const pagePath = locale === 'zh-CN' ? '/legacy/zh/project.html' : '/legacy/project.html';
  return <LegacyFramePage title="Project" pagePath={pagePath} />;
}
