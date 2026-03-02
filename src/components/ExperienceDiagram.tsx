import type { ResumeExperience } from "../data/resumeData";

type ExperienceDiagramProps = {
  experiences: ResumeExperience[];
};

function ExperienceDiagram({ experiences }: ExperienceDiagramProps) {
  return (
    <div className="experience-diagram">
      {experiences.map((experience) => (
        <article key={experience.company} className="experience-card" data-reveal>
          <p className="timeline-period">{experience.period}</p>
          <h3>
            {experience.company} - {experience.role}
          </h3>
          <p>{experience.summary}</p>
          <ul className="system-list">
            {experience.systems.map((system) => (
              <li key={system}>{system}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export default ExperienceDiagram;
