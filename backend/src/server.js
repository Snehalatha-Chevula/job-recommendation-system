import { createApp } from './app.js';
import { checkConnectivity, closeDriver } from './config/database.js';
import { config, missingRequiredEnv, safeDatabaseTarget } from './config/env.js';

/**
 * Process entry point.
 *
 * The server starts even when CognoDB is unreachable or unconfigured. That is
 * deliberate: a database outage should surface as a clear 503 from the API and a
 * friendly message in the UI, not as a crash loop on the hosting platform.
 */

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`\nDeveloper Skill & Job Recommendation Graph - API`);
  console.log(`  listening on   http://localhost:${config.port}`);
  console.log(`  environment    ${config.nodeEnv}`);
  console.log(`  database       ${safeDatabaseTarget()}`);

  if (missingRequiredEnv.length > 0) {
    console.warn(
      `\n  ! Missing environment variable(s): ${missingRequiredEnv.join(', ')}\n` +
        '    The API will respond, but every database-backed route will return 503.\n' +
        '    Copy .env.example to .env in the repository root and fill in your CognoDB details.\n'
    );
    return;
  }

  // Report connectivity once at boot as a convenience; failures are logged but
  // never fatal.
  checkConnectivity().then((connectivity) => {
    console.log(
      connectivity.connected
        ? `  ✓ CognoDB reachable (Bolt ${connectivity.protocolVersion})\n`
        : `  ! CognoDB unreachable: ${connectivity.reason}\n`
    );
  });
});

/** Close HTTP connections and the Bolt connection pool before exiting. */
async function shutdown(signal) {
  console.log(`\n${signal} received, shutting down`);

  server.close(async () => {
    await closeDriver();
    console.log('Closed HTTP server and database connections.');
    process.exit(0);
  });

  // Do not hang forever if a connection refuses to drain.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
