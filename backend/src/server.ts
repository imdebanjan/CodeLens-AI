import { createApp } from './app.js';
import { connectDB } from './models/db.js';
import { config } from './config/index.js';

async function bootstrap() {
  console.log(`[CodeLens AI] Initializing server in ${config.env} mode...`);

  // Connect to database
  await connectDB();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`[CodeLens AI] Server running on http://localhost:${config.port}`);
    console.log(`[CodeLens AI] Health Check: http://localhost:${config.port}/api/v1/health`);
    console.log(`[CodeLens AI] AI Provider: ${config.geminiApiKey ? 'Google Gemini API' : 'CodeLens Heuristic Engine'}`);
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`\n[CodeLens AI] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[CodeLens AI] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch(err => {
  console.error('[CodeLens AI] Fatal initialization error:', err);
  process.exit(1);
});
