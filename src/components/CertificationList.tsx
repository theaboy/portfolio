type CertificationListProps = {
  items: string[];
};

function CertificationList({ items }: CertificationListProps) {
  return (
    <article className="credential-card" data-reveal>
      <h3>Certifications & Achievements</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export default CertificationList;
