/**
 * Seeds CognoDB with the Developer Skill & Job Recommendation Graph dataset.
 *
 *   npm run seed              # create or update the graph (safe to re-run)
 *   npm run seed -- --reset   # delete the five seeded labels first
 *
 * Properties
 * ----------
 * - Idempotent. Every write is a MERGE keyed on the business `id`, so running
 *   this twice leaves the same 50 developers, not 100.
 * - Fully parameterised. Rows are handed to the driver as `$rows` and expanded
 *   server-side with UNWIND; no value is ever interpolated into Cypher.
 * - Chunked. Large collections are sent in batches so a single request never
 *   carries the whole dataset.
 * - Fails cleanly. Connection problems are reported in plain language and the
 *   driver is always closed.
 */
import {
  checkConnectivity,
  closeDriver,
  runReadQuery,
  runWriteQuery,
} from '../src/config/database.js';
import { missingRequiredEnv } from '../src/config/env.js';
import {
  COUNT_NODES,
  COUNT_RELATIONSHIPS,
  CONSTRAINTS,
  DELETE_SEEDED_DATA,
  MERGE_COMPANIES,
  MERGE_DEVELOPERS,
  MERGE_DEVELOPER_PROJECTS,
  MERGE_DEVELOPER_SKILLS,
  MERGE_JOBS,
  MERGE_JOB_COMPANY,
  MERGE_JOB_SKILLS,
  MERGE_PROJECTS,
  MERGE_PROJECT_SKILLS,
  MERGE_SKILLS,
} from '../src/queries/seedQueries.js';
import {
  companies,
  developerProjectRelationships,
  developerSkillRelationships,
  developers,
  jobCompanyRelationships,
  jobSkillRelationships,
  jobs,
  projectSkillRelationships,
  projects,
  seedSummary,
  skills,
} from './seedData.js';

const BATCH_SIZE = 250;
const shouldReset = process.argv.includes('--reset');

const log = (message) => console.log(message);

function chunk(rows, size = BATCH_SIZE) {
  const batches = [];
  for (let index = 0; index < rows.length; index += size) {
    batches.push(rows.slice(index, index + size));
  }
  return batches;
}

/** Run one MERGE statement over a collection, in batches. */
async function writeBatched(label, query, rows) {
  if (rows.length === 0) {
    log(`  - ${label}: nothing to write`);
    return;
  }

  const batches = chunk(rows);
  for (const batch of batches) {
    await runWriteQuery(query, { rows: batch });
  }

  const suffix = batches.length > 1 ? ` in ${batches.length} batches` : '';
  log(`  ✓ ${label}: ${rows.length}${suffix}`);
}

async function applyConstraints() {
  log('\nApplying uniqueness constraints (best effort)');
  let applied = 0;

  for (const statement of CONSTRAINTS) {
    try {
      await runWriteQuery(statement);
      applied += 1;
    } catch {
      // Constraint DDL is outside core openCypher. If the engine rejects it the
      // MERGE statements below are still correct, so this is not fatal.
    }
  }

  log(
    applied === CONSTRAINTS.length
      ? `  ✓ ${applied} constraints in place`
      : `  ! ${applied}/${CONSTRAINTS.length} applied - this engine may not support constraint DDL, continuing`
  );
}

/**
 * Print live node and relationship counts read back from the database.
 * Exported so `verify:db` reports exactly what the seed reports.
 */
export async function printCounts() {
  const nodeRecords = await runReadQuery(COUNT_NODES);
  const relationshipRecords = await runReadQuery(COUNT_RELATIONSHIPS);

  log('\nGraph contents (read back from the database)');

  if (nodeRecords.length === 0) {
    log('  Nodes: none of the five labels are present yet');
  } else {
    log('  Nodes');
    for (const label of ['developers', 'skills', 'projects', 'jobs', 'companies']) {
      log(`    ${label.padEnd(12)} ${nodeRecords[0].get(label)}`);
    }
  }

  if (relationshipRecords.length === 0) {
    log('  Relationships: none');
    return;
  }

  log('  Relationships');
  let total = 0;
  for (const record of relationshipRecords) {
    const count = record.get('total');
    total += count;
    log(`    ${String(record.get('relationshipType')).padEnd(12)} ${count}`);
  }
  log(`    ${'TOTAL'.padEnd(12)} ${total}`);
}

async function seed() {
  log('Developer Skill & Job Recommendation Graph - database seed\n');

  if (missingRequiredEnv.length > 0) {
    console.error(
      `Cannot seed: missing environment variable(s) ${missingRequiredEnv.join(', ')}.\n` +
        'Copy .env.example to .env in the repository root and fill in your CognoDB details.'
    );
    process.exitCode = 1;
    return;
  }

  log('Connecting to CognoDB...');
  const connectivity = await checkConnectivity();

  if (!connectivity.connected) {
    console.error(`Connection failed (${connectivity.target}): ${connectivity.reason}`);
    console.error(
      '\nChecks:\n' +
        '  - Is COGNODB_URI correct, and does it use bolt+s:// for a hosted instance?\n' +
        '  - Are COGNODB_USERNAME and COGNODB_PASSWORD correct?\n' +
        '  - Is the instance running (hosted instances can be paused when idle)?'
    );
    process.exitCode = 1;
    return;
  }

  log(`  ✓ Connected to ${connectivity.target} (Bolt ${connectivity.protocolVersion})`);

  if (shouldReset) {
    log('\n--reset given: removing existing Developer/Skill/Project/Job/Company nodes');
    await runWriteQuery(DELETE_SEEDED_DATA);
    log('  ✓ Existing seeded data removed');
  }

  await applyConstraints();

  log(
    `\nWriting nodes (target: ${seedSummary.developers} developers, ${seedSummary.skills} skills, ` +
      `${seedSummary.projects} projects, ${seedSummary.jobs} jobs, ${seedSummary.companies} companies)`
  );
  await writeBatched('Skill', MERGE_SKILLS, skills);
  await writeBatched('Company', MERGE_COMPANIES, companies);
  await writeBatched('Project', MERGE_PROJECTS, projects);
  await writeBatched('Developer', MERGE_DEVELOPERS, developers);
  await writeBatched('Job', MERGE_JOBS, jobs);

  log(`\nWriting relationships (target: ${seedSummary.relationships})`);
  await writeBatched('HAS_SKILL', MERGE_DEVELOPER_SKILLS, developerSkillRelationships);
  await writeBatched('WORKED_ON', MERGE_DEVELOPER_PROJECTS, developerProjectRelationships);
  await writeBatched('USES', MERGE_PROJECT_SKILLS, projectSkillRelationships);
  await writeBatched('REQUIRES', MERGE_JOB_SKILLS, jobSkillRelationships);
  await writeBatched('POSTED_BY', MERGE_JOB_COMPANY, jobCompanyRelationships);

  await printCounts();

  log('\nSeed complete. Start the app with `npm run dev` from the repository root.');
}

seed()
  .catch((error) => {
    // ApiError messages are already safe to print; anything else is unexpected.
    console.error(`\nSeed failed: ${error?.message ?? 'unknown error'}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDriver();
  });
