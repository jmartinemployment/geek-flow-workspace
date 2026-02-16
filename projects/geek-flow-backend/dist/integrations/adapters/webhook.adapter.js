import { createLogger } from '../../config/logger.js';
import { toErrorMessage } from '../../utils/errors.js';
const logger = createLogger('webhook-adapter');
export async function executeWebhook(config, context) {
    const url = config['url'];
    const method = config['method']?.toUpperCase() ?? 'POST';
    const headers = config['headers'] ?? {};
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
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        }
        catch {
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
    }
    catch (error) {
        logger.error('Webhook failed', { url, error: toErrorMessage(error) });
        return { success: false, output: {}, error: toErrorMessage(error) };
    }
}
//# sourceMappingURL=webhook.adapter.js.map