import { executeWebhook } from './adapters/webhook.adapter.js';
import { executeEmail } from './adapters/email.adapter.js';
import { executeSlack } from './adapters/slack.adapter.js';
const adapterRegistry = new Map([
    ['webhook', executeWebhook],
    ['email', executeEmail],
    ['slack', executeSlack],
]);
export function resolveAdapter(adapterName) {
    return adapterRegistry.get(adapterName);
}
export function getAvailableAdapters() {
    return [...adapterRegistry.keys()];
}
//# sourceMappingURL=index.js.map