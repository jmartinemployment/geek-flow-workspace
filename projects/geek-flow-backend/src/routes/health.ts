import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'geek-flow-backend',
  });
});

// TEMPORARY DEBUG — remove after fixing DATABASE_URL
router.get('/debug/db-url', (_req, res) => {
  const url = process.env['DATABASE_URL'] ?? 'NOT SET';
  const masked = url.replaceAll(/:[^@]+@/g, ':****@');
  res.json({
    masked,
    length: url.length,
    startsWithPostgres: url.startsWith('postgres'),
    hasAt: url.includes('@'),
    charCodes: [...url].map((c) => c.charCodeAt(0)),
  });
});

export default router;
