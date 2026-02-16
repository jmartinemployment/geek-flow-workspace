import { Component, ChangeDetectionStrategy, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VariablePickerComponent } from '../variable-picker/variable-picker.component';
import type { Step } from '../../models/flow.model';

@Component({
  selector: 'gf-step-config',
  templateUrl: './step-config.component.html',
  styleUrl: './step-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  imports: [FormsModule, VariablePickerComponent],
})
export class StepConfigComponent {
  readonly step = input.required<Step>();
  readonly allSteps = input<Step[]>([]);
  readonly stepUpdated = output<{ stepId: string; config: Record<string, unknown> }>();
  readonly stepDeleted = output<string>();

  readonly configJson = signal('');
  readonly activeField = signal<string | null>(null);

  constructor() {
    effect(() => {
      const s = this.step();
      this.configJson.set(JSON.stringify(s.config, null, 2));
    });
  }

  onConfigChange(value: string): void {
    this.configJson.set(value);
  }

  saveConfig(): void {
    try {
      const config = JSON.parse(this.configJson()) as Record<string, unknown>;
      this.stepUpdated.emit({ stepId: this.step().id, config });
    } catch {
      // Invalid JSON — ignore
    }
  }

  deleteStep(): void {
    this.stepDeleted.emit(this.step().id);
  }

  insertVariable(variable: string): void {
    const current = this.configJson();
    this.configJson.set(current + variable);
  }
}
