import { z } from 'zod';
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3200),
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    ANTHROPIC_API_KEY: z.string().min(1),
    CORS_ORIGIN: z.string().default('https://geekatyourspot.com'),
    SENDGRID_API_KEY: z.string().optional(),
    SLACK_BOT_TOKEN: z.string().optional(),
});
let env;
export function loadEnvironment() {
    if (env)
        return env;
    env = envSchema.parse(process.env);
    return env;
}
export function getEnv() {
    if (!env)
        return loadEnvironment();
    return env;
}
//# sourceMappingURL=environment.js.map