import React from 'react';
import ProjectContent from '../components/project/ProjectContent';
import { PROJECT_SHELL_CLASS } from '../components/project/projectStyles';
import SitePageShell from '../components/SitePageShell';
import { projectPageContent } from '../data/legacyPageContent';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Locale } from '../types/common';

interface ProjectPageProps {
  locale?: Locale;
}

export default function ProjectPage({ locale = 'en' }: ProjectPageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');

  const content = projectPageContent[locale];
  return (
    <SitePageShell className={PROJECT_SHELL_CLASS} ariaLabel={locale === 'zh-CN' ? '项目' : 'Project'} locale={locale} activeRoute='project'>
      <ProjectContent content={content} />
    </SitePageShell>
  );
}
