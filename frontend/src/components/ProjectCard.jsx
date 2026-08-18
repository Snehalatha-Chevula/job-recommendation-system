/** One project on a developer profile, with the technologies it used. */
export function ProjectCard({ project }) {
  const { name, description, type, skills = [] } = project;

  return (
    <article className="card">
      <div className="card__body project-card">
        <div className="project-card__head">
          <h3 className="identity__name">{name}</h3>
          {type && <span className="tag project-card__type">{type}</span>}
        </div>

        <p>{description}</p>

        {skills.length > 0 && (
          <div className="skill-group">
            <span className="skill-group__label">Technologies used</span>
            <div className="tag-list">
              {skills.map((skill) => (
                <span className="tag tag--brand" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
