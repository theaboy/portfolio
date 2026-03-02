import type { ResumeData } from "../data/resumeData";

type EducationPanelProps = {
  education: ResumeData["education"];
};

function EducationPanel({ education }: EducationPanelProps) {
  return (
    <article className="education-card" data-reveal>
      <h3>{education.institution}</h3>
      <p>{education.degree}</p>
      <p className="timeline-period">{education.period}</p>
      <ul className="badge-list" aria-label="Academic pillars">
        {education.pillars.map((pillar) => (
          <li key={pillar}>{pillar}</li>
        ))}
      </ul>
      <p className="education-foundation">{education.foundation}</p>
    </article>
  );
}

export default EducationPanel;
