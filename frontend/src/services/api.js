/**
 * Single place where the frontend talks to the API.
 *
 * Requests go to a relative `/api` path by default: the Vite dev server proxies
 * it in development, and in production Express serves this bundle from the same
 * origin. `VITE_API_BASE_URL` only needs setting for a split deployment.
 *
 * Nothing secret is ever referenced here - anything in a Vite env var is
 * compiled into the public bundle, so credentials never come near this file.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '');

/** Error type carrying enough context for the UI to choose the right state. */
export class ApiRequestError extends Error {
  constructor(message, { status = null, code = 'ERROR' } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }

  /** True when the backend could not reach or use CognoDB. */
  get isDatabaseIssue() {
    return typeof this.code === 'string' && this.code.startsWith('DATABASE');
  }

  /** True when the browser could not reach the API at all. */
  get isNetworkIssue() {
    return this.code === 'NETWORK_ERROR';
  }

  get isNotFound() {
    return this.status === 404;
  }
}

async function request(path) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new ApiRequestError(
      'We could not reach the server. Check that the API is running and try again.',
      { code: 'NETWORK_ERROR' }
    );
  }

  // A body is expected on both success and failure, but never assumed.
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new ApiRequestError(body?.message ?? `Request failed with status ${response.status}.`, {
      status: response.status,
      code: body?.code ?? 'REQUEST_FAILED',
    });
  }

  // Endpoints return { success, data }; health returns a flat object.
  return body?.data ?? body;
}

/* --- endpoints ----------------------------------------------------------- */

export const getGraphStats = () => request('/stats');
export const getDevelopers = () => request('/developers');
export const getDeveloper = (developerId) => request(`/developers/${encodeURIComponent(developerId)}`);

export const getRecommendations = (developerId, limit = 12) =>
  request(`/developers/${encodeURIComponent(developerId)}/recommendations?limit=${limit}`);

export const getJob = (jobId, developerId) => {
  const suffix = developerId ? `?developerId=${encodeURIComponent(developerId)}` : '';
  return request(`/jobs/${encodeURIComponent(jobId)}${suffix}`);
};
