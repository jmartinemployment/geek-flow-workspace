import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Flow, FlowSummary, Step } from '../models/flow.model';
import type { Run, PaginatedRuns } from '../models/execution.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class GeekFlowApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://geek-flow-workspace.onrender.com/api';

  // --- Flows ---

  async createFlow(userId: string, name: string, description?: string): Promise<Flow> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Flow>>(`${this.baseUrl}/flows`, {
        userId, name, description, trigger: {},
      }),
    );
    return res.data;
  }

  async getFlows(userId?: string): Promise<FlowSummary[]> {
    const params: Record<string, string> = {};
    if (userId) {
      params['userId'] = userId;
    }
    const res = await firstValueFrom(
      this.http.get<ApiResponse<FlowSummary[]>>(`${this.baseUrl}/flows`, { params }),
    );
    return res.data;
  }

  async getFlow(id: string): Promise<Flow> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Flow>>(`${this.baseUrl}/flows/${id}`),
    );
    return res.data;
  }

  async updateFlow(id: string, data: Record<string, unknown>): Promise<Flow> {
    const res = await firstValueFrom(
      this.http.put<ApiResponse<Flow>>(`${this.baseUrl}/flows/${id}`, data),
    );
    return res.data;
  }

  async deleteFlow(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.baseUrl}/flows/${id}`),
    );
  }

  async activateFlow(id: string): Promise<Flow> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Flow>>(`${this.baseUrl}/flows/${id}/activate`, {}),
    );
    return res.data;
  }

  async pauseFlow(id: string): Promise<Flow> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Flow>>(`${this.baseUrl}/flows/${id}/pause`, {}),
    );
    return res.data;
  }

  async duplicateFlow(id: string): Promise<Flow> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Flow>>(`${this.baseUrl}/flows/${id}/duplicate`, {}),
    );
    return res.data;
  }

  // --- Steps ---

  async addStep(flowId: string, step: Partial<Step>): Promise<Step> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Step>>(`${this.baseUrl}/flows/${flowId}/steps`, step),
    );
    return res.data;
  }

  async updateStep(flowId: string, stepId: string, data: Partial<Step>): Promise<Step> {
    const res = await firstValueFrom(
      this.http.put<ApiResponse<Step>>(`${this.baseUrl}/flows/${flowId}/steps/${stepId}`, data),
    );
    return res.data;
  }

  async deleteStep(flowId: string, stepId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.baseUrl}/flows/${flowId}/steps/${stepId}`),
    );
  }

  async reorderSteps(flowId: string, stepIds: string[]): Promise<Step[]> {
    const res = await firstValueFrom(
      this.http.put<ApiResponse<Step[]>>(`${this.baseUrl}/flows/${flowId}/steps/reorder`, { stepIds }),
    );
    return res.data;
  }

  // --- Execution ---

  async testFlow(flowId: string, triggerData?: Record<string, unknown>): Promise<{ flowId: string; status: string; runId: string }> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<{ flowId: string; status: string; runId: string }>>(
        `${this.baseUrl}/flows/${flowId}/test`,
        triggerData ?? {},
      ),
    );
    return res.data;
  }

  async getFlowRuns(flowId: string, page = 1, limit = 20): Promise<PaginatedRuns> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<PaginatedRuns>>(
        `${this.baseUrl}/flows/${flowId}/runs`,
        { params: { page, limit } },
      ),
    );
    return res.data;
  }

  async getRun(runId: string): Promise<Run> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Run>>(`${this.baseUrl}/runs/${runId}`),
    );
    return res.data;
  }

  async cancelRun(runId: string): Promise<Run> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Run>>(`${this.baseUrl}/runs/${runId}/cancel`, {}),
    );
    return res.data;
  }

  // --- Webhooks ---

  async getWebhookInfo(flowId: string): Promise<{ flowId: string; webhookUrl: string; status: string }> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<{ flowId: string; webhookUrl: string; status: string }>>(
        `${this.baseUrl}/webhooks/${flowId}`,
      ),
    );
    return res.data;
  }
}
