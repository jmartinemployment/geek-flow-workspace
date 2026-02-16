export type FlowStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ERROR';
export type StepType = 'TRIGGER' | 'ACTION' | 'CONDITION' | 'DELAY' | 'TRANSFORM';

export interface Flow {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: FlowStatus;
  trigger: Record<string, unknown>;
  connections: Connection[];
  canvasLayout: CanvasLayout | null;
  schedule: string | null;
  createdAt: string;
  updatedAt: string;
  steps: Step[];
}

export interface FlowSummary {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: FlowStatus;
  trigger: Record<string, unknown>;
  schedule: string | null;
  createdAt: string;
  updatedAt: string;
  stepCount: number;
  lastRun: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
  } | null;
}

export interface Step {
  id: string;
  flowId: string;
  order: number;
  type: StepType;
  adapter: string;
  action: string;
  config: Record<string, unknown>;
  inputMapping: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  fromStepId: string;
  toStepId: string;
  condition?: string;
}

export interface CanvasNode {
  stepId: string;
  x: number;
  y: number;
}

export interface CanvasLayout {
  nodes: CanvasNode[];
  zoom: number;
  panX: number;
  panY: number;
}
