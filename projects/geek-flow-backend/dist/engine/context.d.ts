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
export declare function createContext(triggerData: Record<string, unknown>): ExecutionContext;
export declare function resolveVariables(template: string, context: ExecutionContext): string;
export declare function resolveConfigVariables(config: Record<string, unknown>, context: ExecutionContext): Record<string, unknown>;
//# sourceMappingURL=context.d.ts.map