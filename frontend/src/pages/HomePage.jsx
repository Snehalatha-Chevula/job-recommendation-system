import { Link } from 'react-router-dom';
import { DIRECT_PATH, GraphPath, PROJECT_PATH } from '../components/GraphPath.jsx';
import { ArrowRightIcon, DatabaseIcon } from '../components/icons.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { getGraphStats } from '../services/api.js';

const STAT_LABELS = [
  ['developers', 'Developers'],
  ['skills', 'Skills'],
  ['projects', 'Projects'],
  ['jobs', 'Jobs'],
  ['companies', 'Companies'],
  ['relationships', 'Relationships'],
];

/**
 * Live counts read from the graph.
 *
 * These are queried rather than hardcoded so the landing page is honest: if the
 * database has not been seeded, it does not claim data that is not there.
 */
function StatStrip() {
  const { data, error, isLoading } = useApiResource(() => getGraphStats(), []);

  if (error) {
    return (
      <p className="notice" style={{ marginTop: '28px' }}>
        <DatabaseIcon size={16} />
        Live graph statistics are unavailable right now. The rest of the app will tell you more when
        you explore it.
      </p>
    );
  }

  return (
    <div className="stat-strip">
      {STAT_LABELS.map(([key, label]) => (
        <div className="stat" key={key}>
          <div className="stat__value">
            {isLoading ? <span className="skeleton" style={{ width: '48px' }} /> : (data?.[key] ?? 0)}
          </div>
          <div className="stat__label">{label}</div>
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero__inner">
            <p className="eyebrow">Graph-powered matching</p>
            <h1 className="hero__title">Developer Skill &amp; Job Recommendation Graph</h1>
            <p className="hero__subtitle">
              Discover job opportunities through the skills and project experience that connect you
              to them.
            </p>
            <div className="hero__actions">
              <Link className="button button--large" to="/developers">
                Explore developers
                <ArrowRightIcon size={17} />
              </Link>
              <a className="button button--secondary button--large" href="#how-it-works">
                How it works
              </a>
            </div>
          </div>

          <StatStrip />
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <div className="section-head__title">
              <p className="eyebrow">How a recommendation is built</p>
              <h2>Two paths through the graph</h2>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            <div className="panel">
              <h3 style={{ marginBottom: '14px' }}>What you list</h3>
              <GraphPath
                steps={DIRECT_PATH}
                caption="A developer's skills are compared against the skills each job requires. The overlap becomes the match percentage; the remainder becomes the missing skills."
              />
            </div>

            <div className="panel">
              <h3 style={{ marginBottom: '14px' }}>What you have actually built</h3>
              <GraphPath
                steps={PROJECT_PATH}
                caption="Three relationship hops from a developer to a job, through the projects they worked on. This is what lets the app say which project gave you a skill a job is asking for."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="section-head">
            <div className="section-head__title">
              <p className="eyebrow">Why a graph database</p>
              <h2>The data here is mostly relationships</h2>
            </div>
          </div>

          <div className="how-grid">
            <div className="how-card">
              <span className="how-card__step">1</span>
              <h3>Pick a developer</h3>
              <p>
                Every developer is connected to the skills they list and the projects they shipped.
                Those connections are the data, not an afterthought.
              </p>
            </div>
            <div className="how-card">
              <span className="how-card__step">2</span>
              <h3>Follow the connections</h3>
              <p>
                Jobs connect to the skills they require and to the company that posted them. Walking
                from a developer to a job means walking those edges.
              </p>
            </div>
            <div className="how-card">
              <span className="how-card__step">3</span>
              <h3>See why it matched</h3>
              <p>
                Each recommendation shows which skills matched, which are missing, and which project
                supplied the relevant experience.
              </p>
            </div>
          </div>

          <p className="lede" style={{ marginTop: '22px' }}>
            The same result is achievable in a relational database, but a query like{' '}
            <em>developer → project → skill → job</em> turns into several joins across four tables,
            and each extra hop adds another. In a graph model the path is written the way it is
            drawn, which is why this problem sits naturally in CognoDB.
          </p>
        </div>
      </section>
    </>
  );
}
