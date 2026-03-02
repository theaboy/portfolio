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
import ResumeGlobe from "./components/ResumeGlobe";
import Section from "./components/Section";
import SkillGrid from "./components/SkillGrid";
import { resumeData, type ResumeProject } from "./data/resumeData";
import { getGlobeRegions, getSkillCategories } from "./data/resumeSelectors";

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

  const skillCategories = getSkillCategories();
  const globeRegions = getGlobeRegions();

  return (
    <>
      <Navbar />
      <a className="floating-resume-btn" href={resumeData.identity.resumeFile}>
        Resume
      </a>

      <main>
        <Hero identity={resumeData.identity} tags={resumeData.headerTags} />

        <Section
          id="education"
          title="Education"
          subtitle="Academic foundations mapped to systems and machine learning work."
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
          id="skills"
          title="Skills"
          subtitle="Resume skill categories powering UI tags, globe regions, and project mappings."
        >
          <SkillGrid categories={skillCategories} />
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
          subtitle="Conversion-focused actions for resume review and opportunity discussions."
        >
          <Contact identity={resumeData.identity} />
        </Section>

        <Section
          id="globe"
          title="3D Skill Globe"
          subtitle="Categories and usage mapping derived directly from resume skills and project/experience links."
        >
          <ResumeGlobe regions={globeRegions} />
        </Section>

        <Section
          id="chatbot"
          title="Resume Chatbot"
          subtitle="Strict mode responses based only on listed resume entities."
        >
          <ResumeChatbot resume={resumeData} />
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
