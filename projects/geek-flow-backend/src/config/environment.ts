import { z } from 'zod';

const sanitizeUrl = (val: string) => val.replaceAll(/\s+/g, '');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3200),
  DATABASE_URL: z.string().startsWith('postgres').transform(sanitizeUrl),
  DIRECT_URL: z.string().startsWith('postgres').transform(sanitizeUrl).optional(),
  ANTHROPIC_API_KEY: z.string().min(1),
  CORS_ORIGIN: z.string().default('https://geekatyourspot.com'),
  SENDGRID_API_KEY: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

let env: Environment;

export function loadEnvironment(): Environment {
  if (env) return env;

  // Sanitize database URLs in process.env — Render's UI can inject newlines
  if (process.env['DATABASE_URL']) {
    process.env['DATABASE_URL'] = process.env['DATABASE_URL'].replaceAll(/\s+/g, '');
  }
  if (process.env['DIRECT_URL']) {
    process.env['DIRECT_URL'] = process.env['DIRECT_URL'].replaceAll(/\s+/g, '');
  }

  env = envSchema.parse(process.env);
  return env;
}

export function getEnv(): Environment {
  if (!env) return loadEnvironment();
  return env;
}
