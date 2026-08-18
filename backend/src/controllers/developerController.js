import { getDeveloperProfile, listDevelopers } from '../services/developerService.js';
import { getRecommendationsForDeveloper } from '../services/recommendationService.js';

/**
 * HTTP layer for developers. Controllers translate between requests and
 * services and do no graph work of their own.
 */

/** GET /api/developers */
export async function getDevelopers(_req, res) {
  const developers = await listDevelopers();
  res.json({ success: true, data: { developers, total: developers.length } });
}

/** GET /api/developers/:id */
export async function getDeveloper(req, res) {
  const profile = await getDeveloperProfile(req.params.id);
  res.json({ success: true, data: profile });
}

/** GET /api/developers/:id/recommendations?limit=12 */
export async function getRecommendations(req, res) {
  const result = await getRecommendationsForDeveloper(req.params.id, req.query.limit);
  res.json({ success: true, data: result });
}
