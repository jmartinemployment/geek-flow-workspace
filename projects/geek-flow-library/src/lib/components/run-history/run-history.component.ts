import { Component, ChangeDetectionStrategy, signal, inject, input, effect } from '@angular/core';
import { GeekFlowApiService } from '../../services/geek-flow-api.service';
import type { RunSummary } from '../../models/execution.model';

@Component({
  selector: 'gf-run-history',
  templateUrl: './run-history.component.html',
  styleUrl: './run-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class RunHistoryComponent {
  private readonly api = inject(GeekFlowApiService);

  readonly flowId = input.required<string>();
  readonly runs = signal<RunSummary[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly isLoading = signal(false);

  constructor() {
    effect(() => {
      const id = this.flowId();
      if (id) {
        this.page.set(1);
        this.loadRuns(id);
      }
    });
  }

  async loadRuns(flowId?: string): Promise<void> {
    const id = flowId ?? this.flowId();
    this.isLoading.set(true);
    try {
      const result = await this.api.getFlowRuns(id, this.page(), 10);
      this.runs.set(result.runs);
      this.total.set(result.total);
    } catch {
      this.runs.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  nextPage(): void {
    this.page.update((p) => p + 1);
    this.loadRuns();
  }

  prevPage(): void {
    this.page.update((p) => Math.max(1, p - 1));
    this.loadRuns();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge bg-success';
      case 'FAILED': return 'badge bg-danger';
      case 'RUNNING': return 'badge bg-info';
      case 'CANCELLED': return 'badge bg-secondary';
      default: return 'badge bg-warning text-dark';
    }
  }
}
