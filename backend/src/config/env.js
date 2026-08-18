import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

/** Repository root - the directory containing `backend/` and `frontend/`. */
const repoRoot = path.resolve(currentDir, '../../..');

// Load `.env` from the repository root. On hosting platforms (Render, Railway)
// no file exists and the real values come from the platform's env vars, which
// is why a missing file is not an error.
dotenv.config({ path: path.join(repoRoot, '.env'), quiet: true });

const REQUIRED_KEYS = ['COGNODB_URI', 'COGNODB_USERNAME', 'COGNODB_PASSWORD'];

/**
 * Names of required variables that are missing or blank.
 * The server still starts when these are absent so that `/api/health` can
 * report a useful diagnostic instead of the process crashing on boot.
 */
export const missingRequiredEnv = REQUIRED_KEYS.filter(
  (key) => !process.env[key] || process.env[key].trim() === ''
);

const parsePort = (value) => {
  const port = Number.parseInt(value ?? '', 10);
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : 5000;
};

const parseOrigins = (value) =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parsePort(process.env.PORT),
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  database: {
    uri: process.env.COGNODB_URI ?? '',
    username: process.env.COGNODB_USERNAME ?? '',
    password: process.env.COGNODB_PASSWORD ?? '',
    // Blank means "use the instance default database".
    name: (process.env.COGNODB_DATABASE ?? '').trim() || undefined,
  },
  /** Absolute path to the built React bundle, served in production. */
  frontendDist: path.resolve(repoRoot, 'frontend/dist'),
};

/**
 * Connection target without credentials, safe to log or return from the API.
 * Example: `bolt+s://abc123.databases.cognodb.cloud:7687`
 */
export const safeDatabaseTarget = () => {
  if (!config.database.uri) return 'not configured';
  try {
    const url = new URL(config.database.uri);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'invalid COGNODB_URI';
  }
};
