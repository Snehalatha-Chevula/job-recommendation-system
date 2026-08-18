import { checkConnectivity } from '../config/database.js';
import { config } from '../config/env.js';
import { getGraphStats } from '../services/graphService.js';

/** Health and graph-statistics endpoints. */

/**
 * GET /api/health
 *
 * Reports whether the API process is up and whether CognoDB is reachable.
 * Returns 503 when the database is unavailable so uptime checks and the
 * frontend can both react to it, while still returning a useful body.
 *
 * The response includes the host being connected to, but never the credentials.
 */
export async function getHealth(_req, res) {
  const connectivity = await checkConnectivity();

  res.status(connectivity.connected ? 200 : 503).json({
    status: connectivity.connected ? 'ok' : 'degraded',
    database: connectivity.connected ? 'connected' : 'disconnected',
    target: connectivity.target,
    ...(connectivity.connected
      ? { protocolVersion: connectivity.protocolVersion }
      : { reason: connectivity.reason }),
    environment: config.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
  });
}

/** GET /api/stats - live node and relationship counts for the home page. */
export async function getStats(_req, res) {
  const stats = await getGraphStats();
  res.json({ success: true, data: stats });
}
