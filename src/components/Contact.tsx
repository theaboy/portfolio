import type { ResumeData } from "../data/resumeData";

type ContactProps = {
  identity: ResumeData["identity"];
};

function Contact({ identity }: ContactProps) {
  const year = new Date().getFullYear();

  return (
    <div className="contact-card" data-reveal>
      <div className="contact-primary">
        <p>
          Email: <a href={`mailto:${identity.email}`}>{identity.email}</a>
        </p>
        <div className="contact-links">
          <a href={identity.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={identity.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={identity.resumeFile}>Resume</a>
        </div>
      </div>

      <form
        className="contact-form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Your name" />
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" />
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows={4} placeholder="Brief message" />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>

      <p className="footer-line">
        (c) {year} {identity.name} - {identity.location}
      </p>
      <p className="contact-summary">{identity.summary}</p>
    </div>
  );
}

export default Contact;

