import { runReadQuery } from '../config/database.js';
import {
  GET_DEVELOPERS,
  GET_DEVELOPER_PROFILE,
  GET_PROJECT_SKILLS_FOR_DEVELOPER,
} from '../queries/cypherQueries.js';
import { ApiError } from '../utils/ApiError.js';
import { byName, toNode, toNodes } from '../utils/graphMapper.js';

/**
 * Developer reads. Services own the graph queries and the shaping of results;
 * controllers only deal with HTTP.
 */

/** Every developer, with skill names and project count for the explorer cards. */
export async function listDevelopers() {
  const records = await runReadQuery(GET_DEVELOPERS);

  return records.map((record) => ({
    ...toNode(record.get('developer')),
    skills: (record.get('skills') ?? []).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    projectCount: record.get('projectCount') ?? 0,
  }));
}

/**
 * One developer with their skills and projects.
 *
 * Two queries are used: the profile itself, and the 2-hop
 * Developer -> Project -> Skill traversal that tells us which technologies each
 * project used. Merging them here keeps both statements simple and portable.
 */
export async function getDeveloperProfile(developerId) {
  const records = await runReadQuery(GET_DEVELOPER_PROFILE, { developerId });

  if (records.length === 0) {
    throw ApiError.notFound(`No developer found with id "${developerId}".`, 'DEVELOPER_NOT_FOUND');
  }

  const record = records[0];
  const projectSkillRecords = await runReadQuery(GET_PROJECT_SKILLS_FOR_DEVELOPER, {
    developerId,
  });

  const skillsByProjectId = new Map(
    projectSkillRecords.map((row) => [row.get('projectId'), row.get('skills') ?? []])
  );

  const projects = toNodes(record.get('projects'))
    .map((project) => ({
      ...project,
      skills: (skillsByProjectId.get(project.id) ?? []).slice().sort((a, b) => a.localeCompare(b)),
    }))
    .sort(byName);

  return {
    developer: toNode(record.get('developer')),
    skills: toNodes(record.get('skills')).sort(byName),
    projects,
  };
}

/**
 * Lightweight existence check used before running a recommendation, so an
 * unknown id returns 404 rather than an empty result set.
 */
export async function getDeveloperSummary(developerId) {
  const records = await runReadQuery(GET_DEVELOPER_PROFILE, { developerId });

  if (records.length === 0) {
    throw ApiError.notFound(`No developer found with id "${developerId}".`, 'DEVELOPER_NOT_FOUND');
  }

  const developer = toNode(records[0].get('developer'));
  return {
    developer,
    skills: toNodes(records[0].get('skills')).sort(byName),
  };
}
