import type { AdapterExecuteFn } from './base-adapter.js';
import { executeWebhook } from './adapters/webhook.adapter.js';
import { executeEmail } from './adapters/email.adapter.js';
import { executeSlack } from './adapters/slack.adapter.js';

const adapterRegistry = new Map<string, AdapterExecuteFn>([
  ['webhook', executeWebhook],
  ['email', executeEmail],
  ['slack', executeSlack],
]);

export function resolveAdapter(adapterName: string): AdapterExecuteFn | undefined {
  return adapterRegistry.get(adapterName);
}

export function getAvailableAdapters(): string[] {
  return [...adapterRegistry.keys()];
}
