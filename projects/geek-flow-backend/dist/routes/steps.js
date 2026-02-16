import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { getPrisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createLogger } from '../config/logger.js';
import { toErrorMessage } from '../utils/errors.js';
const router = Router();
const logger = createLogger('steps-routes');
const jsonValue = z.lazy(() => z.union([z.string(), z.number(), z.boolean(), z.record(jsonValue), z.array(jsonValue)]));
const stepTypeEnum = z.enum(['TRIGGER', 'ACTION', 'CONDITION', 'DELAY', 'TRANSFORM']);
const createStepSchema = z.object({
    type: stepTypeEnum,
    adapter: z.string().min(1),
    action: z.string().min(1),
    config: jsonValue.default({}),
    inputMapping: jsonValue.optional(),
    order: z.number().int().min(0).optional(),
});
const updateStepSchema = z.object({
    adapter: z.string().min(1).optional(),
    action: z.string().min(1).optional(),
    config: jsonValue.optional(),
    inputMapping: jsonValue.nullable().optional(),
});
const reorderSchema = z.object({
    stepIds: z.array(z.string().min(1)),
});
// POST /api/flows/:flowId/steps — Add step
router.post('/api/flows/:flowId/steps', async (req, res) => {
    try {
        const parsed = createStepSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
            return;
        }
        const prisma = getPrisma();
        const flow = await prisma.flow.findUnique({ where: { id: req.params.flowId } });
        if (!flow) {
            sendError(res, 'Flow not found', 404, 'NOT_FOUND');
            return;
        }
        const existingSteps = await prisma.step.count({ where: { flowId: flow.id } });
        const order = parsed.data.order ?? existingSteps;
        const step = await prisma.step.create({
            data: {
                flowId: flow.id,
                order,
                type: parsed.data.type,
                adapter: parsed.data.adapter,
                action: parsed.data.action,
                config: parsed.data.config,
                inputMapping: parsed.data.inputMapping,
            },
        });
        logger.info('Step created', { stepId: step.id, flowId: flow.id });
        sendSuccess(res, step, 201);
    }
    catch (error) {
        logger.error('Failed to create step', { error: toErrorMessage(error) });
        sendError(res, 'Failed to create step');
    }
});
// PUT /api/flows/:flowId/steps/:stepId — Update step config
router.put('/api/flows/:flowId/steps/:stepId', async (req, res) => {
    try {
        const parsed = updateStepSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
            return;
        }
        const prisma = getPrisma();
        const existing = await prisma.step.findFirst({
            where: { id: req.params.stepId, flowId: req.params.flowId },
        });
        if (!existing) {
            sendError(res, 'Step not found', 404, 'NOT_FOUND');
            return;
        }
        const updateData = {
            ...parsed.data,
            inputMapping: parsed.data.inputMapping === null
                ? Prisma.JsonNull
                : parsed.data.inputMapping,
        };
        const step = await prisma.step.update({
            where: { id: req.params.stepId },
            data: updateData,
        });
        logger.info('Step updated', { stepId: step.id });
        sendSuccess(res, step);
    }
    catch (error) {
        logger.error('Failed to update step', { error: toErrorMessage(error) });
        sendError(res, 'Failed to update step');
    }
});
// DELETE /api/flows/:flowId/steps/:stepId — Remove step and reorder
router.delete('/api/flows/:flowId/steps/:stepId', async (req, res) => {
    try {
        const prisma = getPrisma();
        const existing = await prisma.step.findFirst({
            where: { id: req.params.stepId, flowId: req.params.flowId },
        });
        if (!existing) {
            sendError(res, 'Step not found', 404, 'NOT_FOUND');
            return;
        }
        await prisma.step.delete({ where: { id: req.params.stepId } });
        // Reorder remaining steps
        const remaining = await prisma.step.findMany({
            where: { flowId: req.params.flowId },
            orderBy: { order: 'asc' },
        });
        await Promise.all(remaining.map((step, index) => prisma.step.update({ where: { id: step.id }, data: { order: index } })));
        logger.info('Step deleted', { stepId: req.params.stepId });
        sendSuccess(res, { deleted: true });
    }
    catch (error) {
        logger.error('Failed to delete step', { error: toErrorMessage(error) });
        sendError(res, 'Failed to delete step');
    }
});
// PUT /api/flows/:flowId/steps/reorder — Batch reorder
router.put('/api/flows/:flowId/steps/reorder', async (req, res) => {
    try {
        const parsed = reorderSchema.safeParse(req.body);
        if (!parsed.success) {
            sendError(res, parsed.error.issues[0].message, 400, 'VALIDATION_ERROR');
            return;
        }
        const prisma = getPrisma();
        await Promise.all(parsed.data.stepIds.map((stepId, index) => prisma.step.update({
            where: { id: stepId },
            data: { order: index },
        })));
        const steps = await prisma.step.findMany({
            where: { flowId: req.params.flowId },
            orderBy: { order: 'asc' },
        });
        logger.info('Steps reordered', { flowId: req.params.flowId });
        sendSuccess(res, steps);
    }
    catch (error) {
        logger.error('Failed to reorder steps', { error: toErrorMessage(error) });
        sendError(res, 'Failed to reorder steps');
    }
});
export default router;
//# sourceMappingURL=steps.js.map