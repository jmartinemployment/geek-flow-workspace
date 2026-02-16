import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: '[gfConnection]',
  templateUrl: './connection-line.component.html',
  styleUrl: './connection-line.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class ConnectionLineComponent {
  readonly fromX = input.required<number>();
  readonly fromY = input.required<number>();
  readonly toX = input.required<number>();
  readonly toY = input.required<number>();

  readonly pathData = computed(() => {
    const fx = this.fromX() + 90; // center of node (180/2)
    const fy = this.fromY() + 60; // bottom of source node
    const tx = this.toX() + 90;   // center of target node
    const ty = this.toY();        // top of target node

    const midY = (fy + ty) / 2;

    return `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
  });
}
