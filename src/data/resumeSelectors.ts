import {
  resumeData,
  skillCategoryOrder,
  type ResumeAcademicExperience,
  type ResumeExperience,
  type ResumeIndependentExploration,
  type ResumeProject,
  type SkillCategoryName,
} from "./resumeData";

export type SkillUsage = {
  technology: string;
  projects: ResumeProject[];
  experiences: ResumeExperience[];
  academic: ResumeAcademicExperience[];
  independent: ResumeIndependentExploration[];
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

function findAcademicBySkill(skill: string) {
  return resumeData.academicExperience.filter((item) => item.skillsUsed.includes(skill));
}

function findIndependentBySkill(skill: string) {
  return resumeData.independentExploration.filter((item) =>
    item.skillsUsed.includes(skill)
  );
}

export function getGlobeRegions(): GlobeRegion[] {
  return skillCategoryOrder
    .map((category) => ({
      category,
      technologies: resumeData.skills[category]
        .map((technology) => {
          const projects = findProjectsBySkill(technology);
          const experiences = findExperienceBySkill(technology);
          const academic = findAcademicBySkill(technology);
          const independent = findIndependentBySkill(technology);

          return {
            technology,
            projects,
            experiences,
            academic,
            independent,
          };
        })
        .filter(
          (usage) =>
            usage.projects.length > 0 ||
            usage.experiences.length > 0 ||
            usage.academic.length > 0 ||
            usage.independent.length > 0
        ),
    }))
    .filter((region) => region.technologies.length > 0);
}

export function getStrictChatFacts() {
  return {
    resumeOnlyTopics: [
      ...resumeData.education.map((item) => item.institution),
      ...resumeData.experience.map((item) => `${item.company} (${item.role})`),
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
