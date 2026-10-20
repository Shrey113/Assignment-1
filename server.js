import app from './src/app.js';
import { config } from './src/config/env.js';
import { createAllTables } from './src/config/tables.js';

async function bootstrap() {
  try {
    // Automatically verify/create database and tables on startup
    await createAllTables();

    // Start Express HTTP Server on configured port
    app.listen(config.port, () => {
      console.log(`
🚀 BloodLink Server is running!
📡 URL: http://localhost:${config.port}
🩺 Health Check: http://localhost:${config.port}/api/health
🩸 Donors Endpoint: http://localhost:${config.port}/api/donors
📋 Requests Endpoint: http://localhost:${config.port}/api/requests
      `);
    });
  } catch (error) {
    console.error('Fatal Server Boot Error:', error.message);
    process.exit(1);
  }
}

bootstrap();
