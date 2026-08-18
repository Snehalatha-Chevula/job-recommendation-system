import { Link, NavLink, Outlet } from 'react-router-dom';

/** Persistent shell: header, routed page content, footer. */
export function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link className="brand" to="/">
            <span className="brand__mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7 6 17 12 7 18 7 6Z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
                <circle cx="7" cy="6" r="2" fill="#fff" />
                <circle cx="7" cy="18" r="2" fill="#c7d2fe" />
                <circle cx="17" cy="12" r="2" fill="#6ee7b7" />
              </svg>
            </span>
            <span className="brand__text">
              Skill &amp; Job Graph
              <small>Developer recommendations</small>
            </span>
          </Link>

          <nav className="site-nav" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              Home
            </NavLink>
            <NavLink
              to="/developers"
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              Developers
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span>
            Recommendations are produced by graph traversal over developers, skills, projects, jobs
            and companies.
          </span>
          <span>
            <code>CognoDB</code> · <code>openCypher over Bolt</code>
          </span>
        </div>
      </footer>
    </div>
  );
}
