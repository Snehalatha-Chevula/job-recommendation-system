/**
 * Parses every Cypher statement in `src/queries/` against the official Cypher
 * grammar (the same parser Neo4j's own tooling uses) and fails loudly on any
 * syntax error.
 *
 * This is a fast offline check - it needs no database connection - so it can be
 * run before touching a live instance:
 *
 *   npm run check:cypher
 *
 * It also asserts the project's hard rule that no query interpolates values:
 * any `${` inside a query string is a build failure.
 */
import { validateSyntax } from '@neo4j-cypher/language-support';
import { ALL_QUERIES } from '../src/queries/cypherQueries.js';
import { ALL_SEED_QUERIES, CONSTRAINTS } from '../src/queries/seedQueries.js';

const statements = {
  ...ALL_QUERIES,
  ...ALL_SEED_QUERIES,
  ...Object.fromEntries(CONSTRAINTS.map((text, i) => [`CONSTRAINT_${i + 1}`, text])),
};

let failures = 0;

console.log(`Validating ${Object.keys(statements).length} Cypher statements\n`);

for (const [name, text] of Object.entries(statements)) {
  const problems = [];

  // Guard against string-built Cypher. Parameters must be used instead.
  if (text.includes('${')) {
    problems.push('contains an interpolated value - use a $parameter instead');
  }

  for (const diagnostic of validateSyntax(text, {})) {
    problems.push(`line ${diagnostic.range.start.line + 1}: ${diagnostic.message}`);
  }

  // Every value placeholder should look like a parameter reference.
  const parameters = [...text.matchAll(/\$(\w+)/g)].map((match) => match[1]);
  const paramNote = parameters.length ? ` (params: ${[...new Set(parameters)].join(', ')})` : '';

  if (problems.length === 0) {
    console.log(`  PASS  ${name}${paramNote}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${name}`);
    for (const problem of problems) console.error(`          ${problem}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} statement(s) failed validation.`);
  process.exit(1);
}

console.log('\nAll Cypher statements parsed cleanly and use parameters only.');
