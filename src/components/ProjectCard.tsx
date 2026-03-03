import type { ResumeProject } from "../data/resumeData";

type ProjectCardProps = {
  project: ResumeProject;
  onOpenCaseStudy: () => void;
};

function ProjectCard({ project, onOpenCaseStudy }: ProjectCardProps) {
  return (
    <article className="project-card" data-reveal>
      <div className="project-media">
        <img src={project.image} alt={`${project.title} preview`} loading="lazy" />
      </div>
      <div className="project-content">
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
      </div>
      <ul className="badge-list" aria-label={`${project.title} technologies`}>
        {project.skillsUsed.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="project-actions">
        <a
          href={project.githubUrl ?? "#"}
          target={project.githubUrl ? "_blank" : undefined}
          rel={project.githubUrl ? "noreferrer" : undefined}
          className={`project-link-btn ${project.githubUrl ? "" : "is-disabled"}`}
          aria-disabled={!project.githubUrl}
          onClick={(event) => {
            if (!project.githubUrl) event.preventDefault();
          }}
        >
          GitHub
        </a>
        <a
          href={project.demoUrl ?? "#"}
          target={project.demoUrl ? "_blank" : undefined}
          rel={project.demoUrl ? "noreferrer" : undefined}
          className={`project-link-btn ${project.demoUrl ? "" : "is-disabled"}`}
          aria-disabled={!project.demoUrl}
          onClick={(event) => {
            if (!project.demoUrl) event.preventDefault();
          }}
        >
          Live Demo
        </a>
        <button type="button" className="project-detail-btn" onClick={onOpenCaseStudy}>
          Details
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;
