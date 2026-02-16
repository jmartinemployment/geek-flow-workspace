export declare const Plan: {
    readonly FREE: "FREE";
    readonly STARTER: "STARTER";
    readonly PRO: "PRO";
};
export type Plan = (typeof Plan)[keyof typeof Plan];
export declare const FlowStatus: {
    readonly DRAFT: "DRAFT";
    readonly ACTIVE: "ACTIVE";
    readonly PAUSED: "PAUSED";
    readonly ERROR: "ERROR";
};
export type FlowStatus = (typeof FlowStatus)[keyof typeof FlowStatus];
export declare const StepType: {
    readonly TRIGGER: "TRIGGER";
    readonly ACTION: "ACTION";
    readonly CONDITION: "CONDITION";
    readonly DELAY: "DELAY";
    readonly TRANSFORM: "TRANSFORM";
};
export type StepType = (typeof StepType)[keyof typeof StepType];
export declare const RunStatus: {
    readonly PENDING: "PENDING";
    readonly RUNNING: "RUNNING";
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
    readonly CANCELLED: "CANCELLED";
};
export type RunStatus = (typeof RunStatus)[keyof typeof RunStatus];
//# sourceMappingURL=enums.d.ts.map