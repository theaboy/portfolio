type SkillCategory = {
  name: string;
  items: string[];
};

type SkillGridProps = {
  categories: SkillCategory[];
};

function SkillGrid({ categories }: SkillGridProps) {
  return (
    <div className="skills-grid">
      {categories.map((category) => (
        <article key={category.name} className="skill-card" data-reveal>
          <h3>{category.name}</h3>
          <ul>
            {category.items.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export default SkillGrid;
