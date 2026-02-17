import { Router } from 'express';
import { getPrisma } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { toErrorMessage } from '../utils/errors.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'geek-flow-backend',
  });
});

// POST /api/seed — Create default user (idempotent)
router.post('/api/seed', async (_req, res) => {
  try {
    const prisma = getPrisma();
    const user = await prisma.user.upsert({
      where: { id: 'default-user' },
      update: {},
      create: {
        id: 'default-user',
        email: 'jeff@geekatyourspot.com',
        name: 'Jeff',
      },
    });
    sendSuccess(res, user);
  } catch (error: unknown) {
    sendError(res, toErrorMessage(error));
  }
});

export default router;
