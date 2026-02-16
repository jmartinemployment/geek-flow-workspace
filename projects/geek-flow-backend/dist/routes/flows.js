import { Router } from 'express';
import { z } from 'zod';
import { getPrisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createLogger } from '../config/logger.js';
import { toErrorMessage } from '../utils/errors.js';
const router = Router();
const logger = createLogger('flows-routes');
const jsonValue = z.lazy(() => z.union([z.string(), z.number(), z.boolean(), z.record(jsonValue), z.array(jsonValue)]));
const createFlowSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    trigger: jsonValue.default({}),
    userId: z.string().min(1),
});
const updateFlowSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    trigger: jsonValue.optional(),
    connections: z.array(jsonValue).optional(),
    canvasLayout: jsonValue.optional(),
    schedule: z.string().nullable().optional(),
});
// POST /api/flows — Create a new flow
router.post('/api/flows', async (req, res) => {
    try {
        const parsed = createFlowSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
            return;
        }
        const prisma = getPrisma();
        const flow = await prisma.flow.create({
            data: {
                userId: parsed.data.userId,
                name: parsed.data.name,
                description: parsed.data.description,
                trigger: parsed.data.trigger,
            },
            include: { steps: true },
        });
        logger.info('Flow created', { flowId: flow.id });
        sendSuccess(res, flow, 201);
    }
    catch (error) {
        logger.error('Failed to create flow', { error: toErrorMessage(error) });
        sendError(res, 'Failed to create flow');
    }
});
// GET /api/flows — List flows
router.get('/api/flows', async (req, res) => {
    try {
        const userId = typeof req.query['userId'] === 'string' ? req.query['userId'] : undefined;
        const prisma = getPrisma();
        const flows = await prisma.flow.findMany({
            where: userId ? { userId } : undefined,
            include: {
                steps: { select: { id: true } },
                runs: {
                    orderBy: { startedAt: 'desc' },
                    take: 1,
                    select: { id: true, status: true, startedAt: true, completedAt: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        const summaries = flows.map((flow) => ({
            ...flow,
            stepCount: flow.steps.length,
            lastRun: flow.runs.at(0) ?? null,
            steps: undefined,
            runs: undefined,
        }));
        sendSuccess(res, summaries);
    }
    catch (error) {
        logger.error('Failed to list flows', { error: toErrorMessage(error) });
        sendError(res, 'Failed to list flows');
    }
});
// GET /api/flows/:id — Get flow with steps and canvas layout
router.get('/api/flows/:id', async (req, res) => {
    try {
        const prisma = getPrisma();
        const flow = await prisma.flow.findUnique({
            where: { id: req.params.id },
            include: {
                steps: { orderBy: { order: 'asc' } },
            },
        });
        if (!flow) {
            sendError(res, 'Flow not found', 404, 'NOT_FOUND');
            return;
        }
        sendSuccess(res, flow);
    }
    catch (error) {
        logger.error('Failed to get flow', { error: toErrorMessage(error) });
        sendError(res, 'Failed to get flow');
    }
});
// PUT /api/flows/:id — Update flow
router.put('/api/flows/:id', async (req, res) => {
    try {
        const parsed = updateFlowSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
            return;
        }
        const prisma = getPrisma();
        const existing = await prisma.flow.findUnique({ where: { id: req.params.id } });
        if (!existing) {
            sendError(res, 'Flow not found', 404, 'NOT_FOUND');
            return;
        }
        const flow = await prisma.flow.update({
            where: { id: req.params.id },
            data: parsed.data,
            include: { steps: { orderBy: { order: 'asc' } } },
        });
        logger.info('Flow updated', { flowId: flow.id });
        sendSuccess(res, flow);
    }
    catch (error) {
        logger.error('Failed to update flow', { error: toErrorMessage(error) });
        sendError(res, 'Failed to update flow');
    }
});
// DELETE /api/flows/:id — Delete flow (cascade)
router.delete('/api/flows/:id', async (req, res) => {
    try {
        const prisma = getPrisma();
        const existing = await prisma.flow.findUnique({ where: { id: req.params.id } });
        if (!existing) {
            sendError(res, 'Flow not found', 404, 'NOT_FOUND');
            return;
        }
        await prisma.flow.delete({ where: { id: req.params.id } });
        logger.info('Flow deleted', { flowId: req.params.id });
        sendSuccess(res, { deleted: true });
    }
    catch (error) {
        logger.error('Failed to delete flow', { error: toErrorMessage(error) });
        sendError(res, 'Failed to delete flow');
    }
});
// POST /api/flows/:id/activate — Validate and activate flow
router.post('/api/flows/:id/activate', async (req, res) => {
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
        if (flow.steps.length === 0) {
            sendError(res, 'Flow must have at least one step to activate', 400, 'VALIDATION_ERROR');
            return;
        }
        const updated = await prisma.flow.update({
            where: { id: req.params.id },
            data: { status: 'ACTIVE' },
            include: { steps: { orderBy: { order: 'asc' } } },
        });
        logger.info('Flow activated', { flowId: flow.id });
        sendSuccess(res, updated);
    }
    catch (error) {
        logger.error('Failed to activate flow', { error: toErrorMessage(error) });
        sendError(res, 'Failed to activate flow');
    }
});
// POST /api/flows/:id/pause — Pause active flow
router.post('/api/flows/:id/pause', async (req, res) => {
    try {
        const prisma = getPrisma();
        const existing = await prisma.flow.findUnique({ where: { id: req.params.id } });
        if (!existing) {
            sendError(res, 'Flow not found', 404, 'NOT_FOUND');
            return;
        }
        const flow = await prisma.flow.update({
            where: { id: req.params.id },
            data: { status: 'PAUSED' },
        });
        logger.info('Flow paused', { flowId: flow.id });
        sendSuccess(res, flow);
    }
    catch (error) {
        logger.error('Failed to pause flow', { error: toErrorMessage(error) });
        sendError(res, 'Failed to pause flow');
    }
});
// POST /api/flows/:id/duplicate — Clone flow + steps
router.post('/api/flows/:id/duplicate', async (req, res) => {
    try {
        const prisma = getPrisma();
        const original = await prisma.flow.findUnique({
            where: { id: req.params.id },
            include: { steps: { orderBy: { order: 'asc' } } },
        });
        if (!original) {
            sendError(res, 'Flow not found', 404, 'NOT_FOUND');
            return;
        }
        const clone = await prisma.flow.create({
            data: {
                userId: original.userId,
                name: `${original.name} (copy)`,
                description: original.description,
                trigger: original.trigger,
                connections: original.connections,
                canvasLayout: original.canvasLayout ?? undefined,
                schedule: original.schedule,
                steps: {
                    create: original.steps.map((step) => ({
                        order: step.order,
                        type: step.type,
                        adapter: step.adapter,
                        action: step.action,
                        config: step.config,
                        inputMapping: step.inputMapping ?? undefined,
                    })),
                },
            },
            include: { steps: { orderBy: { order: 'asc' } } },
        });
        logger.info('Flow duplicated', { originalId: original.id, cloneId: clone.id });
        sendSuccess(res, clone, 201);
    }
    catch (error) {
        logger.error('Failed to duplicate flow', { error: toErrorMessage(error) });
        sendError(res, 'Failed to duplicate flow');
    }
});
export default router;
//# sourceMappingURL=flows.js.map