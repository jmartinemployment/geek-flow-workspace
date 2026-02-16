
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Always use separate `.html` and `.scss` files for templates and styles — no inline templates or styles
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

---

# Geek-Flow — Visual Workflow Builder for SMB Owners

## Project Overview

SaaS product that lets non-technical small business owners visually build workflow automations via drag-and-drop. "If X happens, do Y, then Z" — without writing code. Built as Angular Elements on WordPress + Express backend.

## Workspace Structure

```
geek-flow-workspace/
  projects/
    geek-flow-library/          # Angular library — components, services, models
      src/
        public-api.ts           # Library entry point
        lib/
          models/               # TypeScript interfaces
          services/             # API service
          components/           # UI components
    geek-flow-elements/         # Angular Elements app — registers custom elements
      src/main.ts               # Registers <geek-flow-dashboard>, <geek-flow-builder>
    geek-flow-backend/          # Express + TypeScript backend
      prisma/schema.prisma      # Database schema
      src/
        server.ts               # Express entry point (port 3200)
        config/                 # Environment, logger, database
        engine/                 # Execution engine, scheduler, context
        integrations/           # Adapter framework (webhook, email, slack)
        routes/                 # API route handlers
        middleware/             # Error handler
        utils/                  # Error helpers, response helpers
```

## Component Inventory

| Custom Element Tag | Component | Directory |
|---|---|---|
| `<geek-flow-dashboard>` | `FlowDashboardComponent` | `geek-flow-library/src/lib/components/flow-dashboard/` |
| `<geek-flow-builder>` | `FlowBuilderComponent` | `geek-flow-library/src/lib/components/flow-builder/` |
| (internal) | `RunHistoryComponent` | `geek-flow-library/src/lib/components/run-history/` |
| (internal) | `NodeRendererComponent` | `geek-flow-library/src/lib/components/node-renderer/` |
| (internal) | `ConnectionLineComponent` | `geek-flow-library/src/lib/components/connection-line/` |
| (internal) | `StepPaletteComponent` | `geek-flow-library/src/lib/components/step-palette/` |
| (internal) | `StepConfigComponent` | `geek-flow-library/src/lib/components/step-config/` |
| (internal) | `VariablePickerComponent` | `geek-flow-library/src/lib/components/variable-picker/` |

## Service Inventory

| Service | Location | Purpose |
|---|---|---|
| `GeekFlowApiService` | `geek-flow-library/src/lib/services/` | HTTP client for all backend endpoints |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/flows` | Create a new flow |
| `GET` | `/api/flows` | List user's flows |
| `GET` | `/api/flows/:id` | Get flow with steps + canvas layout |
| `PUT` | `/api/flows/:id` | Update flow |
| `DELETE` | `/api/flows/:id` | Delete flow (cascade) |
| `POST` | `/api/flows/:id/activate` | Validate and activate flow |
| `POST` | `/api/flows/:id/pause` | Pause active flow |
| `POST` | `/api/flows/:id/duplicate` | Clone flow + steps |
| `POST` | `/api/flows/:flowId/steps` | Add step to flow |
| `PUT` | `/api/flows/:flowId/steps/:stepId` | Update step config |
| `DELETE` | `/api/flows/:flowId/steps/:stepId` | Remove step |
| `PUT` | `/api/flows/:flowId/steps/reorder` | Batch reorder steps |
| `POST` | `/api/flows/:id/test` | Test run flow |
| `GET` | `/api/flows/:id/runs` | Paginated run history |
| `GET` | `/api/runs/:id` | Run detail with logs |
| `POST` | `/api/runs/:id/cancel` | Cancel running flow |
| `POST` | `/api/webhooks/:flowId` | Inbound webhook trigger (public) |
| `GET` | `/api/webhooks/:flowId` | Webhook URL + config info |

## Build Commands

```bash
# Library
ng build geek-flow-library

# Elements app (produces main.js + styles.css)
ng build geek-flow-elements

