import { Link, useParams, useSearchParams } from 'react-router-dom';
import { GraphPath, PROJECT_PATH } from '../components/GraphPath.jsx';
import { MatchMeter } from '../components/MatchMeter.jsx';
import { ErrorState, LoadingCards } from '../components/StateViews.jsx';
import { CheckIcon, GitBranchIcon, InfoIcon } from '../components/icons.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { getJob } from '../services/api.js';
import { matchSentence, years } from '../utils/format.js';

/**
 * Job detail.
 *
 * `?developerId=` is optional. When present, the page also answers "why does
 * this job match me?" using the same two graph traversals as the recommendation
 * list, narrowed to this single job.
 */
export function JobDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const developerId = searchParams.get('developerId') ?? undefined;

  const { data, error, isLoading, retry } = useApiResource(
    () => getJob(id, developerId),
    [id, developerId]
  );

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <ErrorState
            error={error}
            onRetry={retry}
            notFoundLabel="We could not find a job with that id."
          />
        </div>
      </section>
    );
  }

  if (isLoading || !data?.job) {
    return (
      <section className="section">
        <div className="container">
          <LoadingCards label="Loading job details…" count={2} />
        </div>
      </section>
    );
  }

  const { job, company, requiredSkills = [], match, projectEvidence = [] } = data;
  const matchedSet = new Set(match?.matchedSkills ?? []);

  return (
    <section className="section">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {developerId ? (
            <>
              <Link to={`/developers/${developerId}`}>Back to profile</Link>
              <span aria-hidden="true">/</span>
            </>
          ) : (
            <>
              <Link to="/developers">Developers</Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span>{job.title}</span>
        </nav>

        <div className="job-hero">
          <div className="job-hero__main">
            <div>
              <p className="eyebrow">{company?.industry ?? 'Open role'}</p>
              <h1 style={{ fontSize: '1.75rem' }}>{job.title}</h1>
              <p className="rec-card__company" style={{ fontSize: '1rem' }}>
                {company?.name ?? 'Unknown company'}
              </p>
            </div>

            <dl className="definition-list">
              <div>
                <dt>Location</dt>
                <dd>{job.location}</dd>
              </div>
              <div>
                <dt>Employment type</dt>
                <dd>{job.employmentType}</dd>
              </div>
              <div>
                <dt>Experience required</dt>
                <dd>{years(job.experienceRequired)}</dd>
              </div>
            </dl>
          </div>

          {match && (
            <MatchMeter
              percentage={match.matchPercentage}
              caption={`For ${match.developerName}`}
            />
          )}
        </div>

        <div className="detail-columns" style={{ marginTop: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel">
              <p className="eyebrow" style={{ marginBottom: '10px' }}>
                About this role
              </p>
              <p style={{ color: 'var(--ink-700)' }}>{job.description}</p>
            </div>

            <div className="panel">
              <p className="eyebrow" style={{ marginBottom: '12px' }}>
                Required skills
              </p>
              {requiredSkills.length > 0 ? (
                <div className="tag-list">
                  {requiredSkills.map((skill) => (
                    <span
                      className={`tag ${matchedSet.has(skill.name) ? 'tag--matched' : match ? 'tag--missing' : ''}`}
                      key={skill.id}
                    >
                      {matchedSet.has(skill.name) && <CheckIcon size={12} />}
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted">This job has no required skills recorded.</p>
              )}
              {match && (
                <p className="graph-path__caption" style={{ marginTop: '12px' }}>
                  Green skills are ones {match.developerName} already has; amber skills are the gap.
                </p>
              )}
            </div>

            {company && (
              <div className="panel">
                <p className="eyebrow" style={{ marginBottom: '10px' }}>
                  About {company.name}
                </p>
                <p style={{ color: 'var(--ink-700)' }}>{company.description}</p>
                <div className="meta-row" style={{ marginTop: '12px' }}>
                  <span>{company.industry}</span>
                  <span>{company.location}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {match ? (
              <>
                <div className="panel">
                  <p className="eyebrow" style={{ marginBottom: '12px' }}>
                    Why this job matches
                  </p>

                  <p className="rec-summary" style={{ marginBottom: '14px' }}>
                    <CheckIcon size={16} />
                    {matchSentence(match.matchedSkills.length, match.requiredSkills.length)}
                  </p>

                  <div className="compare" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="compare__column">
                      <span className="compare__label compare__label--matched">
                        <CheckIcon size={13} />
                        Matched through your skills
                      </span>
                      <div className="tag-list">
                        {match.matchedSkills.length > 0 ? (
                          match.matchedSkills.map((skill) => (
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
                        Skills to pick up
                      </span>
                      <div className="tag-list">
                        {match.missingSkills.length > 0 ? (
                          match.missingSkills.map((skill) => (
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
                </div>

                <div className="panel">
                  <p className="eyebrow" style={{ marginBottom: '12px' }}>
                    Relevant project experience
                  </p>

                  {projectEvidence.length > 0 ? (
                    <>
                      <div className="evidence" style={{ marginBottom: '14px' }}>
                        <span className="evidence__icon">
                          <GitBranchIcon size={16} />
                        </span>
                        <div className="evidence__body">
                          <span className="evidence__title">Found through your projects</span>
                          <div className="evidence__list">
                            {projectEvidence.map((item) => (
                              <span key={item.skill}>
                                You used <strong>{item.skill}</strong> on {item.projects.join(', ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <GraphPath
                        steps={PROJECT_PATH}
                        caption="This evidence comes from following three relationships out from the developer."
                      />
                    </>
                  ) : (
                    <p className="notice">
                      <InfoIcon size={16} />
                      None of this developer&apos;s projects used the skills this job requires, so the
                      match above rests on their listed skills alone.
                    </p>
                  )}
                </div>

                <Link className="button button--secondary button--block" to={`/developers/${developerId}`}>
                  Back to {match.developerName}&apos;s profile
                </Link>
              </>
            ) : (
              <div className="panel">
                <p className="notice notice--info">
                  <InfoIcon size={16} />
                  Open this job from a developer&apos;s recommendations to see which of their skills
                  match it and which project experience makes them relevant.
                </p>
                <Link className="button button--secondary button--block" to="/developers" style={{ marginTop: '14px' }}>
                  Choose a developer
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
