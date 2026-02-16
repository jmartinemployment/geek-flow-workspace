import type { Prisma } from '../generated/prisma/client.js';
import { getPrisma } from '../config/database.js';
import { createLogger } from '../config/logger.js';
import { toErrorMessage } from '../utils/errors.js';
import { resolveAdapter } from '../integrations/index.js';
import { createContext, resolveConfigVariables } from './context.js';
import type { ExecutionContext } from './context.js';

const logger = createLogger('executor');

const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeFlow(
  flowId: string,
  triggerData: Record<string, unknown> = {},
): Promise<string> {
  const prisma = getPrisma();

  const flow = await prisma.flow.findUnique({
    where: { id: flowId },
    include: { steps: { orderBy: { order: 'asc' } } },
  });

  if (!flow) {
    throw new Error(`Flow ${flowId} not found`);
  }

  const run = await prisma.run.create({
    data: {
      flowId: flow.id,
      status: 'RUNNING',
      triggerData: triggerData as Prisma.InputJsonValue,
    },
  });

  const context: ExecutionContext = createContext(triggerData);

  logger.info('Flow execution started', { flowId, runId: run.id });

  try {
    for (const step of flow.steps) {
      if (step.type === 'TRIGGER') {
        context.steps[step.id] = {
          output: triggerData,
          status: 'completed',
          duration: 0,
        };
        continue;
      }

      const adapter = resolveAdapter(step.adapter);
      if (!adapter) {
        const errorMsg = `No adapter found for '${step.adapter}'`;
        await prisma.runLog.create({
          data: {
            runId: run.id,
            stepId: step.id,
            status: 'failed',
            error: errorMsg,
          },
        });
        context.steps[step.id] = { output: {}, status: 'failed', duration: 0 };
        throw new Error(errorMsg);
      }

      const resolvedConfig = resolveConfigVariables(
        step.config as Record<string, unknown>,
        context,
      );

      const startTime = Date.now();
      let lastError: string | undefined;
      let success = false;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const delay = BACKOFF_BASE_MS * Math.pow(4, attempt - 1);
          logger.warn(`Retrying step ${step.id}, attempt ${attempt}`, { delay });
          await sleep(delay);
        }

        const result = await adapter(resolvedConfig, context.trigger);

        if (result.success) {
          const duration = Date.now() - startTime;
          context.steps[step.id] = {
            output: result.output,
            status: 'completed',
            duration,
          };

          await prisma.runLog.create({
            data: {
              runId: run.id,
              stepId: step.id,
              status: 'completed',
              input: resolvedConfig as Prisma.InputJsonValue,
              output: result.output as Prisma.InputJsonValue,
              duration,
            },
          });

          success = true;
          break;
        }

        lastError = result.error;
      }

      if (!success) {
        const duration = Date.now() - startTime;
        context.steps[step.id] = { output: {}, status: 'failed', duration };

        await prisma.runLog.create({
          data: {
            runId: run.id,
            stepId: step.id,
            status: 'failed',
            input: resolvedConfig as Prisma.InputJsonValue,
            error: lastError,
            duration,
          },
        });

        throw new Error(`Step ${step.id} (${step.adapter}.${step.action}) failed: ${lastError}`);
      }
    }

    await prisma.run.update({
      where: { id: run.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    logger.info('Flow execution completed', { flowId, runId: run.id });
    return run.id;
  } catch (error: unknown) {
    await prisma.run.update({
      where: { id: run.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: toErrorMessage(error),
      },
    });

    logger.error('Flow execution failed', { flowId, runId: run.id, error: toErrorMessage(error) });
    return run.id;
  }
}
