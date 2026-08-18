import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DIRECT_PATH_SHORT, GraphPath, PROJECT_PATH } from '../components/GraphPath.jsx';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { RecommendationCard } from '../components/RecommendationCard.jsx';
import { EmptyState, ErrorState, LoadingCards, LoadingMessage } from '../components/StateViews.jsx';
import { ArrowRightIcon, ClockIcon, GitBranchIcon, MapPinIcon } from '../components/icons.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { getDeveloper, getRecommendations } from '../services/api.js';
import { groupByCategory, initials, years } from '../utils/format.js';

/** Skills grouped by category, as badges. */
function SkillSection({ skills }) {
  if (skills.length === 0) {
    return (
      <p className="muted">This developer has no skills recorded on their profile.</p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {groupByCategory(skills).map(([category, items]) => (
        <div className="skill-group" key={category}>
          <span className="skill-group__label">{category}</span>
          <div className="tag-list">
            {items.map((skill) => (
              <span className="tag tag--brand" key={skill.id}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The recommendation results, loaded on demand. */
function Recommendations({ developerId, developerName }) {
  const { data, error, isLoading, retry } = useApiResource(
    () => getRecommendations(developerId, 12),
    [developerId]
  );

  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  if (isLoading || !data) {
    return (
      <>
        <LoadingMessage label="Traversing the graph for matching jobs…" />
        <div style={{ marginTop: '16px' }}>
          <LoadingCards label="Loading recommendations…" count={4} />
        </div>
      </>
    );
  }

  const recommendations = data.recommendations ?? [];

  if (recommendations.length === 0) {
    return (
      <EmptyState
        title="No matching jobs found"
        message={`None of the open jobs require any of ${developerName}'s current skills. Try exploring another developer.`}
        action={
          <Link className="button button--secondary" to="/developers">
            Back to developers
          </Link>
        }
      />
    );
  }

  const withEvidence = data?.meta?.withProjectEvidence ?? 0;

  return (
    <>
      <p className="result-count" style={{ marginBottom: '16px' }}>
        {recommendations.length} {recommendations.length === 1 ? 'job' : 'jobs'} found through the
        graph
        {withEvidence > 0 && ` · ${withEvidence} also backed by project experience`}
      </p>
      <div className="grid grid--recs">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            recommendation={recommendation}
            developerId={developerId}
            key={recommendation.job.id}
          />
        ))}
      </div>
    </>
  );
}

export function DeveloperProfilePage() {
  const { id } = useParams();
  const { data, error, isLoading, retry } = useApiResource(() => getDeveloper(id), [id]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const recommendationsRef = useRef(null);

  // A different developer means starting from the profile again.
  useEffect(() => {
    setShowRecommendations(false);
  }, [id]);

  useEffect(() => {
    if (showRecommendations) {
      recommendationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showRecommendations]);

  // Error first, then "not ready yet" - so the render below can rely on `data`
  // being present.
  if (error) {
    return (
      <section className="section">
        <div className="container">
          <ErrorState
            error={error}
            onRetry={retry}
            notFoundLabel="We could not find a developer with that id."
          />
        </div>
      </section>
    );
  }

  if (isLoading || !data?.developer) {
    return (
      <section className="section">
        <div className="container">
          <LoadingCards label="Loading developer profile…" count={3} />
        </div>
      </section>
    );
  }

  const { developer, skills = [], projects = [] } = data;

  return (
    <section className="section">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/developers">Developers</Link>
          <span aria-hidden="true">/</span>
          <span>{developer.name}</span>
        </nav>

        <div className="profile-head">
          <div className="profile-head__main">
            <div className="identity">
              <span className="avatar avatar--lg" aria-hidden="true">
                {initials(developer.name)}
              </span>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: '1.7rem' }}>{developer.name}</h1>
                <p className="identity__role" style={{ fontSize: '1rem' }}>
                  {developer.title}
                </p>
              </div>
            </div>

            <div className="meta-row">
              <span>
                <MapPinIcon size={15} />
                {developer.location}
              </span>
              <span>
                <ClockIcon size={15} />
                {years(developer.experienceYears)} of experience
              </span>
              <span>
                <GitBranchIcon size={15} />
                {skills.length} skills · {projects.length}{' '}
                {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {developer.bio && <p className="profile-head__bio">{developer.bio}</p>}
          </div>

          <button
            type="button"
            className="button button--large"
            onClick={() => setShowRecommendations(true)}
          >
            Find matching jobs
            <ArrowRightIcon size={17} />
          </button>
        </div>

        <div className="detail-columns" style={{ marginTop: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="section-head" style={{ marginBottom: 0, marginTop: '8px' }}>
              <div className="section-head__title">
                <p className="eyebrow">Projects</p>
                <h2>What they have built</h2>
              </div>
            </div>

            {projects.length > 0 ? (
              projects.map((project) => <ProjectCard project={project} key={project.id} />)
            ) : (
              <EmptyState
                title="No projects recorded"
                message="This developer has no projects connected to their profile, so project-based matching will not contribute for them."
              />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="section-head" style={{ marginBottom: 0, marginTop: '8px' }}>
              <div className="section-head__title">
                <p className="eyebrow">Skills</p>
                <h2>What they list</h2>
              </div>
            </div>

            <div className="panel">
              <SkillSection skills={skills} />
            </div>

            <div className="panel">
              <p className="eyebrow" style={{ marginBottom: '12px' }}>
                How matching works for this profile
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <GraphPath steps={DIRECT_PATH_SHORT} />
                <GraphPath steps={PROJECT_PATH} />
              </div>
              <p className="graph-path__caption" style={{ marginTop: '12px' }}>
                Both paths start at {developer.name.split(' ')[0]} and end at a job. The second one
                explains matches earned through project work.
              </p>
            </div>
          </div>
        </div>

        <div ref={recommendationsRef} style={{ scrollMarginTop: '84px' }}>
          <div className="section-head" style={{ marginTop: '40px' }}>
            <div className="section-head__title">
              <p className="eyebrow">Recommendations</p>
              <h2>Recommended jobs for {developer.name}</h2>
            </div>
          </div>

          {showRecommendations ? (
            <Recommendations developerId={developer.id} developerName={developer.name} />
          ) : (
            <EmptyState
              title="Ready when you are"
              message={`Select "Find matching jobs" to traverse the graph from ${developer.name}'s skills and projects to the jobs that require them.`}
              action={
                <button
                  type="button"
                  className="button"
                  onClick={() => setShowRecommendations(true)}
                >
                  Find matching jobs
                </button>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}
