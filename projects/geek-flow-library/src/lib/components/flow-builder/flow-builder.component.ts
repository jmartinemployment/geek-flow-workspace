import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  input,
  effect,
  ElementRef,
  viewChild,
} from '@angular/core';
import { GeekFlowApiService } from '../../services/geek-flow-api.service';
import { NodeRendererComponent } from '../node-renderer/node-renderer.component';
import { ConnectionLineComponent } from '../connection-line/connection-line.component';
import { StepPaletteComponent } from '../step-palette/step-palette.component';
import { StepConfigComponent } from '../step-config/step-config.component';
import type { Flow, Step, CanvasNode, CanvasLayout, Connection } from '../../models/flow.model';
import type { StepTemplate } from '../../models/integration.model';

@Component({
  selector: 'gf-flow-builder',
  templateUrl: './flow-builder.component.html',
  styleUrl: './flow-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  imports: [
    NodeRendererComponent,
    ConnectionLineComponent,
    StepPaletteComponent,
    StepConfigComponent,
  ],
})
export class FlowBuilderComponent {
  private readonly api = inject(GeekFlowApiService);

  readonly flowId = input<string>('');
  readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('canvasSvg');

  readonly flow = signal<Flow | null>(null);
  readonly steps = signal<Step[]>([]);
  readonly connections = signal<Connection[]>([]);
  readonly canvasLayout = signal<CanvasLayout>({
    nodes: [],
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  readonly selectedStepId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isSaving = signal(false);

  readonly selectedStep = computed(() => {
    const id = this.selectedStepId();
    return this.steps().find((s) => s.id === id) ?? null;
  });

  readonly nodePositions = computed<Map<string, CanvasNode>>(() => {
    const layout = this.canvasLayout();
    const map = new Map<string, CanvasNode>();
    for (const node of layout.nodes) {
      map.set(node.stepId, node);
    }
    // Auto-position any steps without a canvas position
    const stepsArr = this.steps();
    for (let i = 0; i < stepsArr.length; i++) {
      if (!map.has(stepsArr[i].id)) {
        map.set(stepsArr[i].id, { stepId: stepsArr[i].id, x: 100, y: 50 + i * 100 });
      }
    }
    return map;
  });

  readonly connectionPairs = computed(() => {
    const positions = this.nodePositions();
    return this.connections().map((conn) => ({
      from: positions.get(conn.fromStepId),
      to: positions.get(conn.toStepId),
    })).filter((pair): pair is { from: CanvasNode; to: CanvasNode } =>
      pair.from !== undefined && pair.to !== undefined,
    );
  });

  readonly viewBox = computed(() => {
    const layout = this.canvasLayout();
    return `${-layout.panX} ${-layout.panY} ${1200 / layout.zoom} ${800 / layout.zoom}`;
  });

  constructor() {
    effect(() => {
      const id = this.flowId();
      if (id) {
        this.loadFlow();
      }
    });
  }

  async loadFlow(): Promise<void> {
    const id = this.flowId();
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const flow = await this.api.getFlow(id);
      this.flow.set(flow);
      this.steps.set(flow.steps);
      this.connections.set((flow.connections ?? []) as Connection[]);
      if (flow.canvasLayout) {
        this.canvasLayout.set(flow.canvasLayout as CanvasLayout);
      }
    } catch {
      this.error.set('Failed to load flow');
    } finally {
      this.isLoading.set(false);
    }
  }

  selectStep(stepId: string): void {
    this.selectedStepId.set(
      this.selectedStepId() === stepId ? null : stepId,
    );
  }

  async addStepFromTemplate(template: StepTemplate): Promise<void> {
    const fId = this.flowId();
    if (!fId) return;

    try {
      const step = await this.api.addStep(fId, {
        type: template.type,
        adapter: template.adapter,
        action: template.action,
        config: template.defaultConfig,
      });
      this.steps.update((s) => [...s, step]);

      // Auto-connect to previous step
      const stepsArr = this.steps();
      if (stepsArr.length > 1) {
        const prevStep = stepsArr.at(-2);
        if (prevStep) {
          this.connections.update((c) => [
            ...c,
            { fromStepId: prevStep.id, toStepId: step.id },
          ]);
        }
      }

      this.selectedStepId.set(step.id);
    } catch {
      this.error.set('Failed to add step');
    }
  }

  async updateStepConfig(event: { stepId: string; config: Record<string, unknown> }): Promise<void> {
    const fId = this.flowId();
    if (!fId) return;

    try {
      const updated = await this.api.updateStep(fId, event.stepId, { config: event.config });
      this.steps.update((stepsArr) =>
        stepsArr.map((s) => (s.id === event.stepId ? updated : s)),
      );
    } catch {
      this.error.set('Failed to update step');
    }
  }

  async deleteStep(stepId: string): Promise<void> {
    const fId = this.flowId();
    if (!fId) return;

    try {
      await this.api.deleteStep(fId, stepId);
      this.steps.update((s) => s.filter((step) => step.id !== stepId));
      this.connections.update((c) =>
        c.filter((conn) => conn.fromStepId !== stepId && conn.toStepId !== stepId),
      );
      if (this.selectedStepId() === stepId) {
        this.selectedStepId.set(null);
      }
    } catch {
      this.error.set('Failed to delete step');
    }
  }

  async save(): Promise<void> {
    const fId = this.flowId();
    if (!fId) return;

    this.isSaving.set(true);
    try {
      const layout = this.canvasLayout();
      // Sync current node positions
      const nodes = [...this.nodePositions().values()];
      const updatedLayout: CanvasLayout = { ...layout, nodes };

      await this.api.updateFlow(fId, {
        connections: this.connections(),
        canvasLayout: updatedLayout,
      });

      this.canvasLayout.set(updatedLayout);
    } catch {
      this.error.set('Failed to save flow');
    } finally {
      this.isSaving.set(false);
    }
  }

  getNodePosition(stepId: string): CanvasNode {
    return this.nodePositions().get(stepId) ?? { stepId, x: 0, y: 0 };
  }

  onCanvasWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.canvasLayout.update((layout) => ({
      ...layout,
      zoom: Math.max(0.25, Math.min(3, layout.zoom * delta)),
    }));
  }
}
