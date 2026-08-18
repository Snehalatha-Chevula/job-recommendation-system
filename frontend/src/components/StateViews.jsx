import { Link } from 'react-router-dom';
import { AlertIcon, DatabaseIcon, InboxIcon, SearchIcon } from './icons.jsx';

/**
 * The three states every data-backed screen needs, in one place so they look and
 * behave identically everywhere: loading, empty and error.
 */

/* --- Loading ------------------------------------------------------------- */

export function LoadingMessage({ label = 'Loading…' }) {
  return (
    <p className="loading-inline" role="status">
      <span className="spinner" />
      {label}
    </p>
  );
}

/** Card-shaped placeholders that match the real card layout. */
function SkeletonCards({ count = 6, withPills = true }) {
  return (
    <div className="grid grid--cards" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--short" />
          <div className="skeleton" />
          {withPills && (
            <div className="skeleton-pills">
              <span className="skeleton skeleton--pill" />
              <span className="skeleton skeleton--pill" />
              <span className="skeleton skeleton--pill" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Announces loading to assistive tech while skeletons render visually. */
export function LoadingCards({ label, count }) {
  return (
    <>
      <p className="visually-hidden" role="status">
        {label ?? 'Loading…'}
      </p>
      <SkeletonCards count={count} />
    </>
  );
}

/* --- Empty --------------------------------------------------------------- */

export function EmptyState({ title, message, icon = 'inbox', action = null }) {
  const Glyph = icon === 'search' ? SearchIcon : InboxIcon;

  return (
    <div className="state">
      <span className="state__icon">
        <Glyph size={22} />
      </span>
      <h3 className="state__title">{title}</h3>
      {message && <p className="state__message">{message}</p>}
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}

/* --- Error --------------------------------------------------------------- */

/**
 * Renders the right message for the failure that actually happened.
 *
 * A database outage, a network failure and a missing record are three different
 * problems for the person using the app, so they get three different messages -
 * and none of them ever shows a stack trace or a database detail.
 */
export function ErrorState({ error, onRetry, notFoundLabel = 'That page could not be found.' }) {
  const isDatabase = Boolean(error?.isDatabaseIssue);
  const isNetwork = Boolean(error?.isNetworkIssue);
  const isNotFound = Boolean(error?.isNotFound);

  if (isNotFound) {
    return (
      <div className="state">
        <span className="state__icon">
          <SearchIcon size={22} />
        </span>
        <h3 className="state__title">Not found</h3>
        <p className="state__message">{notFoundLabel}</p>
        <div className="state__actions">
          <Link className="button button--secondary" to="/developers">
            Back to developers
          </Link>
        </div>
      </div>
    );
  }

  if (isDatabase) {
    return (
      <div className="state state--database">
        <span className="state__icon">
          <DatabaseIcon size={22} />
        </span>
        <h3 className="state__title">The graph database is unavailable</h3>
        <p className="state__message">
          The application could not reach its database, so recommendations cannot be calculated
          right now. Nothing is wrong with your request — please try again in a moment.
        </p>
        <div className="state__actions">
          {onRetry && (
            <button type="button" className="button" onClick={onRetry}>
              Try again
            </button>
          )}
          <Link className="button button--secondary" to="/">
            Go to home
          </Link>
        </div>
        <p className="state__hint">
          Running this locally? Check COGNODB_URI, COGNODB_USERNAME and COGNODB_PASSWORD in your
          .env file, then confirm the instance is running.
        </p>
      </div>
    );
  }

  return (
    <div className="state state--error">
      <span className="state__icon">
        <AlertIcon size={22} />
      </span>
      <h3 className="state__title">Something went wrong</h3>
      <p className="state__message">
        {isNetwork
          ? 'We could not reach the server. Check your connection and try again.'
          : (error?.message ?? 'We could not load this content. Please try again.')}
      </p>
      {onRetry && (
        <div className="state__actions">
          <button type="button" className="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
