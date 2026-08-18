import { Link } from 'react-router-dom';
import { MatchMeter } from './MatchMeter.jsx';
import { BriefcaseIcon, CheckIcon, ClockIcon, GitBranchIcon, MapPinIcon } from './icons.jsx';
import { matchSentence, years } from '../utils/format.js';

/**
 * One recommended job.
 *
 * Everything shown here comes from graph traversal:
 *   - matched / missing skills and the percentage come from
 *     Developer -[:HAS_SKILL]-> Skill <-[:REQUIRES]- Job
 *   - the project evidence block comes from the multi-hop
 *     Developer -[:WORKED_ON]-> Project -[:USES]-> Skill <-[:REQUIRES]- Job
 */
export function RecommendationCard({ recommendation, developerId }) {
  const { job, company, matchedSkills, missingSkills, requiredSkills, matchPercentage, projectEvidence } =
    recommendation;

  return (
    <article className="card card--interactive">
      <div className="card__body">
        <div className="rec-card__head">
          <div className="rec-card__title">
            <h3 className="rec-card__job">{job.title}</h3>
            <span className="rec-card__company">{company?.name ?? 'Unknown company'}</span>
            <div className="meta-row" style={{ marginTop: '6px' }}>
              <span>
                <MapPinIcon size={14} />
                {job.location}
              </span>
              <span>
                <BriefcaseIcon size={14} />
                {job.employmentType}
              </span>
              <span>
                <ClockIcon size={14} />
                {years(job.experienceRequired)} required
              </span>
            </div>
          </div>

          <MatchMeter percentage={matchPercentage} />
        </div>

        <p className="rec-summary">
          <CheckIcon size={16} />
          {matchSentence(matchedSkills.length, requiredSkills.length)}
        </p>

        <div className="compare">
          <div className="compare__column">
            <span className="compare__label compare__label--matched">
              <CheckIcon size={13} />
              Matched skills ({matchedSkills.length})
            </span>
            <div className="tag-list">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((skill) => (
                  <span className="tag tag--matched" key={skill}>
                    {skill}
                  </span>
                ))
              ) : (
                <span className="tag tag--plain">None</span>
              )}
            </div>
          </div>

          <div className="compare__column">
            <span className="compare__label compare__label--missing">
              Missing skills ({missingSkills.length})
            </span>
            <div className="tag-list">
              {missingSkills.length > 0 ? (
                missingSkills.map((skill) => (
                  <span className="tag tag--missing" key={skill}>
                    {skill}
                  </span>
                ))
              ) : (
                <span className="tag tag--plain">Nothing missing</span>
              )}
            </div>
          </div>
        </div>

        {projectEvidence.length > 0 && (
          <div className="evidence">
            <span className="evidence__icon">
              <GitBranchIcon size={16} />
            </span>
            <div className="evidence__body">
              <span className="evidence__title">Backed by project experience</span>
              <div className="evidence__list">
                {projectEvidence.slice(0, 3).map((item) => (
                  <span key={item.skill}>
                    You used <strong>{item.skill}</strong> on {item.projects.join(', ')}
                  </span>
                ))}
                {projectEvidence.length > 3 && (
                  <span className="muted">
                    and {projectEvidence.length - 3} more relevant skill
                    {projectEvidence.length - 3 === 1 ? '' : 's'} from your projects
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card__foot">
        <span className="muted" style={{ fontSize: '0.82rem' }}>
          {requiredSkills.length} required {requiredSkills.length === 1 ? 'skill' : 'skills'}
        </span>
        <Link className="button button--ghost" to={`/jobs/${job.id}?developerId=${developerId}`}>
          View job
        </Link>
      </div>
    </article>
  );
}
