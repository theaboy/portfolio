import { resumeData, resumeSections } from "../data/resumeData";

function Navbar() {
  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Primary">
        <a className="brand" href="#top">
          AR
        </a>
        <ul className="nav-links">
          {resumeSections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.label}</a>
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
