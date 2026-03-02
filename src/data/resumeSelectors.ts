import {
  resumeData,
  skillCategoryOrder,
  type ResumeExperience,
  type ResumeProject,
  type SkillCategoryName,
} from "./resumeData";

export type SkillUsage = {
  technology: string;
  projects: ResumeProject[];
  experiences: ResumeExperience[];
};

export type GlobeRegion = {
  category: SkillCategoryName;
  technologies: SkillUsage[];
};

export function getSkillCategories() {
  return skillCategoryOrder.map((name) => ({
    name,
    items: resumeData.skills[name],
  }));
}

function findProjectsBySkill(skill: string) {
  return resumeData.projects.filter((project) => project.skillsUsed.includes(skill));
}

function findExperienceBySkill(skill: string) {
  return resumeData.experience.filter((experience) =>
    experience.skillsUsed.includes(skill)
  );
}

export function getGlobeRegions(): GlobeRegion[] {
  return skillCategoryOrder.map((category) => ({
    category,
    technologies: resumeData.skills[category].map((technology) => ({
      technology,
      projects: findProjectsBySkill(technology),
      experiences: findExperienceBySkill(technology),
    })),
  }));
}

export function getStrictChatFacts() {
  return {
    resumeOnlyTopics: [
      resumeData.education.institution,
      resumeData.experience[0]?.company,
      resumeData.projects[0]?.title,
      resumeData.projects[1]?.title,
      resumeData.projects[2]?.title,
      resumeData.leadership[0]?.organization,
      resumeData.certifications[0],
    ].filter(Boolean),
    mlAnswer: [
      "Completed Machine Learning coursework at McGill.",
      "Implemented linear regression from scratch reducing MSE from 5.35x10^5 to 4.53x10^5.",
      "Built AI Medical Assistant integrating real-time voice input and scheduling automation.",
    ],
  };
}
