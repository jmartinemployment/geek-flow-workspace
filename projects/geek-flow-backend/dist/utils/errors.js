export function toErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    return 'An unknown error occurred';
}
export class AppError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
export class NotFoundError extends AppError {
    constructor(resource, id) {
        super(`${resource} with id '${id}' not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
//# sourceMappingURL=errors.js.map