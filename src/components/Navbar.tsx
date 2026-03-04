import { useEffect, useMemo, useState } from "react";
import { resumeData, resumeSections } from "../data/resumeData";

function Navbar() {
  const visibleSections = useMemo(
    () =>
      resumeSections.filter((section) =>
        ["education", "experience", "projects", "globe", "contact"].includes(section.id)
      ),
    []
  );
  const [activeSection, setActiveSection] = useState<string>("education");

  useEffect(() => {
    const sectionIds = visibleSections.map((section) => section.id);

    const updateFromScroll = () => {
      let current = sectionIds[0];
      const offset = 140;
      sectionIds.forEach((id) => {
        const node = document.getElementById(id);
        if (!node) return;
        const top = node.getBoundingClientRect().top;
        if (top - offset <= 0) current = id;
      });
      setActiveSection(current);
    };

    const updateFromHash = () => {
      const hashId = window.location.hash.replace("#", "");
      const matched = sectionIds.find((id) => id === hashId);
      if (matched) {
        setActiveSection(matched);
      }
    };

    updateFromHash();
    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, [visibleSections]);

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Primary">
        <a className="brand" href="#top">
          AR
        </a>
        <ul className="nav-links">
          {visibleSections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={activeSection === section.id ? "is-active" : ""}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
        <a className="btn btn-primary nav-resume" href={resumeData.identity.resumeFile} download>
          Download Resume
        </a>
      </nav>
    </header>
  );
}

export default Navbar;
