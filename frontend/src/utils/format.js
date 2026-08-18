/** Small display helpers shared across components. */

/** "Arjun Kumar" -> "AK" */
export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** 1 -> "1 year", 3 -> "3 years" */
export function years(count) {
  const value = Number(count ?? 0);
  return `${value} ${value === 1 ? 'year' : 'years'}`;
}

/** Group skill objects by their `category` property, preserving first-seen order. */
export function groupByCategory(skills = []) {
  const groups = new Map();
  for (const skill of skills) {
    const key = skill.category ?? 'Other';
    groups.set(key, [...(groups.get(key) ?? []), skill]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/**
 * Plain-language explanation of a match, so the UI never requires the reader to
 * understand percentages, Cypher or graphs.
 */
export function matchSentence(matchedCount, requiredCount) {
  if (requiredCount === 0) return 'This job lists no required skills.';
  if (matchedCount === requiredCount) {
    return `You have all ${requiredCount} skills this job asks for.`;
  }
  return `This job matches ${matchedCount} of its ${requiredCount} required skills.`;
}

/** Colour band for the match bar: strong, partial or weak. */
export function matchTone(percentage) {
  if (percentage >= 75) return '';
  if (percentage >= 40) return 'match__fill--partial';
  return 'match__fill--low';
}
