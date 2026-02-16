import { Router } from 'express';
import { getPrisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createLogger } from '../config/logger.js';
import { toErrorMessage } from '../utils/errors.js';
import { executeFlow } from '../engine/executor.js';

const router = Router();
const logger = createLogger('execution-routes');

// POST /api/flows/:id/test — Test run flow with sample data
router.post('/api/flows/:id/test', async (req, res) => {
  try {
    const prisma = getPrisma();
    const flow = await prisma.flow.findUnique({
      where: { id: req.params.id },
      include: { steps: true },
    });

    if (!flow) {
      sendError(res, 'Flow not found', 404, 'NOT_FOUND');
      return;
    }

    const triggerData = (req.body as Record<string, unknown>) ?? {};

    const runId = executeFlow(flow.id, triggerData).catch((error: unknown) => {
      logger.error('Test run failed', { flowId: flow.id, error: toErrorMessage(error) });
    });

    // Return immediately with 202, execution continues in background
    sendSuccess(res, { flowId: flow.id, status: 'triggered', runId: await runId }, 202);
  } catch (error: unknown) {
    logger.error('Failed to trigger test run', { error: toErrorMessage(error) });
    sendError(res, 'Failed to trigger test run');
  }
});

// GET /api/flows/:id/runs — Paginated run history
router.get('/api/flows/:id/runs', async (req, res) => {
  try {
    const page = Number.parseInt(typeof req.query['page'] === 'string' ? req.query['page'] : '1', 10);
    const limit = Number.parseInt(typeof req.query['limit'] === 'string' ? req.query['limit'] : '20', 10);
    const skip = (page - 1) * limit;

    const prisma = getPrisma();
    const [runs, total] = await Promise.all([
      prisma.run.findMany({
        where: { flowId: req.params.id },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          startedAt: true,
          completedAt: true,
          error: true,
        },
      }),
      prisma.run.count({ where: { flowId: req.params.id } }),
    ]);

    sendSuccess(res, { runs, total, page, limit });
  } catch (error: unknown) {
    logger.error('Failed to list runs', { error: toErrorMessage(error) });
    sendError(res, 'Failed to list runs');
  }
});

// GET /api/runs/:id — Run detail with step-by-step logs
router.get('/api/runs/:id', async (req, res) => {
  try {
    const prisma = getPrisma();
    const run = await prisma.run.findUnique({
      where: { id: req.params.id },
      include: {
        logs: { orderBy: { createdAt: 'asc' } },
        flow: { select: { id: true, name: true } },
      },
    });

    if (!run) {
      sendError(res, 'Run not found', 404, 'NOT_FOUND');
      return;
    }

    sendSuccess(res, run);
  } catch (error: unknown) {
    logger.error('Failed to get run', { error: toErrorMessage(error) });
    sendError(res, 'Failed to get run');
  }
});

// POST /api/runs/:id/cancel — Cancel a running flow
router.post('/api/runs/:id/cancel', async (req, res) => {
  try {
    const prisma = getPrisma();
    const run = await prisma.run.findUnique({ where: { id: req.params.id } });

    if (!run) {
      sendError(res, 'Run not found', 404, 'NOT_FOUND');
      return;
    }

    if (run.status !== 'RUNNING' && run.status !== 'PENDING') {
      sendError(res, 'Run is not cancellable', 400, 'INVALID_STATE');
      return;
    }

    const updated = await prisma.run.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });

    logger.info('Run cancelled', { runId: run.id });
    sendSuccess(res, updated);
  } catch (error: unknown) {
    logger.error('Failed to cancel run', { error: toErrorMessage(error) });
    sendError(res, 'Failed to cancel run');
  }
});

export default router;
