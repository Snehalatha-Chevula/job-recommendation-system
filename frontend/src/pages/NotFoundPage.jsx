import { Link } from 'react-router-dom';
import { EmptyState } from '../components/StateViews.jsx';

/** Catch-all for unknown client-side routes. */
export function NotFoundPage() {
  return (
    <section className="section">
      <div className="container">
        <EmptyState
          icon="search"
          title="Page not found"
          message="That address does not match any page in this application."
          action={
            <Link className="button" to="/">
              Go to home
            </Link>
          }
        />
      </div>
    </section>
  );
}
