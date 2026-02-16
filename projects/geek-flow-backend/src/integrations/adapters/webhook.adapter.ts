import type { AdapterResult } from '../base-adapter.js';
import { createLogger } from '../../config/logger.js';
import { toErrorMessage } from '../../utils/errors.js';

const logger = createLogger('webhook-adapter');

export async function executeWebhook(
  config: Record<string, unknown>,
  context: Record<string, unknown>,
): Promise<AdapterResult> {
  const url = config['url'] as string | undefined;
  const method = (config['method'] as string | undefined)?.toUpperCase() ?? 'POST';
  const headers = (config['headers'] as Record<string, string> | undefined) ?? {};

  if (!url) {
    return { success: false, output: {}, error: 'Webhook URL is required' };
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: method !== 'GET' ? JSON.stringify(context) : undefined,
    });

    const responseText = await response.text();
    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    logger.info('Webhook executed', { url, status: response.status });

    return {
      success: response.ok,
      output: {
        status: response.status,
        body: responseData,
      },
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error: unknown) {
    logger.error('Webhook failed', { url, error: toErrorMessage(error) });
    return { success: false, output: {}, error: toErrorMessage(error) };
  }
}