# Backend
cd projects/geek-flow-backend
npm run dev          # Development with hot reload
npm run build        # TypeScript compilation
npm run lint         # ESLint check
npx prisma generate  # Regenerate Prisma client
npx prisma migrate dev  # Run migrations
```

## Environment Variables (Backend)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3200) |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `DIRECT_URL` | Direct connection (bypasses pooler) |
| `ANTHROPIC_API_KEY` | Claude API key for AI flow generation |
| `CORS_ORIGIN` | Allowed origin (default: geekatyourspot.com) |
| `SENDGRID_API_KEY` | SendGrid API key for email adapter |
| `SLACK_BOT_TOKEN` | Slack bot token for Slack adapter |

## Database Models (Prisma)

- **User** — Registered users with plan tier
- **Flow** — Workflow definitions with trigger config, steps, canvas layout
- **Step** — Individual steps within a flow (trigger, action, condition, delay, transform)
- **Run** — Execution records (PENDING → RUNNING → COMPLETED/FAILED/CANCELLED)
- **RunLog** — Per-step execution logs with input/output/duration
- **UserIntegration** — Connected third-party accounts (OAuth tokens, API keys)

## Key Decisions

- **SVG canvas over HTML5 Canvas:** DOM-based = accessible, styleable, debuggable. Adequate perf for <100 nodes.
- **In-process execution (Phase 1):** No BullMQ/Redis yet — use direct executeFlow() calls. Queue in Phase 2.
- **node-cron for scheduling:** Lightweight scheduler for cron-triggered flows.
- **Adapter pattern:** Each integration implements `execute(config, context)` — easy to add new ones.
- **Template variables `{{step.field}}`:** Familiar Handlebars-like syntax for non-technical users.
- **Build deps in `dependencies`:** typescript, @types/*, prisma in dependencies (not devDependencies) for Render compatibility.

## Session Notes

**February 16, 2026 (Session 1):**
- Phase 1 implementation complete (all 15 steps, 7 commits worth of code)
- Created: Angular library (`geek-flow-library`) with 8 components, 3 models, 1 service
- Created: Angular Elements app (`geek-flow-elements`) registering `<geek-flow-dashboard>` and `<geek-flow-builder>`
- Created: Express backend (`geek-flow-backend`) with Prisma schema (6 models, 4 enums), 5 route files, execution engine, 3 adapters
- Fixed: tsconfig paths pointing to library source (not dist)
- Fixed: outputHashing set to "none" for predictable filenames
- Fixed: Prisma JSON type compatibility — recursive Zod type with `Prisma.InputJsonValue`, `Prisma.JsonNull` for nullable fields
- Fixed: HttpClient params type error — explicit `Record<string, string>` instead of conditional spread
- Fixed: FlowBuilderComponent auto-loads flow via `effect()` when `flowId` input changes
- Decision: Project names `geek-flow-library` / `geek-flow-elements` / `geek-flow-backend` (prefix `gf`)
- Decision: Separate `.html` and `.scss` files for all components (no inline templates)
- Verification: `ng build geek-flow-library` ✓, `ng build geek-flow-elements` ✓ (215 kB main.js, unhashed), backend `npm run build` ✓, `npm run lint` ✓
- Next: Create git commits, deploy backend to Render, set up Supabase DB, WordPress integration

**February 16, 2026 (Session 2):**
- Supabase database setup complete
- Supabase project: `geek-flow` (project ref: `djgkvqwlvbxclkwntumy`, region: us-east-1)
- Supabase URL: `https://djgkvqwlvbxclkwntumy.supabase.co`
- Created: `.env` with DATABASE_URL (pooler, port 6543) and DIRECT_URL (direct, port 5432)
- Ran: `npx prisma migrate dev --name init` — migration `20260216204354_init` applied successfully
- Created: 6 tables (users, flows, steps, runs, run_logs, user_integrations) + 4 enums (Plan, FlowStatus, StepType, RunStatus)
- Generated: Prisma Client to `src/generated/prisma/`
- Fixed: `.gitignore` — added `.env*`, `src/generated/` to prevent committing secrets and generated files
- Verification: `npx prisma migrate status` confirms "Database schema is up to date!"
- Next: Deploy backend to Render (needs DATABASE_URL env var), WordPress integration (page template + FTP upload)
