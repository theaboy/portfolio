import aiMedicalImage from "../assets/projects/ai-medical.jpg";
import bikeSharingImage from "../assets/projects/bike-sharing.png";
import microsysImage from "../assets/projects/microsys.png";

export type ResumeSectionId =
  | "education"
  | "experience"
  | "projects"
  | "certifications"
  | "leadership"
  | "contact";

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
  summary: string;
  problem: string;
  approach: string;
  image: string;
  githubUrl?: string;
  demoUrl?: string;
  skillsUsed: string[];
  impact: string;
  recognition?: string;
};

export type ResumeExperience = {
  company: string;
  role: string;
  focus?: string;
  period: string;
  summary: string;
  systems: string[];
  skillsUsed: string[];
};

export type ResumeAcademicExperience = {
  course: string;
  context: string;
  skillsUsed: string[];
};

export type ResumeIndependentExploration = {
  title: string;
  context: string;
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
    positioning: string;
    pillars: string[];
    foundation: string;
  }[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  academicExperience: ResumeAcademicExperience[];
  independentExploration: ResumeIndependentExploration[];
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
    linkedin: "https://www.linkedin.com/in/aymane-radouane",
    github: "https://github.com/theaboy",
    resumeFile: `${import.meta.env.BASE_URL}Aymane_Radouane_Resume.pdf`,
    ctaLabel: "Discuss ML-Backend Opportunities",
    ctaHref: "#contact",
    summary:
      "Computer Science and Mathematics student focused on machine learning, backend systems, and production-ready software delivery.",
  },
  education: [
    {
      institution: "McGill University",
      degree: "B.A. in Computer Science & Mathematics",
      period: "2024 - Present",
      positioning:
        "Building a rigorous foundation across systems, machine learning, and applied mathematics for production-grade software work.",
      pillars: [
        "Data Structures",
        "Machine Learning",
        "Operating Systems",
        "Linear Algebra",
        "Probability",
      ],
      foundation: "Focus: Mathematical rigor and systems thinking.",
    },
    {
      institution: "Lycee Descartes",
      degree:
        "French Baccalaureat - Specialization in Mathematics & Physics-Chemistry from 2021 to 2024",
      period: "2021 - 2024",
      positioning:
        "Developed advanced mathematics depth, scientific reasoning, and disciplined analytical problem-solving through intensive quantitative coursework.",
      pillars: ["Advanced Mathematics", "Physics-Chemistry", "Scientific Reasoning"],
      foundation: "Foundation: Strong quantitative analysis and structured problem decomposition.",
    },
  ],
  experience: [
    {
      company: "MyTower",
      role: "Software Engineering Intern",
      focus: "Backend and workflow integrations",
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
    {
      company: "Nakhil",
      role: "IT Intern",
      focus: "Web App Development",
      period: "2025",
      summary:
        "Built and improved internal web application workflows to streamline day-to-day team operations.",
      systems: [
        "Developed responsive interfaces and reusable UI components for internal tools",
        "Implemented backend-connected features to reduce manual process steps",
        "Collaborated on bug fixes and QA cycles to improve reliability before release",
      ],
      skillsUsed: ["React", "JavaScript", "HTML", "CSS", "SQL", "Git"],
    },
  ],
  projects: [
    {
      id: "ai-medical-assistant",
      title: "AI Medical Assistant",
      summary:
        "Voice-driven assistant for scheduling workflows, designed to reduce intake friction and automate follow-up operations.",
      problem: "Patient scheduling friction across intake and follow-up.",
      approach:
        "Built a voice-first workflow that routes intent into scheduling actions and dashboard updates.",
      image: aiMedicalImage,
      skillsUsed: ["Python", "SQLite", "n8n"],
      impact:
        "Delivered a working assistant integrating real-time voice input and scheduling automation.",
      recognition: "4th place at MAIS McGill Hackathon",
    },
    {
      id: "microsys-os-simulation",
      title: "microsys OS simulation",
      summary:
        "Operating systems simulation focused on process behavior, scheduling logic, and systems-level implementation discipline.",
      problem:
        "Need to model low-level system behavior in a controlled educational environment.",
      approach:
        "Implemented operating system simulation components to reason about core scheduling and process behavior.",
      image: microsysImage,
      skillsUsed: ["C", "Linux"],
      impact: "Strengthened systems-level reasoning and implementation discipline.",
    },
    {
      id: "bike-sharing-regression",
      title: "Bike Sharing regression project",
      summary:
        "Demand prediction model using regression and feature iteration to improve planning accuracy for bike-sharing operations.",
      problem:
        "Predicting rental demand accurately for better allocation planning.",
      approach:
        "Implemented linear regression from scratch and iterated with feature engineering and evaluation.",
      image: bikeSharingImage,
      skillsUsed: ["Python", "NumPy", "Pandas", "Matplotlib"],
      impact: "Reduced MSE from 5.35x10^5 to 4.53x10^5.",
    },
  ],
  academicExperience: [
    {
      course: "Machine Learning Coursework (McGill)",
      context:
        "Implemented modeling and evaluation workflows in Python using NumPy, Pandas, and Matplotlib.",
      skillsUsed: ["Python", "NumPy", "Pandas", "Matplotlib"],
    },
    {
      course: "Operating Systems Coursework (McGill)",
      context:
        "Built low-level process and scheduling simulations in C on Linux-based development environments.",
      skillsUsed: ["C", "Linux"],
    },
    {
      course: "Functional Programming Coursework (McGill)",
      context:
        "Applied OCaml to recursion-heavy problem solving and type-safe functional program design.",
      skillsUsed: ["OCaml"],
    },
    {
      course: "Numerical Methods and Linear Algebra Labs (McGill)",
      context:
        "Used MATLAB to analyze numerical stability and matrix-based computation tasks.",
      skillsUsed: ["MATLAB"],
    },
  ],
  independentExploration: [
    {
      title: ".NET API Exploration",
      context:
        "Built small REST endpoint prototypes in .NET to compare architecture patterns with Spring Boot.",
      skillsUsed: [".NET"],
    },
    {
      title: "3D and Visual Design Practice",
      context:
        "Used Blender and SketchUp to prototype technical scene layouts and spatial UI concepts.",
      skillsUsed: ["Blender", "SketchUp"],
    },
    {
      title: "Creative Asset Editing Experiments",
      context:
        "Used Photoshop for lightweight asset cleanup and interface mockup preparation.",
      skillsUsed: ["Photoshop"],
    },
    {
      title: "Multilingual Communication",
      context:
        "Used English, French, Arabic, and Spanish across collaborative study, project communication, and documentation.",
      skillsUsed: ["English", "French", "Arabic", "Spanish"],
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
  { id: "certifications", label: "Certifications" },
  { id: "leadership", label: "Leadership" },
  { id: "contact", label: "Contact" },
];
