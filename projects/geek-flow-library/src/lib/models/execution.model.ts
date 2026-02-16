export type RunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Run {
  id: string;
  flowId: string;
  status: RunStatus;
  triggerData: Record<string, unknown> | null;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
  logs: RunLog[];
  flow?: { id: string; name: string };
}

export interface RunSummary {
  id: string;
  status: RunStatus;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

export interface RunLog {
  id: string;
  runId: string;
  stepId: string;
  status: string;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  duration: number | null;
  createdAt: string;
}

export interface PaginatedRuns {
  runs: RunSummary[];
  total: number;
  page: number;
  limit: number;
}
