import { getEnv } from '../../config/environment.js';
import { createLogger } from '../../config/logger.js';
import { toErrorMessage } from '../../utils/errors.js';
const logger = createLogger('email-adapter');
export async function executeEmail(config) {
    const to = config['to'];
    const subject = config['subject'];
    const body = config['body'];
    const from = config['from'] ?? 'noreply@geekatyourspot.com';
    if (!to || !subject || !body) {
        return { success: false, output: {}, error: 'Email requires to, subject, and body' };
    }
    const env = getEnv();
    if (!env.SENDGRID_API_KEY) {
        return { success: false, output: {}, error: 'SENDGRID_API_KEY not configured' };
    }
    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: to }] }],
                from: { email: from },
                subject,
                content: [{ type: 'text/html', value: body }],
            }),
        });
        logger.info('Email sent', { to, subject, status: response.status });
        return {
            success: response.status >= 200 && response.status < 300,
            output: { status: response.status, to, subject },
            error: response.ok ? undefined : `SendGrid returned ${response.status}`,
        };
    }
    catch (error) {
        logger.error('Email failed', { to, error: toErrorMessage(error) });
        return { success: false, output: {}, error: toErrorMessage(error) };
    }
}
//# sourceMappingURL=email.adapter.js.map