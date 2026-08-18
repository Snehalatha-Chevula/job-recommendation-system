import { ApiError } from '../utils/ApiError.js';

/**
 * Identifier format check.
 *
 * Cypher injection is already impossible here - every value reaches the
 * database as a bound parameter, never as query text. This validation exists
 * for a different reason: it turns an obviously malformed id into an immediate,
 * cheap 400 with a clear message instead of a database round trip that returns
 * an empty result.
 */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function assertValidId(value, label) {
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) {
    throw ApiError.badRequest(
      `"${label}" must be 1-64 characters using letters, numbers, hyphens or underscores.`,
      'INVALID_ID'
    );
  }
  return value;
}

/** Express middleware factory validating a named route parameter. */
export const validateRouteId = (paramName) => (req, _res, next) => {
  try {
    assertValidId(req.params[paramName], paramName);
    next();
  } catch (error) {
    next(error);
  }
};
