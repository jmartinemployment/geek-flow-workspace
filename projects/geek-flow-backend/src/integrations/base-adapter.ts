export interface AdapterResult {
  success: boolean;
  output: Record<string, unknown>;
  error?: string;
}

export type AdapterExecuteFn = (
  config: Record<string, unknown>,
  context: Record<string, unknown>,
) => Promise<AdapterResult>;
