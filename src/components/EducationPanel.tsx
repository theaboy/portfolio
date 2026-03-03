import type { ResumeData } from "../data/resumeData";

type EducationPanelProps = {
  education: ResumeData["education"];
};

function EducationPanel({ education }: EducationPanelProps) {
  return (
    <div className="education-grid">
      {education.map((entry) => (
        <article key={entry.institution} className="education-card" data-reveal>
          <h3>{entry.institution}</h3>
          <p className="education-degree">{entry.degree}</p>
          <p className="timeline-period">{entry.period}</p>
          <p className="education-positioning">{entry.positioning}</p>
          <ul className="badge-list" aria-label={`${entry.institution} academic pillars`}>
            {entry.pillars.map((pillar) => (
              <li key={`${entry.institution}-${pillar}`}>{pillar}</li>
            ))}
          </ul>
          <p className="education-foundation">{entry.foundation}</p>
        </article>
      ))}
    </div>
  );
}

export default EducationPanel;
