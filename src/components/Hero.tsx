import type { ReactNode } from "react";
import type { ResumeData } from "../data/resumeData";

type HeroProps = {
  identity: ResumeData["identity"];
  tags: string[];
  chatbotSlot?: ReactNode;
};

function Hero({ identity, tags, chatbotSlot }: HeroProps) {
  return (
    <section id="top" className="hero container">
      <div className="hero-glow" aria-hidden="true" />
      <p className="eyebrow">Resume-bound portfolio</p>
      <h1 data-reveal>{identity.name.toUpperCase()}</h1>
      <p className="hero-subtitle" data-reveal>
        {identity.headline}
      </p>
      <ul className="pill-row" data-reveal aria-label="Resume tags">
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {chatbotSlot && <div className="hero-chatbot-slot">{chatbotSlot}</div>}
      <div className="hero-actions" data-reveal>
        <a className="btn btn-primary" href="#projects">
          View Projects
        </a>
        <a className="btn btn-secondary" href={identity.ctaHref}>
          {identity.ctaLabel}
        </a>
      </div>
    </section>
  );
}

export default Hero;
