export interface StepResult {
  output: Record<string, unknown>;
  status: 'completed' | 'failed' | 'skipped';
  duration: number;
}

export interface ExecutionContext {
  trigger: Record<string, unknown>;
  steps: Record<string, StepResult>;
  variables: Record<string, unknown>;
}

export function createContext(triggerData: Record<string, unknown>): ExecutionContext {
  return {
    trigger: triggerData,
    steps: {},
    variables: {},
  };
}

const VARIABLE_PATTERN = /\{\{(\w+)\.(\w+(?:\.\w+)*)\}\}/g;

export function resolveVariables(template: string, context: ExecutionContext): string {
  return template.replaceAll(VARIABLE_PATTERN, (_match, source: string, path: string) => {
    let data: Record<string, unknown> | undefined;

    if (source === 'trigger') {
      data = context.trigger;
    } else if (context.steps[source]) {
      data = context.steps[source].output;
    } else if (source === 'variables') {
      data = context.variables;
    }

    if (!data) return '';

    const segments = path.split('.');
    let current: unknown = data;

    for (const segment of segments) {
      if (current === null || current === undefined) return '';
      if (typeof current === 'object') {
        current = (current as Record<string, unknown>)[segment];
      } else {
        return '';
      }
    }

    return current !== null && current !== undefined ? String(current) : '';
  });
}

export function resolveConfigVariables(
  config: Record<string, unknown>,
  context: ExecutionContext,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      resolved[key] = resolveVariables(value, context);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      resolved[key] = resolveConfigVariables(value as Record<string, unknown>, context);
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}
