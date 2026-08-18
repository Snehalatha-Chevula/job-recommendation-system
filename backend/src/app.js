import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

/**
 * Express application.
 *
 * In production the same process serves both the API and the built React
 * bundle, so the deployed app has a single public URL and needs no CORS
 * configuration at all. In development the Vite dev server runs separately and
 * proxies `/api`, and CORS_ORIGIN covers the case where a reviewer runs the
 * frontend on a different origin.
 */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          // The UI sets bar widths inline (style={{ width: '82%' }}), which is
          // an inline style attribute and therefore needs this directive.
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      // Allows the bundle's assets to load when served from the same origin.
      crossOriginEmbedderPolicy: false,
    })
  );

  // Allow-list only. With no CORS_ORIGIN configured, cross-origin browser
  // requests are refused, which is the correct default for a single-origin
  // deployment.
  app.use(
    cors({
      origin: config.corsOrigins.length > 0 ? config.corsOrigins : false,
      methods: ['GET'],
    })
  );

  app.use(express.json({ limit: '16kb' }));

  app.use('/api', apiRoutes);
  app.use('/api', notFoundHandler);

  // --- Static frontend -----------------------------------------------------
  const hasBuiltFrontend = fs.existsSync(path.join(config.frontendDist, 'index.html'));

  if (hasBuiltFrontend) {
    app.use(express.static(config.frontendDist, { index: false }));

    // Client-side routing: any non-API path returns index.html so deep links
    // such as /developers/dev-001 work on a hard refresh.
    app.get('*', (_req, res) => {
      res.sendFile(path.join(config.frontendDist, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => {
      res.type('text/plain').send(
        'API is running. The React build was not found - run `npm run build` to serve the UI from this process, ' +
          'or use the Vite dev server on port 5173 during development.'
      );
    });
  }

  app.use(errorHandler);

  return app;
}
