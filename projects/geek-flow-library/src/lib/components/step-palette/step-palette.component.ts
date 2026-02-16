import { Component, ChangeDetectionStrategy, signal, computed, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { StepTemplate } from '../../models/integration.model';
import type { StepType } from '../../models/flow.model';

const STEP_TEMPLATES: StepTemplate[] = [
  { type: 'TRIGGER', adapter: 'webhook', action: 'receive', label: 'Webhook Received', icon: '🔗', color: '#28a745', defaultConfig: {} },
  { type: 'TRIGGER', adapter: 'schedule', action: 'cron', label: 'Schedule (Cron)', icon: '⏰', color: '#28a745', defaultConfig: { cron: '0 9 * * 1' } },
  { type: 'ACTION', adapter: 'webhook', action: 'send', label: 'HTTP Request', icon: '🌐', color: '#007bff', defaultConfig: { url: '', method: 'POST' } },
  { type: 'ACTION', adapter: 'email', action: 'send_email', label: 'Send Email', icon: '📧', color: '#007bff', defaultConfig: { to: '', subject: '', body: '' } },
  { type: 'ACTION', adapter: 'slack', action: 'post_message', label: 'Slack Message', icon: '💬', color: '#007bff', defaultConfig: { channel: '', text: '' } },
];

@Component({
  selector: 'gf-step-palette',
  templateUrl: './step-palette.component.html',
  styleUrl: './step-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  imports: [FormsModule],
})
export class StepPaletteComponent {
  readonly searchQuery = signal('');
  readonly stepAdded = output<StepTemplate>();

  readonly triggers = computed(() =>
    this.filterByType('TRIGGER'),
  );

  readonly actions = computed(() =>
    this.filterByType('ACTION'),
  );

  addStep(template: StepTemplate): void {
    this.stepAdded.emit(template);
  }

  private filterByType(type: StepType): StepTemplate[] {
    const query = this.searchQuery().toLowerCase();
    return STEP_TEMPLATES.filter(
      (t) => t.type === type && (query === '' || t.label.toLowerCase().includes(query)),
    );
  }
}
