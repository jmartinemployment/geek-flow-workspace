export function createContext(triggerData) {
    return {
        trigger: triggerData,
        steps: {},
        variables: {},
    };
}
const VARIABLE_PATTERN = /\{\{(\w+)\.(\w+(?:\.\w+)*)\}\}/g;
export function resolveVariables(template, context) {
    return template.replaceAll(VARIABLE_PATTERN, (_match, source, path) => {
        let data;
        if (source === 'trigger') {
            data = context.trigger;
        }
        else if (context.steps[source]) {
            data = context.steps[source].output;
        }
        else if (source === 'variables') {
            data = context.variables;
        }
        if (!data)
            return '';
        const segments = path.split('.');
        let current = data;
        for (const segment of segments) {
            if (current === null || current === undefined)
                return '';
            if (typeof current === 'object') {
                current = current[segment];
            }
            else {
                return '';
            }
        }
        return current !== null && current !== undefined ? String(current) : '';
    });
}
export function resolveConfigVariables(config, context) {
    const resolved = {};
    for (const [key, value] of Object.entries(config)) {
        if (typeof value === 'string') {
            resolved[key] = resolveVariables(value, context);
        }
        else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            resolved[key] = resolveConfigVariables(value, context);
        }
        else {
            resolved[key] = value;
        }
    }
    return resolved;
}
//# sourceMappingURL=context.js.map