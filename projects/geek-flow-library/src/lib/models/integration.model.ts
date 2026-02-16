import type { StepType } from './flow.model';

export interface AdapterDefinition {
  name: string;
  label: string;
  icon: string;
  color: string;
  category: 'trigger' | 'action' | 'logic';
  actions: AdapterAction[];
}

export interface AdapterAction {
  name: string;
  label: string;
  type: StepType;
  configFields: ConfigField[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'json';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface StepTemplate {
  type: StepType;
  adapter: string;
  action: string;
  label: string;
  icon: string;
  color: string;
  defaultConfig: Record<string, unknown>;
}

export interface UserIntegration {
  id: string;
  userId: string;
  adapter: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
