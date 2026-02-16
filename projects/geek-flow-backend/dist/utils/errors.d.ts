export declare function toErrorMessage(error: unknown): string;
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code?: string | undefined;
    constructor(message: string, statusCode?: number, code?: string | undefined);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string, id: string);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map