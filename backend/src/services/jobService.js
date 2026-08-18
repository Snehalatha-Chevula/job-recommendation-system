import { runReadQuery } from '../config/database.js';
import {
  GET_COMPANY_DETAIL,
  GET_JOB_DETAIL,
  GET_JOB_MATCH_FOR_DEVELOPER,
  GET_PROJECT_EVIDENCE_FOR_JOB,
} from '../queries/cypherQueries.js';
import { ApiError } from '../utils/ApiError.js';
import { byName, roundPercentage, toNode, toNodes } from '../utils/graphMapper.js';

/**
 * Job and company reads.
 *
 * `getJobDetail` optionally takes a developer id. When present it answers the
 * "why does this job match me?" question using the same two traversals as the
 * recommendation list, narrowed to a single job.
 */

/** Match percentage for one job, computed from the graph result. */
function toMatch(record) {
  const requiredSkills = record.get('requiredSkills') ?? [];
  const matchedSkills = record.get('matchedSkills') ?? [];

  return {
    developerName: record.get('developerName'),
    requiredSkills,
    matchedSkills,
    missingSkills: record.get('missingSkills') ?? [],
    matchPercentage:
      requiredSkills.length === 0
        ? 0
        : roundPercentage((matchedSkills.length / requiredSkills.length) * 100),
  };
}

export async function getJobDetail(jobId, developerId) {
  const records = await runReadQuery(GET_JOB_DETAIL, { jobId });

  if (records.length === 0) {
    throw ApiError.notFound(`No job found with id "${jobId}".`, 'JOB_NOT_FOUND');
  }

  const record = records[0];
  const detail = {
    job: toNode(record.get('job')),
    company: toNode(record.get('company')),
    requiredSkills: toNodes(record.get('requiredSkills')).sort(byName),
    match: null,
    projectEvidence: [],
  };

  // Without a developer in context there is nothing to compare against, so the
  // "why this matches" section is simply omitted.
  if (!developerId) return detail;

  const [matchRecords, evidenceRecords] = await Promise.all([
    runReadQuery(GET_JOB_MATCH_FOR_DEVELOPER, { developerId, jobId }),
    runReadQuery(GET_PROJECT_EVIDENCE_FOR_JOB, { developerId, jobId }),
  ]);

  if (matchRecords.length > 0) {
    detail.match = toMatch(matchRecords[0]);
  }

  detail.projectEvidence = evidenceRecords.map((row) => ({
    skill: row.get('skillName'),
    projects: row.get('projectNames') ?? [],
  }));

  return detail;
}

export async function getCompanyDetail(companyId) {
  const records = await runReadQuery(GET_COMPANY_DETAIL, { companyId });

  if (records.length === 0) {
    throw ApiError.notFound(`No company found with id "${companyId}".`, 'COMPANY_NOT_FOUND');
  }

  const record = records[0];
  return {
    company: toNode(record.get('company')),
    jobs: toNodes(record.get('jobs')).sort((a, b) =>
      String(a.title).localeCompare(String(b.title))
    ),
  };
}
