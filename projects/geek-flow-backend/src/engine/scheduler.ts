import cron from 'node-cron';
import { getPrisma } from '../config/database.js';
import { createLogger } from '../config/logger.js';
import { toErrorMessage } from '../utils/errors.js';
import { executeFlow } from './executor.js';

const logger = createLogger('scheduler');

const scheduledJobs = new Map<string, cron.ScheduledTask>();

export async function startScheduler(): Promise<void> {
  logger.info('Starting flow scheduler');

  try {
    const prisma = getPrisma();
    const activeFlows = await prisma.flow.findMany({
      where: {
        status: 'ACTIVE',
        schedule: { not: null },
      },
      select: { id: true, schedule: true },
    });

    for (const flow of activeFlows) {
      if (flow.schedule && cron.validate(flow.schedule)) {
        scheduleFlow(flow.id, flow.schedule);
      }
    }

    logger.info(`Scheduler started with ${scheduledJobs.size} scheduled flows`);
  } catch (error: unknown) {
    logger.error('Failed to start scheduler', { error: toErrorMessage(error) });
  }
}

export function scheduleFlow(flowId: string, cronExpression: string): void {
  const existing = scheduledJobs.get(flowId);
  if (existing) {
    existing.stop();
  }

  const task = cron.schedule(cronExpression, () => {
    logger.info('Cron trigger fired', { flowId, cron: cronExpression });
    executeFlow(flowId, { source: 'cron', firedAt: new Date().toISOString() }).catch(
      (error: unknown) => {
        logger.error('Scheduled flow execution failed', { flowId, error: toErrorMessage(error) });
      },
    );
  });

  scheduledJobs.set(flowId, task);
  logger.info('Flow scheduled', { flowId, cron: cronExpression });
}

export function unscheduleFlow(flowId: string): void {
  const task = scheduledJobs.get(flowId);
  if (task) {
    task.stop();
    scheduledJobs.delete(flowId);
    logger.info('Flow unscheduled', { flowId });
  }
}
