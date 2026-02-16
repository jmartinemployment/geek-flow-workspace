import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  FlowDashboardComponent,
  FlowBuilderComponent,
} from 'geek-flow-library';

(async () => {
  const appRef = await createApplication({
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(),
    ],
  });

  const dashboardElement = createCustomElement(FlowDashboardComponent, {
    injector: appRef.injector,
  });
  customElements.define('geek-flow-dashboard', dashboardElement);

  const builderElement = createCustomElement(FlowBuilderComponent, {
    injector: appRef.injector,
  });
  customElements.define('geek-flow-builder', builderElement);
})();
