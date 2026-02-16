import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_URL: z.ZodString;
    DIRECT_URL: z.ZodOptional<z.ZodString>;
    ANTHROPIC_API_KEY: z.ZodString;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
    SENDGRID_API_KEY: z.ZodOptional<z.ZodString>;
    SLACK_BOT_TOKEN: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    ANTHROPIC_API_KEY: string;
    CORS_ORIGIN: string;
    DIRECT_URL?: string | undefined;
    SENDGRID_API_KEY?: string | undefined;
    SLACK_BOT_TOKEN?: string | undefined;
}, {
    DATABASE_URL: string;
    ANTHROPIC_API_KEY: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: number | undefined;
    DIRECT_URL?: string | undefined;
    CORS_ORIGIN?: string | undefined;
    SENDGRID_API_KEY?: string | undefined;
    SLACK_BOT_TOKEN?: string | undefined;
}>;
export type Environment = z.infer<typeof envSchema>;
export declare function loadEnvironment(): Environment;
export declare function getEnv(): Environment;
export {};
//# sourceMappingURL=environment.d.ts.map