import type { ResumeData } from "../data/resumeData";

type ContactProps = {
  identity: ResumeData["identity"];
};

function Contact({ identity }: ContactProps) {
  return (
    <div className="contact-card" data-reveal>
      <p>{identity.summary}</p>
      <div className="contact-links">
        <a href={identity.resumeFile}>Download Resume</a>
        <a href={identity.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href={identity.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={identity.ctaHref}>{identity.ctaLabel}</a>
      </div>
      <p>
        Contact: <a href={`mailto:${identity.email}`}>{identity.email}</a>
      </p>
    </div>
  );
}

export default Contact;
