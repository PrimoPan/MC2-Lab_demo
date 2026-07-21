import React from 'react';
import FloatingContactMenu from '../FloatingContactMenu';
import type { ProjectItem, ProjectPageContent } from '../../types/legacyPages';

interface ProjectContentProps {
  content: ProjectPageContent;
}

function ProjectCard({ project }: { project: ProjectItem }): JSX.Element {
  const body = (
    <div className={`${project.href ? 'row project-spotlight-card' : 'row'} mb-[2em]!`}>
      <div className={`col-md-5 flex! items-start! pt-[30px]! ${project.id === 'project-5' ? 'justify-start!' : 'justify-center!'}`}>
        <img src={project.image} alt={project.imageAlt} className={project.href ? 'project-spotlight-image' : 'max-w-full!'} />
      </div>
      <div className={`col-md-7 flex! flex-col! ${project.id === 'project-1' ? 'gap-[.25em]!' : 'gap-[.5em]!'}`}>
        <h4 className='text-[2rem]!'>{project.title}</h4>
        <p className='people'>{project.people}</p>
        <div>
          {project.tags.map((tag) => (
            <div className='publication-btn mb-[.5em]!' key={tag}>{tag}</div>
          ))}
        </div>
        <div>
          {project.descriptions.map((description) => (
            <p className='description text-justify!' key={description}>{description}</p>
          ))}
        </div>
      </div>
    </div>
  );

  if (!project.href) return body;

  return (
    <a className='project-spotlight-link' href={project.href} target='_blank' rel='noopener noreferrer' aria-label='Open Surreality project website'>
      {body}
    </a>
  );
}

export default function ProjectContent({ content }: ProjectContentProps): JSX.Element {
  return (
    <>
      <div className='publication-section'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-12 pt-[100px]! text-center'>
              <h3>{content.pageHeading}</h3>
            </div>

            <div className='col-12 mt-3'>
              <section id='yr2024'>
                {content.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </section>
            </div>
          </div>
        </div>
      </div>
      <FloatingContactMenu />
    </>
  );
}
