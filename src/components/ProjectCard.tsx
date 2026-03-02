import type { ResumeProject } from "../data/resumeData";

type ProjectCardProps = {
  project: ResumeProject;
  onOpenCaseStudy: () => void;
};

function ProjectCard({ project, onOpenCaseStudy }: ProjectCardProps) {
  return (
    <article className="project-card" data-reveal>
      <div className="project-content">
        <h3>{project.title}</h3>
        <p>{project.problem}</p>
      </div>
      <ul className="badge-list" aria-label={`${project.title} technologies`}>
        {project.skillsUsed.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="project-actions">
        <button type="button" onClick={onOpenCaseStudy}>
          View Structure
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;
