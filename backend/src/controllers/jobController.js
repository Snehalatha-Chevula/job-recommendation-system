import { getCompanyDetail, getJobDetail } from '../services/jobService.js';
import { assertValidId } from '../middleware/validateId.js';

/** HTTP layer for jobs and companies. */

/**
 * GET /api/jobs/:id?developerId=dev-001
 *
 * `developerId` is optional. When supplied, the response includes the
 * matched/missing skill breakdown and the project experience that makes this
 * job relevant to that developer.
 */
export async function getJob(req, res) {
  const { developerId } = req.query;

  if (developerId !== undefined) {
    assertValidId(developerId, 'developerId');
  }

  const detail = await getJobDetail(req.params.id, developerId);
  res.json({ success: true, data: detail });
}

/** GET /api/companies/:id */
export async function getCompany(req, res) {
  const detail = await getCompanyDetail(req.params.id);
  res.json({ success: true, data: detail });
}
