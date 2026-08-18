/**
 * Every Cypher statement used by the application lives here.
 *
 * Two rules hold for all queries in this file:
 *
 *  1. All dynamic values arrive as query parameters (`$developerId`, `$limit`).
 *     No user input is ever concatenated or interpolated into Cypher text.
 *     Template literals are used only for readable multi-line formatting and
 *     contain no `${...}` substitutions.
 *
 *  2. Only portable openCypher constructs are used - no vendor procedures
 *     (APOC), no map projections, no CALL subqueries. Nodes are returned whole
 *     and mapped to plain objects in `utils/graphMapper.js`. This keeps the
 *     application working across any openCypher/Bolt engine.
 */

/**
 * Q1 - Developer explorer list.
 * One row per developer, with their skill names and project count so the
 * explorer cards can be rendered from a single round trip.
 */
export const GET_DEVELOPERS = `
MATCH (d:Developer)
OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
OPTIONAL MATCH (d)-[:WORKED_ON]->(p:Project)
WITH d,
     collect(DISTINCT s.name) AS skills,
     count(DISTINCT p) AS projectCount
WITH d, skills, projectCount
  ORDER BY d.name ASC
RETURN d AS developer, skills, projectCount
`;

/**
 * Q2 - Developer profile.
 * The developer plus their directly connected skills and projects.
 * OPTIONAL MATCH is used so a developer with no skills or no projects is still
 * returned (with empty collections) rather than disappearing from the result.
 */
export const GET_DEVELOPER_PROFILE = `
MATCH (d:Developer {id: $developerId})
OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
OPTIONAL MATCH (d)-[:WORKED_ON]->(p:Project)
RETURN d AS developer,
       collect(DISTINCT s) AS skills,
       collect(DISTINCT p) AS projects
`;

/**
 * Q3 - Skills used by each of a developer's projects (2 hops).
 *
 *   Developer -[:WORKED_ON]-> Project -[:USES]-> Skill
 *
 * Powers the "technologies used" list on each project card, and is what lets
 * the UI say "you picked up Redis on the Payments Ledger Service".
 */
export const GET_PROJECT_SKILLS_FOR_DEVELOPER = `
MATCH (d:Developer {id: $developerId})-[:WORKED_ON]->(p:Project)-[:USES]->(s:Skill)
WITH p, collect(DISTINCT s.name) AS skills
RETURN p.id AS projectId, skills
`;

/**
 * Q4 - MAIN RECOMMENDATION QUERY. Direct skill match.
 *
 *   Developer -[:HAS_SKILL]-> Skill <-[:REQUIRES]- Job -[:POSTED_BY]-> Company
 *
 * How it works, step by step:
 *   1. Collect the developer's skill names into a single list.
 *   2. For every job, collect the skill names it requires.
 *   3. Split the required list into matched / missing using list comprehensions
 *      against the developer's list.
 *   4. Derive a transparent match percentage: matched / required * 100.
 *   5. Drop jobs with zero overlap - a 0% row is noise, not a recommendation.
 *   6. Rank by percentage, then by absolute number of matched skills so that a
 *      4-of-5 match outranks a 1-of-1 match at equal percentage.
 *
 * The aggregation in step 1 runs over an unrestricted row set, so it yields
 * exactly one row (an empty list if the developer has no skills at all).
 */
export const GET_JOB_RECOMMENDATIONS = `
MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(ds:Skill)
WITH collect(DISTINCT ds.name) AS developerSkills

MATCH (j:Job)-[:REQUIRES]->(rs:Skill)
WITH developerSkills, j, collect(DISTINCT rs.name) AS requiredSkills

WITH j,
     requiredSkills,
     [name IN requiredSkills WHERE name IN developerSkills]     AS matchedSkills,
     [name IN requiredSkills WHERE NOT name IN developerSkills] AS missingSkills

MATCH (j)-[:POSTED_BY]->(c:Company)
WITH j, c, requiredSkills, matchedSkills, missingSkills,
     CASE
       WHEN size(requiredSkills) = 0 THEN 0.0
       ELSE toFloat(size(matchedSkills)) / toFloat(size(requiredSkills)) * 100.0
     END AS matchPercentage
WHERE size(matchedSkills) > 0

RETURN j AS job,
       c AS company,
       requiredSkills,
       matchedSkills,
       missingSkills,
       matchPercentage
  ORDER BY matchPercentage DESC, size(matchedSkills) DESC, j.title ASC
  LIMIT $limit
`;

