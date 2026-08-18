/**
 * Cypher used exclusively by `scripts/seedDatabase.js`.
 *
 * Kept beside the read queries so that every Cypher statement in the project
 * lives under `src/queries/` and is covered by `npm run check:cypher`.
 *
 * All statements are idempotent: nodes and relationships are created with
 * MERGE keyed on the business `id`, so running the seed twice updates existing
 * data instead of duplicating it. Every batch is passed in as a single `$rows`
 * parameter and expanded server-side with UNWIND - no string building.
 */

/* -------------------------------------------------------------------------- */
/* Uniqueness constraints                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Applied on a best-effort basis. Constraint DDL is not part of core
 * openCypher, so the seed script tolerates rejection here and continues - the
 * MERGE statements are correct either way, constraints only make them faster
 * and add a safety net.
 */
export const CONSTRAINTS = [
  'CREATE CONSTRAINT developer_id IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE',
  'CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE',
  'CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE',
  'CREATE CONSTRAINT job_id IF NOT EXISTS FOR (j:Job) REQUIRE j.id IS UNIQUE',
  'CREATE CONSTRAINT company_id IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE',
];

/* -------------------------------------------------------------------------- */
/* Nodes                                                                      */
/* -------------------------------------------------------------------------- */

export const MERGE_SKILLS = `
UNWIND $rows AS row
MERGE (s:Skill {id: row.id})
SET s.name = row.name,
    s.category = row.category
`;

export const MERGE_COMPANIES = `
UNWIND $rows AS row
MERGE (c:Company {id: row.id})
SET c.name = row.name,
    c.industry = row.industry,
    c.location = row.location,
    c.description = row.description
`;

export const MERGE_PROJECTS = `
UNWIND $rows AS row
MERGE (p:Project {id: row.id})
SET p.name = row.name,
    p.description = row.description,
    p.type = row.type
`;

export const MERGE_DEVELOPERS = `
UNWIND $rows AS row
MERGE (d:Developer {id: row.id})
SET d.name = row.name,
    d.title = row.title,
    d.experienceYears = row.experienceYears,
    d.location = row.location,
    d.bio = row.bio
`;

export const MERGE_JOBS = `
UNWIND $rows AS row
MERGE (j:Job {id: row.id})
SET j.title = row.title,
    j.description = row.description,
    j.location = row.location,
    j.experienceRequired = row.experienceRequired,
    j.employmentType = row.employmentType
`;

/* -------------------------------------------------------------------------- */
/* Relationships                                                              */
/* -------------------------------------------------------------------------- */

/** Developer -[:HAS_SKILL {level}]-> Skill */
export const MERGE_DEVELOPER_SKILLS = `
UNWIND $rows AS row
MATCH (d:Developer {id: row.developerId})
MATCH (s:Skill {id: row.skillId})
MERGE (d)-[rel:HAS_SKILL]->(s)
SET rel.level = row.level
`;

/** Developer -[:WORKED_ON {role}]-> Project */
export const MERGE_DEVELOPER_PROJECTS = `
UNWIND $rows AS row
MATCH (d:Developer {id: row.developerId})
MATCH (p:Project {id: row.projectId})
MERGE (d)-[rel:WORKED_ON]->(p)
SET rel.role = row.role
`;

/** Project -[:USES]-> Skill */
export const MERGE_PROJECT_SKILLS = `
UNWIND $rows AS row
MATCH (p:Project {id: row.projectId})
MATCH (s:Skill {id: row.skillId})
MERGE (p)-[:USES]->(s)
`;

/** Job -[:REQUIRES {importance}]-> Skill */
export const MERGE_JOB_SKILLS = `
UNWIND $rows AS row
MATCH (j:Job {id: row.jobId})
MATCH (s:Skill {id: row.skillId})
MERGE (j)-[rel:REQUIRES]->(s)
SET rel.importance = row.importance
`;

/** Job -[:POSTED_BY]-> Company */
export const MERGE_JOB_COMPANY = `
UNWIND $rows AS row
MATCH (j:Job {id: row.jobId})
MATCH (c:Company {id: row.companyId})
MERGE (j)-[:POSTED_BY]->(c)
`;

/* -------------------------------------------------------------------------- */
/* Maintenance / verification                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Removes only the five labels this application owns, so the seed can be reset
 * without touching unrelated data that may exist in the same instance.
 * Used by `npm run seed -- --reset`.
 */
export const DELETE_SEEDED_DATA = `
MATCH (n)
WHERE n:Developer OR n:Skill OR n:Project OR n:Job OR n:Company
DETACH DELETE n
`;

/** Node counts per label, used by the seed summary and `npm run verify:db`. */
export const COUNT_NODES = `
MATCH (d:Developer)
WITH count(d) AS developers
MATCH (s:Skill)
WITH developers, count(s) AS skills
MATCH (p:Project)
WITH developers, skills, count(p) AS projects
MATCH (j:Job)
WITH developers, skills, projects, count(j) AS jobs
MATCH (c:Company)
RETURN developers, skills, projects, jobs, count(c) AS companies
`;

/** Relationship counts per type. */
export const COUNT_RELATIONSHIPS = `
MATCH ()-[r]->()
RETURN type(r) AS relationshipType, count(r) AS total
  ORDER BY relationshipType ASC
`;

export const ALL_SEED_QUERIES = {
  MERGE_SKILLS,
  MERGE_COMPANIES,
  MERGE_PROJECTS,
  MERGE_DEVELOPERS,
  MERGE_JOBS,
  MERGE_DEVELOPER_SKILLS,
  MERGE_DEVELOPER_PROJECTS,
  MERGE_PROJECT_SKILLS,
  MERGE_JOB_SKILLS,
  MERGE_JOB_COMPANY,
  DELETE_SEEDED_DATA,
  COUNT_NODES,
  COUNT_RELATIONSHIPS,
};
