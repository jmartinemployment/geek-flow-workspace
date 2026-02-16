import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import type { Step } from '../../models/flow.model';
import type { CanvasNode } from '../../models/flow.model';

@Component({
  selector: '[gfNode]',
  templateUrl: './node-renderer.component.html',
  styleUrl: './node-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class NodeRendererComponent {
  readonly step = input.required<Step>();
  readonly position = input.required<CanvasNode>();
  readonly isSelected = input(false);

  readonly nodeSelected = output<string>();
  readonly nodeMoved = output<{ stepId: string; x: number; y: number }>();

  readonly nodeColor = computed(() => {
    switch (this.step().type) {
      case 'TRIGGER': return '#28a745';
      case 'ACTION': return '#007bff';
      case 'CONDITION': return '#ffc107';
      case 'DELAY': return '#fd7e14';
      case 'TRANSFORM': return '#6f42c1';
      default: return '#6c757d';
    }
  });

  readonly nodeLabel = computed(() => {
    const s = this.step();
    return s.action ? `${s.adapter}.${s.action}` : s.adapter;
  });

  onSelect(): void {
    this.nodeSelected.emit(this.step().id);
  }
}
