import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Centralised error handling.
 *
 * Every failure leaves the API in the same JSON shape:
 *
 *   { "success": false, "message": "...", "code": "..." }
 *
 * Only messages attached to an ApiError are forwarded. Anything else - a
 * programming mistake, a driver internal, an unexpected throw - is logged
 * server-side and reported as a generic 500, so stack traces, Cypher text and
 * connection strings never reach the client.
 */

/** 404 for unmatched /api routes. */
export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`No API route matches ${req.method} ${req.originalUrl}.`, 'ROUTE_NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity.
export function errorHandler(error, req, res, next) {
  const isKnown = error instanceof ApiError || error?.isApiError === true;
  const statusCode = isKnown ? error.statusCode : 500;

  const body = {
    success: false,
    message: isKnown ? error.message : 'An unexpected error occurred on the server.',
    code: isKnown ? error.code : 'INTERNAL_ERROR',
  };

  if (!isKnown) {
    // Unexpected fault: full detail to the server log, nothing to the client.
    console.error(`[error] ${req.method} ${req.originalUrl}`, error);
  } else if (statusCode >= 500) {
    // Known infrastructure problem - one concise line is enough.
    console.error(`[error] ${req.method} ${req.originalUrl} -> ${statusCode} ${body.code}`);
  } else if (!config.isProduction) {
    console.warn(`[warn] ${req.method} ${req.originalUrl} -> ${statusCode} ${body.code}`);
  }

  res.status(statusCode).json(body);
}
