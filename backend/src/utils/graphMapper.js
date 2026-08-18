/**
 * Converts driver result values into plain JSON-serialisable objects.
 *
 * The queries in `src/queries/` deliberately return whole nodes rather than map
 * projections (map projections are a vendor extension, and returning nodes
 * keeps the Cypher portable). Unwrapping them is therefore done here, in one
 * place, instead of inside every service.
 *
 * The driver is configured with `disableLosslessIntegers: true`, so integer
 * properties such as `experienceYears` arrive as ordinary JS numbers.
 */

/** Unwrap a single node into its properties, or null when absent. */
export function toNode(node) {
  if (!node || typeof node !== 'object' || !node.properties) return null;
  return { ...node.properties };
}

/** Unwrap a collected list of nodes, dropping nulls from OPTIONAL MATCH. */
export function toNodes(nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes.map(toNode).filter(Boolean);
}

/** Alphabetical sort helper for stable, predictable UI ordering. */
export function byName(a, b) {
  return String(a?.name ?? '').localeCompare(String(b?.name ?? ''));
}

/**
 * Round to one decimal place. Match percentages are computed in Cypher; this
 * only trims float noise (e.g. 66.66666666666666 -> 66.7) for display.
 */
export function roundPercentage(value) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.round(numeric * 10) / 10 : 0;
}
