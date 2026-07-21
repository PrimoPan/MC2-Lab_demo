import React from 'react';
import ProjectContent from '../components/project/ProjectContent';
import SitePageShell from '../components/SitePageShell';
import { projectPageContent } from '../data/legacyPageContent';
import { useBodyClass } from '../hooks/useBodyClass';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePageStylesheets } from '../hooks/usePageStylesheets';
import { projectPageStyles } from '../styles/legacy/pageStyles';
import type { Locale } from '../types/common';

interface ProjectPageProps {
  locale?: Locale;
}

export default function ProjectPage({ locale = 'en' }: ProjectPageProps): JSX.Element {
  useDocumentTitle('MC2 | HKUST(GZ), HKUST');
  useBodyClass('publication-on');
  usePageStylesheets(projectPageStyles[locale]);

  const content = projectPageContent[locale];
  return (
    <SitePageShell className='project-page-shell' ariaLabel={locale === 'zh-CN' ? '项目' : 'Project'} locale={locale} activeRoute='project'>
      <ProjectContent content={content} />
    </SitePageShell>
  );
}
