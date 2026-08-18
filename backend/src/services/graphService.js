import { runReadQuery } from '../config/database.js';
import { GET_GRAPH_STATS } from '../queries/cypherQueries.js';

const EMPTY_STATS = {
  developers: 0,
  skills: 0,
  projects: 0,
  jobs: 0,
  companies: 0,
  relationships: 0,
};

/**
 * Live counts straight out of the graph, shown on the home page.
 *
 * This exists so the landing page states real numbers rather than hardcoded
 * ones - if the database has not been seeded, the home page says zero instead
 * of claiming data that is not there.
 */
export async function getGraphStats() {
  const records = await runReadQuery(GET_GRAPH_STATS);

  // The chained MATCH clauses yield no rows when any label is empty, which is
  // exactly the un-seeded case.
  if (records.length === 0) return { ...EMPTY_STATS, seeded: false };

  const record = records[0];
  const stats = Object.fromEntries(
    Object.keys(EMPTY_STATS).map((key) => [key, record.get(key) ?? 0])
  );

  return { ...stats, seeded: stats.developers > 0 };
}
