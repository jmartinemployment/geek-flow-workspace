import { Component, ChangeDetectionStrategy, signal, computed, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeekFlowApiService } from '../../services/geek-flow-api.service';
import { RunHistoryComponent } from '../run-history/run-history.component';
import type { FlowSummary } from '../../models/flow.model';

@Component({
  selector: 'gf-flow-dashboard',
  templateUrl: './flow-dashboard.component.html',
  styleUrl: './flow-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  imports: [FormsModule, RunHistoryComponent],
})
export class FlowDashboardComponent {
  private readonly api = inject(GeekFlowApiService);

  readonly flows = signal<FlowSummary[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedFlowId = signal<string | null>(null);
  readonly newFlowName = signal('');
  readonly showCreateForm = signal(false);

  readonly flowOpened = output<string>();

  readonly selectedFlow = computed(() => {
    const id = this.selectedFlowId();
    return this.flows().find((f) => f.id === id) ?? null;
  });

  readonly activeCount = computed(() =>
    this.flows().filter((f) => f.status === 'ACTIVE').length,
  );

  constructor() {
    this.loadFlows();
  }

  async loadFlows(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const flows = await this.api.getFlows();
      this.flows.set(flows);
    } catch {
      this.error.set('Failed to load flows');
    } finally {
      this.isLoading.set(false);
    }
  }

  async createFlow(): Promise<void> {
    const name = this.newFlowName().trim();
    if (!name) return;

    try {
      const flow = await this.api.createFlow('default-user', name);
      this.newFlowName.set('');
      this.showCreateForm.set(false);
      await this.loadFlows();
      this.flowOpened.emit(flow.id);
    } catch {
      this.error.set('Failed to create flow');
    }
  }

  openFlow(flowId: string): void {
    this.flowOpened.emit(flowId);
  }

  selectFlow(flowId: string): void {
    this.selectedFlowId.set(
      this.selectedFlowId() === flowId ? null : flowId,
    );
  }

  async toggleFlowStatus(flow: FlowSummary): Promise<void> {
    try {
      if (flow.status === 'ACTIVE') {
        await this.api.pauseFlow(flow.id);
      } else {
        await this.api.activateFlow(flow.id);
      }
      await this.loadFlows();
    } catch {
      this.error.set('Failed to update flow status');
    }
  }

  async deleteFlow(flowId: string): Promise<void> {
    try {
      await this.api.deleteFlow(flowId);
      if (this.selectedFlowId() === flowId) {
        this.selectedFlowId.set(null);
      }
      await this.loadFlows();
    } catch {
      this.error.set('Failed to delete flow');
    }
  }

  async duplicateFlow(flowId: string): Promise<void> {
    try {
      await this.api.duplicateFlow(flowId);
      await this.loadFlows();
    } catch {
      this.error.set('Failed to duplicate flow');
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge bg-success';
      case 'PAUSED': return 'badge bg-warning text-dark';
      case 'ERROR': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
