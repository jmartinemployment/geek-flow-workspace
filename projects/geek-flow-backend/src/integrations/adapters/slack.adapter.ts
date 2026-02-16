import type { AdapterResult } from '../base-adapter.js';
import { getEnv } from '../../config/environment.js';
import { createLogger } from '../../config/logger.js';
import { toErrorMessage } from '../../utils/errors.js';

const logger = createLogger('slack-adapter');

export async function executeSlack(
  config: Record<string, unknown>,
): Promise<AdapterResult> {
  const channel = config['channel'] as string | undefined;
  const text = config['text'] as string | undefined;

  if (!channel || !text) {
    return { success: false, output: {}, error: 'Slack requires channel and text' };
  }

  const env = getEnv();
  if (!env.SLACK_BOT_TOKEN) {
    return { success: false, output: {}, error: 'SLACK_BOT_TOKEN not configured' };
  }

  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel, text }),
    });

    const data = await response.json() as { ok: boolean; ts?: string; error?: string };

    logger.info('Slack message sent', { channel, ok: data.ok });

    return {
      success: data.ok,
      output: { ts: data.ts, channel },
      error: data.ok ? undefined : data.error,
    };
  } catch (error: unknown) {
    logger.error('Slack failed', { channel, error: toErrorMessage(error) });
    return { success: false, output: {}, error: toErrorMessage(error) };
  }
}
