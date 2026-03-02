import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

function Section({ id, title, subtitle, children }: SectionProps) {
  return (
    <section id={id} className="content-section container">
      <div className="section-head" data-reveal>
        <p className="eyebrow">{title}</p>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default Section;
