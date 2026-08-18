import { asInteger, runReadQuery } from '../config/database.js';
import {
  GET_JOB_RECOMMENDATIONS,
  GET_PROJECT_BASED_RECOMMENDATIONS,
} from '../queries/cypherQueries.js';
import { roundPercentage, toNode } from '../utils/graphMapper.js';
import { getDeveloperSummary } from './developerService.js';

/**
 * Job recommendations, produced entirely by graph traversal.
 *
 * Two queries contribute:
 *
 *   1. GET_JOB_RECOMMENDATIONS          Developer -> Skill <- Job
 *      The ranked list and the transparent match percentage.
 *
 *   2. GET_PROJECT_BASED_RECOMMENDATIONS Developer -> Project -> Skill <- Job
 *      The multi-hop traversal. It supplies the evidence trail - which project
 *      gave the developer which relevant skill - so the UI can say
 *      "you used Redis on the Multi-tenant Billing API".
 *
 * There is no scoring model here. The percentage is
 * matched required skills / total required skills, and nothing else.
 */

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 40;

/** Clamp a caller-supplied limit into a sane range. */
function normaliseLimit(rawLimit) {
  const parsed = Number.parseInt(rawLimit ?? '', 10);
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

/**
 * Group the flat rows from the multi-hop query into one entry per job.
 * @returns {Map<string, {skill: string, projects: string[]}[]>} keyed by job id
 */
function groupProjectEvidenceByJob(records) {
  const evidenceByJobId = new Map();

  for (const record of records) {
    const job = toNode(record.get('job'));
    if (!job?.id) continue;

    const existing = evidenceByJobId.get(job.id) ?? [];
    existing.push({
      skill: record.get('skillName'),
      projects: record.get('projectNames') ?? [],
    });
    evidenceByJobId.set(job.id, existing);
  }

  return evidenceByJobId;
}

export async function getRecommendationsForDeveloper(developerId, rawLimit) {
  // Resolve the developer first so an unknown id is a clean 404 instead of an
  // empty recommendation list.
  const { developer } = await getDeveloperSummary(developerId);
  const limit = normaliseLimit(rawLimit);

  const [directRecords, projectRecords] = await Promise.all([
    runReadQuery(GET_JOB_RECOMMENDATIONS, { developerId, limit: asInteger(limit) }),
    runReadQuery(GET_PROJECT_BASED_RECOMMENDATIONS, { developerId }),
  ]);

  const evidenceByJobId = groupProjectEvidenceByJob(projectRecords);

  const recommendations = directRecords.map((record) => {
    const job = toNode(record.get('job'));
    const projectEvidence = evidenceByJobId.get(job.id) ?? [];

    return {
      job,
      company: toNode(record.get('company')),
      matchedSkills: record.get('matchedSkills') ?? [],
      missingSkills: record.get('missingSkills') ?? [],
      requiredSkills: record.get('requiredSkills') ?? [],
      matchPercentage: roundPercentage(record.get('matchPercentage')),
      // Evidence from the multi-hop traversal: skills this developer actually
      // used on a project, that this job also requires.
      projectEvidence,
    };
  });

  return {
    developer,
    recommendations,
    meta: {
      limit,
      returned: recommendations.length,
      /** How many of the returned jobs are backed by real project experience. */
      withProjectEvidence: recommendations.filter((item) => item.projectEvidence.length > 0)
        .length,
    },
  };
}
