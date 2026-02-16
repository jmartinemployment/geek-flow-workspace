import { Router } from 'express';
import { getPrisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createLogger } from '../config/logger.js';
import { toErrorMessage } from '../utils/errors.js';
import { executeFlow } from '../engine/executor.js';
const router = Router();
const logger = createLogger('webhook-routes');
// POST /api/webhooks/:flowId — Inbound webhook trigger (public, 202 async)
router.post('/api/webhooks/:flowId', async (req, res) => {
    try {
        const prisma = getPrisma();
        const flow = await prisma.flow.findUnique({ where: { id: req.params.flowId } });
        if (!flow) {
            sendError(res, 'Flow not found', 404, 'NOT_FOUND');
            return;
        }
        if (flow.status !== 'ACTIVE') {
            sendError(res, 'Flow is not active', 400, 'FLOW_INACTIVE');
            return;
        }
        const triggerData = {
            source: 'webhook',
            receivedAt: new Date().toISOString(),
            headers: req.headers,
            body: req.body,
        };
        // Fire and forget — respond immediately
        executeFlow(flow.id, triggerData).catch((error) => {
            logger.error('Webhook-triggered flow failed', {
                flowId: flow.id,
                error: toErrorMessage(error),
            });
        });
        logger.info('Webhook received', { flowId: flow.id });
        sendSuccess(res, { accepted: true, flowId: flow.id }, 202);
    }
    catch (error) {
        logger.error('Failed to process webhook', { error: toErrorMessage(error) });
        sendError(res, 'Failed to process webhook');
    }
});
// GET /api/webhooks/:flowId — Webhook URL + config info
router.get('/api/webhooks/:flowId', async (req, res) => {
    try {
        const prisma = getPrisma();
        const flow = await prisma.flow.findUnique({
            where: { id: req.params.flowId },
            select: { id: true, name: true, status: true },
        });
        if (!flow) {
            sendError(res, 'Flow not found', 404, 'NOT_FOUND');
            return;
        }
        const webhookUrl = `${req.protocol}://${req.get('host')}/api/webhooks/${flow.id}`;
        sendSuccess(res, {
            flowId: flow.id,
            flowName: flow.name,
            status: flow.status,
            webhookUrl,
            method: 'POST',
        });
    }
    catch (error) {
        logger.error('Failed to get webhook info', { error: toErrorMessage(error) });
        sendError(res, 'Failed to get webhook info');
    }
});
export default router;
//# sourceMappingURL=webhooks.js.map