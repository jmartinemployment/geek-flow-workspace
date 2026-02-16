import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { loadEnvironment } from './config/environment.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import flowsRouter from './routes/flows.js';
import stepsRouter from './routes/steps.js';
import executionRouter from './routes/execution.js';
import webhooksRouter from './routes/webhooks.js';
import { startScheduler } from './engine/scheduler.js';

const env = loadEnvironment();
const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use(healthRouter);
app.use(flowsRouter);
app.use(stepsRouter);
app.use(executionRouter);
app.use(webhooksRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`GeekFlow backend running on port ${env.PORT}`, {
    env: env.NODE_ENV,
  });

  startScheduler().catch((error: unknown) => {
    logger.error('Failed to start scheduler', { error: String(error) });
  });
});

export default app;
