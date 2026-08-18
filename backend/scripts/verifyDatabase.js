/**
 * End-to-end check against a live CognoDB instance.
 *
 *   npm run verify:db
 *
 * Runs the real service layer - the same code the API uses - and prints what
 * came back, so you can confirm the graph is seeded and the traversals work
 * before starting the app or recording a demo.
 */
import { checkConnectivity, closeDriver } from '../src/config/database.js';
import { missingRequiredEnv } from '../src/config/env.js';
import { getDeveloperProfile, listDevelopers } from '../src/services/developerService.js';
import { getGraphStats } from '../src/services/graphService.js';
import { getJobDetail } from '../src/services/jobService.js';
import { getRecommendationsForDeveloper } from '../src/services/recommendationService.js';

const checks = [];

function record(name, passed, detail = '') {
  checks.push({ name, passed });
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` - ${detail}` : ''}`);
}

async function verify() {
  console.log('Verifying CognoDB graph\n');

  if (missingRequiredEnv.length > 0) {
    console.error(`Missing environment variable(s): ${missingRequiredEnv.join(', ')}`);
    console.error('Copy .env.example to .env in the repository root and fill in your details.');
    process.exitCode = 1;
    return;
  }

  const connectivity = await checkConnectivity();
  record(
    'Connection',
    connectivity.connected,
    connectivity.connected
      ? `${connectivity.target} (Bolt ${connectivity.protocolVersion})`
      : connectivity.reason
  );

  if (!connectivity.connected) {
    process.exitCode = 1;
    return;
  }

  // --- Graph contents ------------------------------------------------------
  const stats = await getGraphStats();
  console.log(
    `\nGraph statistics\n` +
      `  developers ${stats.developers}   skills ${stats.skills}   projects ${stats.projects}\n` +
      `  jobs       ${stats.jobs}   companies ${stats.companies}   relationships ${stats.relationships}\n`
  );
  record('Graph is seeded', stats.seeded, stats.seeded ? '' : 'run `npm run seed` first');

  if (!stats.seeded) {
    process.exitCode = 1;
    return;
  }

  // --- Developer list and profile -----------------------------------------
  const developers = await listDevelopers();
  record('Developer list', developers.length > 0, `${developers.length} developers`);

  const sample = developers[0];
  const profile = await getDeveloperProfile(sample.id);
  record(
    'Developer profile (HAS_SKILL, WORKED_ON)',
    profile.skills.length > 0 && profile.projects.length > 0,
    `${profile.developer.name}: ${profile.skills.length} skills, ${profile.projects.length} projects`
  );

  const projectWithSkills = profile.projects.find((project) => project.skills.length > 0);
  record(
    'Project skills (Developer -> Project -> Skill, 2 hops)',
    Boolean(projectWithSkills),
    projectWithSkills
      ? `${projectWithSkills.name} uses ${projectWithSkills.skills.join(', ')}`
      : 'no project skills found'
  );

  // --- Direct skill recommendations ---------------------------------------
  const { recommendations, meta } = await getRecommendationsForDeveloper(sample.id, 5);
  record(
    'Recommendations (Developer -> Skill <- Job)',
    recommendations.length > 0,
    `${recommendations.length} jobs, ${meta.withProjectEvidence} backed by project experience`
  );

  console.log(`\nTop matches for ${profile.developer.name} (${profile.developer.title})`);
  console.log(`  Listed skills: ${profile.skills.map((skill) => skill.name).join(', ')}\n`);

  for (const item of recommendations) {
    console.log(`  ${item.matchPercentage}%  ${item.job.title} @ ${item.company.name}`);
    console.log(`         matched: ${item.matchedSkills.join(', ') || '(none)'}`);
    console.log(`         missing: ${item.missingSkills.join(', ') || '(none)'}`);
    for (const evidence of item.projectEvidence) {
      console.log(`         via project: ${evidence.skill} on ${evidence.projects.join(', ')}`);
    }
  }

  const percentagesDescend = recommendations.every(
    (item, index) => index === 0 || recommendations[index - 1].matchPercentage >= item.matchPercentage
  );
  record('\nRanking is descending by match percentage', percentagesDescend);

  const arithmeticHolds = recommendations.every((item) => {
    const expected =
      Math.round((item.matchedSkills.length / item.requiredSkills.length) * 1000) / 10;
    return (
      Math.abs(expected - item.matchPercentage) < 0.11 &&
      item.matchedSkills.length + item.missingSkills.length === item.requiredSkills.length
    );
  });
  record('Match percentage arithmetic is consistent', arithmeticHolds);

  // --- Multi-hop evidence on a single job ---------------------------------
  const multiHop = recommendations.find((item) => item.projectEvidence.length > 0);
  record(
    'Multi-hop evidence (Developer -> Project -> Skill <- Job)',
    Boolean(multiHop),
    multiHop ? `${multiHop.job.title} justified by project experience` : 'none found'
  );

  // --- Job detail, with and without developer context ---------------------
  const jobId = recommendations[0].job.id;
  const anonymousJob = await getJobDetail(jobId);
  record(
    'Job detail without developer context',
    anonymousJob.match === null && anonymousJob.requiredSkills.length > 0,
    `${anonymousJob.job.title} requires ${anonymousJob.requiredSkills.length} skills`
  );

  const contextualJob = await getJobDetail(jobId, sample.id);
  record(
    'Job detail with developer context',
    contextualJob.match !== null,
    contextualJob.match ? `${contextualJob.match.matchPercentage}% for ${sample.name}` : ''
  );

  // --- Error paths ---------------------------------------------------------
  let notFoundHandled = false;
  try {
    await getDeveloperProfile('dev-does-not-exist');
  } catch (error) {
    notFoundHandled = error?.statusCode === 404;
  }
  record('Unknown developer id returns 404', notFoundHandled);

  const failed = checks.filter((check) => !check.passed).length;
  console.log(
    failed === 0
      ? `\nAll ${checks.length} checks passed.`
      : `\n${failed} of ${checks.length} checks failed.`
  );
  if (failed > 0) process.exitCode = 1;
}

verify()
  .catch((error) => {
    console.error(`\nVerification failed: ${error?.message ?? 'unknown error'}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDriver();
  });
