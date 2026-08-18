/**
 * Application error carrying an HTTP status code and a message that is safe to
 * send to a browser. Anything not wrapped in an ApiError is treated as an
 * unexpected fault by the error middleware and reported as a generic 500, so
 * internal details and stack traces never reach the client.
 */
export class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.isApiError = true;
  }

  static badRequest(message, code = 'BAD_REQUEST') {
    return new ApiError(400, message, code);
  }

  static notFound(message, code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  /** Used when CognoDB cannot be reached or rejects our credentials. */
  static databaseUnavailable(message, code = 'DATABASE_UNAVAILABLE') {
    return new ApiError(503, message, code);
  }
}
