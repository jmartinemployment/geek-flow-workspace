export function sendSuccess(res, data, statusCode = 200) {
    const body = { success: true, data };
    res.status(statusCode).json(body);
}
export function sendError(res, message, statusCode = 500, code) {
    const body = {
        success: false,
        error: { message, code },
    };
    res.status(statusCode).json(body);
}
//# sourceMappingURL=response.js.map