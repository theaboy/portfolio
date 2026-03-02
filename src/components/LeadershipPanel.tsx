import type { ResumeData } from "../data/resumeData";

type LeadershipPanelProps = {
  leadership: ResumeData["leadership"];
};

function LeadershipPanel({ leadership }: LeadershipPanelProps) {
  return (
    <article className="credential-card" data-reveal>
      <h3>Leadership</h3>
      <ul>
        {leadership.map((item) => (
          <li key={item.organization}>
            <strong>{item.organization}</strong>: {item.title} - {item.summary}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default LeadershipPanel;
