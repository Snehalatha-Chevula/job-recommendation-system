import neo4j from 'neo4j-driver';
import { config, missingRequiredEnv, safeDatabaseTarget } from './env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * CognoDB access layer.
 *
 * CognoDB speaks openCypher over the Bolt protocol, so it is driven by the
 * official `neo4j-driver` package - there is no CognoDB-specific SDK here.
 * The driver holds a connection pool and is created once for the process
 * lifetime; sessions are short-lived and always closed.
 */

let driver = null;

/** Lazily create the shared driver instance. */
export function getDriver() {
  if (missingRequiredEnv.length > 0) {
    throw ApiError.databaseUnavailable(
      'The database connection is not configured on the server.',
      'DATABASE_NOT_CONFIGURED'
    );
  }

  if (!driver) {
    driver = neo4j.driver(
      config.database.uri,
      neo4j.auth.basic(config.database.username, config.database.password),
      {
        // Integer counts in this app are small, so returning plain JS numbers
        // instead of neo4j Integer objects keeps the service layer simple.
        disableLosslessIntegers: true,
        maxConnectionPoolSize: 20,
        connectionTimeout: 15_000,
        connectionAcquisitionTimeout: 20_000,
        maxTransactionRetryTime: 10_000,
      }
    );
  }

  return driver;
}

/**
 * Wrap a JS number as a Bolt Integer.
 *
 * Needed because a plain JS number is sent over Bolt as a Float, and Cypher
 * clauses such as `LIMIT $limit` reject a Float. Any numeric parameter used in
 * an integer position must go through this helper.
 */
export function asInteger(value) {
  return neo4j.int(value);
}

/**
 * Translate driver/database faults into a safe ApiError.
 * Raw driver errors can embed the connection URI and internal details, so the
 * original message is never forwarded to the client.
 */
function toSafeDatabaseError(error) {
  if (error?.isApiError) return error;

  const code = error?.code ?? '';

  if (code === 'Neo.ClientError.Security.Unauthorized') {
    return ApiError.databaseUnavailable(
      'The database rejected the configured credentials.',
      'DATABASE_UNAUTHORIZED'
    );
  }

  if (
    code === 'ServiceUnavailable' ||
    code === 'SessionExpired' ||
    error?.name === 'Neo4jError' ||
    error?.name === 'ServiceUnavailableError'
  ) {
    return ApiError.databaseUnavailable(
      'The graph database is currently unreachable.',
      'DATABASE_UNAVAILABLE'
    );
  }

  return ApiError.databaseUnavailable(
    'The graph database could not complete the request.',
    'DATABASE_ERROR'
  );
}

/**
 * Run a read query and return its records.
 * @param {string} query  Cypher text, with `$name` placeholders only.
 * @param {object} params Values bound by the driver - never interpolated.
 */
export async function runReadQuery(query, params = {}) {
  const session = getDriver().session({
    database: config.database.name,
    defaultAccessMode: neo4j.session.READ,
  });

  try {
    const result = await session.run(query, params);
    return result.records;
  } catch (error) {
    // Log the real error server-side, return a sanitised one to the caller.
    console.error('[database] read query failed:', error?.code ?? error?.message);
    throw toSafeDatabaseError(error);
  } finally {
    await session.close();
  }
}

/** Run a write query (used by the seed script). Returns the result summary. */
export async function runWriteQuery(query, params = {}) {
  const session = getDriver().session({
    database: config.database.name,
    defaultAccessMode: neo4j.session.WRITE,
  });

  try {
    return await session.run(query, params);
  } catch (error) {
    console.error('[database] write query failed:', error?.code ?? error?.message);
    throw toSafeDatabaseError(error);
  } finally {
    await session.close();
  }
}

/**
 * Check whether CognoDB is reachable. Never throws - the health endpoint and
 * the seed script both rely on getting a plain result back.
 */
export async function checkConnectivity() {
  if (missingRequiredEnv.length > 0) {
    return {
      connected: false,
      target: safeDatabaseTarget(),
      reason: `Missing environment variables: ${missingRequiredEnv.join(', ')}`,
    };
  }

  try {
    const serverInfo = await getDriver().getServerInfo({
      database: config.database.name,
    });
    return {
      connected: true,
      target: safeDatabaseTarget(),
      protocolVersion: String(serverInfo?.protocolVersion ?? 'unknown'),
    };
  } catch (error) {
    return {
      connected: false,
      target: safeDatabaseTarget(),
      reason: toSafeDatabaseError(error).message,
    };
  }
}

/** Close the connection pool. Called on SIGINT/SIGTERM and by the scripts. */
export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
