import { Link } from 'react-router-dom';
import { ClockIcon, LayersIcon, MapPinIcon } from './icons.jsx';
import { initials, years } from '../utils/format.js';

const SKILL_PREVIEW_COUNT = 5;

/** One developer in the explorer grid. */
export function DeveloperCard({ developer }) {
  const { id, name, title, location, experienceYears, skills = [], projectCount = 0 } = developer;
  const preview = skills.slice(0, SKILL_PREVIEW_COUNT);
  const remaining = skills.length - preview.length;

  return (
    <article className="card card--interactive">
      <div className="card__body">
        <div className="identity">
          <span className="avatar" aria-hidden="true">
            {initials(name)}
          </span>
          <div style={{ minWidth: 0 }}>
            <h3 className="identity__name">{name}</h3>
            <p className="identity__role">{title}</p>
          </div>
        </div>

        <div className="meta-row">
          <span>
            <MapPinIcon size={14} />
            {location}
          </span>
          <span>
            <ClockIcon size={14} />
            {years(experienceYears)}
          </span>
          <span>
            <LayersIcon size={14} />
            {projectCount} {projectCount === 1 ? 'project' : 'projects'}
          </span>
        </div>

        <div className="tag-list">
          {preview.map((skill) => (
            <span className="tag" key={skill}>
              {skill}
            </span>
          ))}
          {remaining > 0 && <span className="tag tag--plain">+{remaining} more</span>}
        </div>
      </div>

      <div className="card__foot">
        <span className="muted" style={{ fontSize: '0.82rem' }}>
          {skills.length} {skills.length === 1 ? 'skill' : 'skills'} on file
        </span>
        <Link className="button button--ghost" to={`/developers/${id}`}>
          View profile
        </Link>
      </div>
    </article>
  );
}