/**
 * Q5 - REQUIRED MULTI-HOP QUERY. Project-derived relevance.
 *
 *   Developer -[:WORKED_ON]-> Project -[:USES]-> Skill <-[:REQUIRES]- Job
 *             -[:POSTED_BY]-> Company
 *
 * Four relationship hops in a single pattern. This finds jobs a developer is
 * relevant to because of what they actually built, not only because of what is
 * listed on their profile - and it returns which project supplied each skill,
 * which is the evidence the UI shows the user.
 *
 * Rows are returned flat (one per job + skill) and grouped by job in the
 * service layer. That avoids nested map literals and keeps the statement
 * portable.
 */
export const GET_PROJECT_BASED_RECOMMENDATIONS = `
MATCH (d:Developer {id: $developerId})-[:WORKED_ON]->(p:Project)-[:USES]->(s:Skill)
MATCH (s)<-[:REQUIRES]-(j:Job)-[:POSTED_BY]->(c:Company)
WITH j, c, s.name AS skillName, collect(DISTINCT p.name) AS projectNames
RETURN j AS job, c AS company, skillName, projectNames
  ORDER BY j.title ASC, skillName ASC
`;

/**
 * Q6 - Job detail page.
 * The job, the company that posted it, and every skill it requires.
 */
export const GET_JOB_DETAIL = `
MATCH (j:Job {id: $jobId})
OPTIONAL MATCH (j)-[:POSTED_BY]->(c:Company)
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
WITH j, c, collect(DISTINCT s) AS requiredSkills
RETURN j AS job, c AS company, requiredSkills
`;

/**
 * Q7 - "Why this job matches" for one developer and one job.
 * The same matched/missing split as Q4, narrowed to a single job.
 */
export const GET_JOB_MATCH_FOR_DEVELOPER = `
MATCH (d:Developer {id: $developerId})
OPTIONAL MATCH (d)-[:HAS_SKILL]->(ds:Skill)
WITH d, collect(DISTINCT ds.name) AS developerSkills

MATCH (j:Job {id: $jobId})-[:REQUIRES]->(rs:Skill)
WITH d, developerSkills, collect(DISTINCT rs.name) AS requiredSkills

RETURN d.name AS developerName,
       requiredSkills,
       [name IN requiredSkills WHERE name IN developerSkills]     AS matchedSkills,
       [name IN requiredSkills WHERE NOT name IN developerSkills] AS missingSkills
`;

/**
 * Q8 - Project evidence for a single job (multi-hop, scoped to one job).
 *
 *   Developer -[:WORKED_ON]-> Project -[:USES]-> Skill <-[:REQUIRES]- Job
 *
 * Produces the "relevant project experience" block on the job detail page.
 */
export const GET_PROJECT_EVIDENCE_FOR_JOB = `
MATCH (d:Developer {id: $developerId})-[:WORKED_ON]->(p:Project)-[:USES]->(s:Skill)
MATCH (s)<-[:REQUIRES]-(j:Job {id: $jobId})
WITH s.name AS skillName, collect(DISTINCT p.name) AS projectNames
RETURN skillName, projectNames
  ORDER BY skillName ASC
`;

/** Q9 - Company detail, with the jobs it has posted. */
export const GET_COMPANY_DETAIL = `
MATCH (c:Company {id: $companyId})
OPTIONAL MATCH (j:Job)-[:POSTED_BY]->(c)
WITH c, collect(DISTINCT j) AS jobs
RETURN c AS company, jobs
`;

/**
 * Q10 - Live graph statistics for the home page.
 * Each label is counted in turn and carried forward, then all relationships
 * are counted. Confirms on screen that the UI is reading the real graph.
 */
export const GET_GRAPH_STATS = `
MATCH (d:Developer)
WITH count(d) AS developers
MATCH (s:Skill)
WITH developers, count(s) AS skills
MATCH (p:Project)
WITH developers, skills, count(p) AS projects
MATCH (j:Job)
WITH developers, skills, projects, count(j) AS jobs
MATCH (c:Company)
WITH developers, skills, projects, jobs, count(c) AS companies
MATCH ()-[r]->()
RETURN developers, skills, projects, jobs, companies, count(r) AS relationships
`;

/**
 * Named export map, used by `scripts/validateCypher.js` to parse every
 * statement in this file against the official Cypher grammar.
 */
export const ALL_QUERIES = {
  GET_DEVELOPERS,
  GET_DEVELOPER_PROFILE,
  GET_PROJECT_SKILLS_FOR_DEVELOPER,
  GET_JOB_RECOMMENDATIONS,
  GET_PROJECT_BASED_RECOMMENDATIONS,
  GET_JOB_DETAIL,
  GET_JOB_MATCH_FOR_DEVELOPER,
  GET_PROJECT_EVIDENCE_FOR_JOB,
  GET_COMPANY_DETAIL,
  GET_GRAPH_STATS,
};
