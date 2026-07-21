import React from 'react';
import FloatingContactMenu from '../FloatingContactMenu';
import type { ProjectItem, ProjectPageContent } from '../../types/legacyPages';
import {
  PROJECT_CARD_CLASS,
  PROJECT_COL_12_CLASS,
  PROJECT_CONTAINER_CLASS,
  PROJECT_DESCRIPTION_CLASS,
  PROJECT_HEADING_CLASS,
  PROJECT_IMAGE_CLASS,
  PROJECT_IMAGE_COLUMN_CLASS,
  PROJECT_LINK_CLASS,
  PROJECT_PEOPLE_CLASS,
  PROJECT_PLAIN_CARD_CLASS,
  PROJECT_ROW_CLASS,
  PROJECT_SECTION_CLASS,
  PROJECT_STANDARD_IMAGE_CLASS,
  PROJECT_TAG_CLASS,
  PROJECT_TEXT_COLUMN_CLASS,
  PROJECT_TITLE_CLASS,
  PROJECT_YEAR_CLASS
} from './projectStyles';

interface ProjectContentProps {
  content: ProjectPageContent;
}

function ProjectCard({ project }: { project: ProjectItem }): JSX.Element {
  const body = (
    <div className={project.href ? `project-spotlight-card ${PROJECT_CARD_CLASS}` : PROJECT_PLAIN_CARD_CLASS}>
      <div className={`${PROJECT_IMAGE_COLUMN_CLASS} ${project.id === 'project-5' ? 'justify-start!' : 'justify-center!'}`}>
        <img src={project.image} alt={project.imageAlt} className={project.href ? PROJECT_IMAGE_CLASS : PROJECT_STANDARD_IMAGE_CLASS} />
      </div>
      <div className={`${PROJECT_TEXT_COLUMN_CLASS} ${project.id === 'project-1' ? 'gap-[.25em]!' : 'gap-[.5em]!'}`}>
        <h4 className={PROJECT_TITLE_CLASS}>{project.title}</h4>
        <p className={PROJECT_PEOPLE_CLASS}>{project.people}</p>
        <div>
          {project.tags.map((tag) => (
            <div className={PROJECT_TAG_CLASS} key={tag}>{tag}</div>
          ))}
        </div>
        <div>
          {project.descriptions.map((description) => (
            <p className={PROJECT_DESCRIPTION_CLASS} key={description}>{description}</p>
          ))}
        </div>
      </div>
    </div>
  );

  if (!project.href) return body;

  return (
    <a className={`group ${PROJECT_LINK_CLASS}`} href={project.href} target='_blank' rel='noopener noreferrer' aria-label='Open Surreality project website'>
      {body}
    </a>
  );
}

export default function ProjectContent({ content }: ProjectContentProps): JSX.Element {
  return (
    <>
      <div className={PROJECT_SECTION_CLASS}>
        <div className={PROJECT_CONTAINER_CLASS}>
          <div className={`${PROJECT_ROW_CLASS} justify-center!`}>
            <div className={`${PROJECT_COL_12_CLASS} pt-[100px]! text-center!`}>
              <h3 className={PROJECT_HEADING_CLASS}>{content.pageHeading}</h3>
            </div>

            <div className={`${PROJECT_COL_12_CLASS} mt-[1rem]!`}>
              <section id='yr2024' className={PROJECT_YEAR_CLASS}>
                {content.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </section>
            </div>
          </div>
        </div>
      </div>
      <FloatingContactMenu transparentSurface wrapperClassName='max-[640px]:hidden!' />
    </>
  );
}
