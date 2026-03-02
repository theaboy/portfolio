export type ResumeSectionId =
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "certifications"
  | "leadership";

export type SkillCategoryName =
  | "Programming"
  | "Web & Backend"
  | "Data & Scientific Computing"
  | "Tools"
  | "Design Software"
  | "Languages";

export type ResumeProject = {
  id: string;
  title: string;
  problem: string;
  approach: string;
  skillsUsed: string[];
  impact: string;
  recognition?: string;
};

export type ResumeExperience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  systems: string[];
  skillsUsed: string[];
};

export type ResumeData = {
  identity: {
    name: string;
    headline: string;
    location: string;
    email: string;
    linkedin: string;
    github: string;
    resumeFile: string;
    ctaLabel: string;
    ctaHref: string;
    summary: string;
  };
  education: {
    institution: string;
    degree: string;
    period: string;
    pillars: string[];
    foundation: string;
  };
  experience: ResumeExperience[];
  projects: ResumeProject[];
  skills: Record<SkillCategoryName, string[]>;
  certifications: string[];
  leadership: {
    title: string;
    organization: string;
    summary: string;
  }[];
  headerTags: string[];
};

export const resumeData: ResumeData = {
  identity: {
    name: "Aymane Radouane",
    headline: "McGill CS & Math | ML + Backend Systems",
    location: "Montreal, QC",
    email: "aymane@example.com",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/",
    resumeFile: "/Aymane_resume.pdf",
    ctaLabel: "Discuss ML / Backend Opportunities",
    ctaHref: "#contact",
    summary:
      "Computer Science and Mathematics student focused on machine learning, backend systems, and production-ready software delivery.",
  },
  education: {
    institution: "McGill University",
    degree: "BA in Computer Science & Mathematics",
    period: "2023 - Present",
    pillars: [
      "Data Structures",
      "Machine Learning",
      "Operating Systems",
      "Linear Algebra",
      "Probability",
    ],
    foundation: "Math + Systems foundation",
  },
  experience: [
    {
      company: "MyTower",
      role: "Software Engineering Intern",
      period: "Summer 2025",
      summary:
        "Contributed to transport management system workflows by building service endpoints and frontend integrations across logistics operations.",
      systems: [
        "Enterprise TMS architecture exposure",
        "RESTful service design",
        "Angular frontend integration",
        "Logistics workflow optimization",
      ],
      skillsUsed: ["Java", "Spring Boot", "Angular", "SQL"],
    },
  ],
  projects: [
    {
      id: "ai-medical-assistant",
      title: "AI Medical Assistant",
      problem: "Patient scheduling friction across intake and follow-up.",
      approach:
        "Built a voice-first workflow that routes intent into scheduling actions and dashboard updates.",
      skillsUsed: ["Python", "SQLite", "n8n"],
      impact:
        "Delivered a working assistant integrating real-time voice input and scheduling automation.",
      recognition: "4th place at MAIS McGill Hackathon",
    },
    {
      id: "microsys-os-simulation",
      title: "microsys OS simulation",
      problem:
        "Need to model low-level system behavior in a controlled educational environment.",
      approach:
        "Implemented operating system simulation components to reason about core scheduling and process behavior.",
      skillsUsed: ["C", "Linux"],
      impact: "Strengthened systems-level reasoning and implementation discipline.",
    },
    {
      id: "bike-sharing-regression",
      title: "Bike Sharing regression project",
      problem:
        "Predicting rental demand accurately for better allocation planning.",
      approach:
        "Implemented linear regression from scratch and iterated with feature engineering and evaluation.",
      skillsUsed: ["Python", "NumPy", "Pandas", "Matplotlib"],
      impact: "Reduced MSE from 5.35x10^5 to 4.53x10^5.",
    },
  ],
  skills: {
    Programming: ["Python", "Java", "C", "OCaml", "SQL"],
    "Web & Backend": [
      "HTML",
      "CSS",
      "JavaScript",
      "Angular",
      "Spring Boot",
      "React",
      ".NET",
    ],
    "Data & Scientific Computing": ["NumPy", "Pandas", "Matplotlib", "MATLAB"],
    Tools: ["Git", "Linux", "SQLite", "n8n"],
    "Design Software": ["Blender", "Photoshop", "SketchUp"],
    Languages: ["English", "French", "Arabic", "Spanish"],
  },
  certifications: ["Prologin Semifinalist"],
  leadership: [
    {
      title: "President",
      organization: "Digi Youth Club",
      summary:
        "Led student collaboration and technical initiatives through organized project activity.",
    },
  ],
  headerTags: [
    "Machine Learning",
    "Backend Systems",
    "Operating Systems",
    "Web Development",
    "Scientific Computing",
    "System Design",
    "Logistics Platforms",
    "AI Applications",
  ],
};

export const skillCategoryOrder: SkillCategoryName[] = [
  "Programming",
  "Web & Backend",
  "Data & Scientific Computing",
  "Tools",
  "Design Software",
  "Languages",
];

export const resumeSections: { id: ResumeSectionId; label: string }[] = [
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "leadership", label: "Leadership" },
];
