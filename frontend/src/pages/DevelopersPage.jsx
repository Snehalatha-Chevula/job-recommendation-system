import { useMemo, useState } from 'react';
import { DeveloperCard } from '../components/DeveloperCard.jsx';
import { EmptyState, ErrorState, LoadingCards } from '../components/StateViews.jsx';
import { SearchIcon } from '../components/icons.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { getDevelopers } from '../services/api.js';

/**
 * Developer explorer.
 *
 * Filtering runs on the client because the whole list is small (50 developers,
 * one request) and instant local filtering is a better experience than a request
 * per keystroke. A larger dataset would move this into the Cypher query.
 */
export function DevelopersPage() {
  const { data, error, isLoading, retry } = useApiResource(() => getDevelopers(), []);
  const [query, setQuery] = useState('');

  const developers = data?.developers ?? [];
  // Treat "no data and no error yet" as still loading, so an empty state is
  // never shown before the first response arrives.
  const isPending = isLoading || (!data && !error);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return developers;

    return developers.filter((developer) =>
      [developer.name, developer.title, developer.location, ...(developer.skills ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [developers, query]);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="section-head__title">
            <p className="eyebrow">Developer explorer</p>
            <h1 style={{ fontSize: '1.85rem' }}>Choose a developer</h1>
            <p className="lede">
              Open a profile to see their skills and projects, then find the jobs the graph connects
              them to.
            </p>
          </div>

          {!isPending && !error && developers.length > 0 && (
            <label className="search">
              <span className="visually-hidden">Search developers</span>
              <SearchIcon size={16} />
              <input
                type="search"
                value={query}
                placeholder="Search name, role, location or skill"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          )}
        </div>

        {isPending && <LoadingCards label="Loading developers…" count={6} />}

        {!isPending && error && <ErrorState error={error} onRetry={retry} />}

        {!isPending && !error && developers.length === 0 && (
          <EmptyState
            title="No developers in the graph yet"
            message="The database is reachable but contains no developers. Run the seed script to load the sample dataset."
          />
        )}

        {!isPending && !error && developers.length > 0 && (
          <>
            {filtered.length > 0 ? (
              <>
                <p className="result-count" style={{ marginBottom: '14px' }}>
                  Showing {filtered.length} of {developers.length} developers
                </p>
                <div className="grid grid--cards">
                  {filtered.map((developer) => (
                    <DeveloperCard developer={developer} key={developer.id} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon="search"
                title="No developers match your search"
                message={`Nothing matched "${query.trim()}". Try a different name, role, location or skill.`}
                action={
                  <button type="button" className="button button--secondary" onClick={() => setQuery('')}>
                    Clear search
                  </button>
                }
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
