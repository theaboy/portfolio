import { useEffect, useState } from "react";
import Contact from "./components/Contact";
import CertificationList from "./components/CertificationList";
import EducationPanel from "./components/EducationPanel";
import ExperienceDiagram from "./components/ExperienceDiagram";
import Hero from "./components/Hero";
import LeadershipPanel from "./components/LeadershipPanel";
import Navbar from "./components/Navbar";
import ProjectCard from "./components/ProjectCard";
import ResumeChatbot from "./components/ResumeChatbot";
import SkillsPlanet from "./components/SkillsPlanet";
import Section from "./components/Section";
import { resumeData, type ResumeProject } from "./data/resumeData";
import { getGlobeRegions } from "./data/resumeSelectors";

function App() {
  const [activeCaseStudy, setActiveCaseStudy] = useState<ResumeProject | null>(null);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!activeCaseStudy) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveCaseStudy(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeCaseStudy]);

  const globeRegions = getGlobeRegions();

  return (
    <>
      <Navbar />

      <main>
        <Hero
          identity={resumeData.identity}
          tags={resumeData.headerTags}
          chatbotSlot={<ResumeChatbot resume={resumeData} compact />}
        />

        <Section
          id="education"
          title="Education"
          subtitle="Academic training built for machine learning, backend systems, and mathematically grounded engineering."
        >
          <EducationPanel education={resumeData.education} />
        </Section>

        <Section
          id="experience"
          title="Experience"
          subtitle="System-level responsibilities translated into architecture components."
        >
          <ExperienceDiagram experiences={resumeData.experience} />
        </Section>

        <Section
          id="projects"
          title="Technical Projects"
          subtitle="Problem, approach, technologies, and impact from resume entries."
        >
          <div className="projects-grid">
            {resumeData.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpenCaseStudy={() => setActiveCaseStudy(project)}
              />
            ))}
          </div>
        </Section>

        <Section
          id="globe"
          title="Skills Globe"
          subtitle="Interactive skill map with evidence from work experience and projects."
        >
          <SkillsPlanet regions={globeRegions} />
        </Section>

        <Section
          id="certifications"
          title="Certifications"
          subtitle="Verified achievements only."
        >
          <CertificationList items={resumeData.certifications} />
        </Section>

        <Section
          id="leadership"
          title="Leadership"
          subtitle="Leadership profile mirrored from resume data."
        >
          <LeadershipPanel leadership={resumeData.leadership} />
        </Section>

        <Section
          id="contact"
          title="Contact"
          subtitle="Email, social links, and a direct way to start a conversation."
        >
          <Contact identity={resumeData.identity} />
        </Section>
      </main>

      {activeCaseStudy && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActiveCaseStudy(null);
            }
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-study-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setActiveCaseStudy(null)}
              aria-label="Close case study"
            >
              Close
            </button>
            <p className="eyebrow">Project Structure</p>
            <h3 id="case-study-title">{activeCaseStudy.title}</h3>
            <div className="case-list">
              <h4>Problem</h4>
              <p>{activeCaseStudy.problem}</p>
            </div>
            <div className="case-list">
              <h4>Approach</h4>
              <p>{activeCaseStudy.approach}</p>
            </div>
            <div className="case-list">
              <h4>Technologies</h4>
              <ul>
                {activeCaseStudy.skillsUsed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="case-list">
              <h4>Impact</h4>
              <p>{activeCaseStudy.impact}</p>
            </div>
            {activeCaseStudy.recognition && (
              <div className="case-list">
                <h4>Recognition</h4>
                <p>{activeCaseStudy.recognition}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
