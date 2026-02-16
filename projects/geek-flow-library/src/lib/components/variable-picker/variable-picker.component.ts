import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import type { Step } from '../../models/flow.model';

interface Variable {
  label: string;
  value: string;
}

@Component({
  selector: 'gf-variable-picker',
  templateUrl: './variable-picker.component.html',
  styleUrl: './variable-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class VariablePickerComponent {
  readonly steps = input<Step[]>([]);
  readonly currentStepId = input<string>('');

  readonly variableSelected = output<string>();

  readonly variables = computed<Variable[]>(() => {
    const vars: Variable[] = [
      { label: 'Trigger: body', value: '{{trigger.body}}' },
      { label: 'Trigger: source', value: '{{trigger.source}}' },
    ];

    const current = this.currentStepId();
    for (const step of this.steps()) {
      if (step.id === current) break;

      const prefix = step.id;
      vars.push(
        { label: `${step.adapter}.${step.action}: output`, value: `{{${prefix}.output}}` },
        { label: `${step.adapter}.${step.action}: status`, value: `{{${prefix}.status}}` },
      );
    }

    return vars;
  });

  select(variable: Variable): void {
    this.variableSelected.emit(variable.value);
  }
}
