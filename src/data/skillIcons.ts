const skillIcons: Record<string, string> = {
  python: new URL("../assets/skills-icons/python.svg", import.meta.url).href,
  java: new URL("../assets/skills-icons/java.svg", import.meta.url).href,
  c: new URL("../assets/skills-icons/c.svg", import.meta.url).href,
  ocaml: new URL("../assets/skills-icons/ocaml.svg", import.meta.url).href,
  sql: new URL("../assets/skills-icons/sql.svg", import.meta.url).href,
  html: new URL("../assets/skills-icons/html.svg", import.meta.url).href,
  css: new URL("../assets/skills-icons/css.svg", import.meta.url).href,
  javascript: new URL("../assets/skills-icons/javascript.svg", import.meta.url).href,
  angular: new URL("../assets/skills-icons/angular.svg", import.meta.url).href,
  "spring boot": new URL("../assets/skills-icons/spring-boot.svg", import.meta.url).href,
  react: new URL("../assets/skills-icons/react.svg", import.meta.url).href,
  ".net": new URL("../assets/skills-icons/dotnet.svg", import.meta.url).href,
  numpy: new URL("../assets/skills-icons/numpy.svg", import.meta.url).href,
  pandas: new URL("../assets/skills-icons/pandas.svg", import.meta.url).href,
  matplotlib: new URL("../assets/skills-icons/matplotlib.svg", import.meta.url).href,
  matlab: new URL("../assets/skills-icons/matlab.svg", import.meta.url).href,
  git: new URL("../assets/skills-icons/git.svg", import.meta.url).href,
  linux: new URL("../assets/skills-icons/linux.svg", import.meta.url).href,
  sqlite: new URL("../assets/skills-icons/sqlite.svg", import.meta.url).href,
  n8n: new URL("../assets/skills-icons/n8n.svg", import.meta.url).href,
  blender: new URL("../assets/skills-icons/blender.svg", import.meta.url).href,
  photoshop: new URL("../assets/skills-icons/photoshop.svg", import.meta.url).href,
  sketchup: new URL("../assets/skills-icons/sketchup.svg", import.meta.url).href,
};

function normalizeSkillKey(skillName: string) {
  return skillName.trim().toLowerCase();
}

export function getSkillIcon(skillName: string) {
  return skillIcons[normalizeSkillKey(skillName)] ?? null;
}
