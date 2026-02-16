import type { Response } from 'express';
export declare function sendSuccess<T>(res: Response, data: T, statusCode?: number): void;
export declare function sendError(res: Response, message: string, statusCode?: number, code?: string): void;
//# sourceMappingURL=response.d.ts.map