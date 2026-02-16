# FlowGeek — Visual Workflow Builder for SMB Owners

## Product Vision

A drag-and-drop workflow automation platform built for non-technical small business owners. FlowGeek lets users visually connect triggers and actions — "If X happens, do Y, then Z" — without writing code. AI analyzes their current manual processes and suggests ready-made automations.

**Tagline:** "Stop doing it manually. Let FlowGeek handle it."

**Target Users:** Small business owners in Broward and Palm Beach County (Geek At Your Spot clients), expanding to general SMB market.

---

## Core User Story

> "When a customer fills out my contact form, I want to automatically create a CRM record, send them a welcome email, notify my team on Slack, and schedule a follow-up call in 3 days — all without me touching anything."

---

## Product Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    WordPress Frontend                    │
│              (Angular Elements on geekatyourspot.com)    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Flow Builder  │  │  Dashboard   │  │  AI Suggest   │  │
│  │  (drag/drop)  │  │ (run history)│  │  (describe &  │  │
│  │              │  │              │  │   generate)   │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────┐
│               FlowGeek Backend (Express + TS)            │
│                      Port 3200                           │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │  Flow API   │ │ Execution  │ │  Integration Engine  │ │
│  │ (CRUD flows)│ │  Engine    │ │  (adapters for each  │ │
│  │            │ │ (run steps)│ │   3rd-party service) │ │
│  └────────────┘ └────────────┘ └──────────────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │  Webhook   │ │  Scheduler │ │  AI Flow Generator   │ │
│  │  Receiver  │ │  (cron)    │ │  (Claude API)        │ │
│  └────────────┘ └────────────┘ └──────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Supabase PostgreSQL                         │
│  flows, steps, runs, run_logs, integrations, users      │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Angular 21 + Angular Elements | Standalone components, signals, OnPush |
| Visual Builder | Custom Angular canvas (SVG-based) | Drag-and-drop nodes + connections |
| CSS | Bootstrap 5.3.8 SCSS | Consistent with other Geek projects |
| Backend | Express.js + TypeScript | Port 3200, registered with ControllerBackend |
| Database | PostgreSQL via Supabase + Prisma | Same Supabase project as other services |
| AI | Claude API (Sonnet 4+) | Flow suggestion, natural language → flow |
| Job Queue | BullMQ + Redis (Render Redis) | Async flow execution, retries, scheduling |
| Hosting (FE) | WordPress (geekatyourspot.com) | Angular Elements via FTP |
| Hosting (BE) | Render.com | Auto-deploy from GitHub main |

---

## Workspace Structure

```
FlowGeek-Workspace/
  projects/
    flowgeek-library/                # Angular library
      src/
        public-api.ts
        lib/
          models/
            flow.model.ts            # Flow, Step, Connection interfaces
            integration.model.ts     # Integration adapter types
            execution.model.ts       # Run, RunLog interfaces
          services/
            flowgeek-api.service.ts   # HTTP client for backend
          components/
            flow-builder/             # Visual drag-and-drop canvas
            flow-dashboard/           # List of user's flows + run history
            step-palette/             # Sidebar of available triggers/actions
            step-config/              # Config panel for selected step
            run-history/              # Execution log viewer
            ai-suggest/               # "Describe your process" AI panel
            integration-picker/       # Connect 3rd-party accounts
            node-renderer/            # Individual node on canvas (internal)
            connection-line/          # SVG line between nodes (internal)

    flowgeek-elements/               # Angular Elements app
      src/main.ts                    # Registers <flowgeek-builder>, <flowgeek-dashboard>

    flowgeek-backend/                # Express + TypeScript backend
      prisma/schema.prisma
      src/
        server.ts                    # Express entry (port 3200)
        config/
          environment.ts
          logger.ts
          database.ts
        routes/
          flow.routes.ts             # CRUD for flows
          execution.routes.ts        # Trigger runs, view history
          integration.routes.ts      # OAuth connect/disconnect
          webhook.routes.ts          # Inbound webhook receiver
          ai.routes.ts               # AI flow suggestion
        engine/
          executor.ts                # Step-by-step flow runner
          scheduler.ts               # Cron-based trigger scheduling
          context.ts                 # Runtime context (data passing between steps)
        integrations/
          base-adapter.ts            # Abstract adapter interface
          adapters/
            email.adapter.ts         # SMTP / SendGrid / Mailgun
            slack.adapter.ts         # Slack Web API
            google-sheets.adapter.ts # Google Sheets API
            google-calendar.adapter.ts
            stripe.adapter.ts        # Stripe webhooks + API
            webhook.adapter.ts       # Generic inbound/outbound webhooks
            crm.adapter.ts           # Internal CRM (Geek projects)
            sms.adapter.ts           # Twilio SMS
            form.adapter.ts          # Form submission trigger
        ai/
          flow-generator.ts          # Claude API: natural language → flow JSON
          process-analyzer.ts        # Claude API: analyze manual process description
          suggestion-engine.ts       # Recommend automations based on usage
        middleware/
          error-handler.ts
          auth.middleware.ts
        utils/
          errors.ts
          response.ts
```

---

## Database Schema (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  plan          Plan     @default(FREE)
  flowLimit     Int      @default(5)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  flows         Flow[]
  integrations  UserIntegration[]
}

enum Plan {
  FREE
  STARTER
  PRO
}

model Flow {
  id            String     @id @default(cuid())
  userId        String
  user          User       @relation(fields: [userId], references: [id])
  name          String
  description   String?
  status        FlowStatus @default(DRAFT)
  trigger       Json       // Trigger config (type, params)
  steps         Step[]
  connections   Json       // Array of { fromStepId, toStepId, condition? }
  canvasLayout  Json?      // Node positions for visual builder
  schedule      String?    // Cron expression if scheduled trigger
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  runs          Run[]
}

enum FlowStatus {
  DRAFT
  ACTIVE
  PAUSED
  ERROR
}

model Step {
  id            String   @id @default(cuid())
  flowId        String
  flow          Flow     @relation(fields: [flowId], references: [id], onDelete: Cascade)
  order         Int
  type          StepType
  adapter       String   // e.g., "email", "slack", "google-sheets"
  action        String   // e.g., "send_email", "post_message", "add_row"
  config        Json     // Adapter-specific configuration
  inputMapping  Json?    // Maps data from previous steps: { "to": "{{trigger.email}}" }
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum StepType {
  TRIGGER
  ACTION
  CONDITION
  DELAY
  TRANSFORM
}

model Run {
  id            String    @id @default(cuid())
  flowId        String
  flow          Flow      @relation(fields: [flowId], references: [id])
  status        RunStatus @default(PENDING)
  triggerData   Json?     // Data that started the run
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
  error         String?
  logs          RunLog[]
}

enum RunStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

model RunLog {
  id            String   @id @default(cuid())
  runId         String
  run           Run      @relation(fields: [runId], references: [id], onDelete: Cascade)
  stepId        String
  status        String   // "started", "completed", "failed", "skipped"
  input         Json?
  output        Json?
  error         String?
  duration      Int?     // milliseconds
  createdAt     DateTime @default(now())
}

model UserIntegration {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  adapter       String   // "slack", "google", "stripe", etc.
  credentials   Json     // Encrypted OAuth tokens or API keys
  metadata      Json?    // Account name, workspace, etc.
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, adapter])
}
```

---

## API Endpoints

### Flows

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/flows` | Create a new flow |
| `GET` | `/api/flows` | List user's flows (with status, last run) |
| `GET` | `/api/flows/:id` | Get flow with steps and canvas layout |
| `PUT` | `/api/flows/:id` | Update flow (steps, connections, config) |
| `DELETE` | `/api/flows/:id` | Delete flow and all runs |
| `POST` | `/api/flows/:id/activate` | Set flow to ACTIVE (validates steps) |
| `POST` | `/api/flows/:id/pause` | Pause an active flow |
| `POST` | `/api/flows/:id/duplicate` | Clone a flow |

### Execution

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/flows/:id/test` | Run flow once with sample data |
| `GET` | `/api/flows/:id/runs` | Paginated run history |
| `GET` | `/api/runs/:id` | Run detail with step-by-step logs |
| `POST` | `/api/runs/:id/cancel` | Cancel a running flow |

### Webhooks (Triggers)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/:flowId` | Inbound webhook trigger (public) |
| `GET` | `/api/webhooks/:flowId` | Webhook URL + config info |

### Integrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/integrations` | List available integrations |
| `GET` | `/api/integrations/connected` | User's connected accounts |
| `GET` | `/api/integrations/:adapter/auth` | Start OAuth flow |
| `GET` | `/api/integrations/:adapter/callback` | OAuth callback |
| `DELETE` | `/api/integrations/:adapter` | Disconnect integration |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/suggest` | Describe process → get flow suggestion |
| `POST` | `/api/ai/improve/:flowId` | AI reviews flow and suggests improvements |
| `GET` | `/api/ai/templates` | Pre-built flow templates |

---

## Visual Flow Builder — Design Spec

### Canvas

- SVG-based canvas with pan (mouse drag on empty space) and zoom (scroll wheel)
- Grid snapping for clean alignment (16px grid)
- Minimap in bottom-right corner for large flows

### Nodes

Each node is a rounded rectangle rendered on the canvas:

```
┌─────────────────────────┐
│ ⚡ Form Submitted       │  ← Trigger node (green accent)
│ Contact form on website │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│ 📋 Create CRM Record    │  ← Action node (blue accent)
│ Name, email, phone      │
└──────────┬──────────────┘
           │
     ┌─────┴─────┐
     │  Is VIP?   │           ← Condition node (yellow accent, diamond)
     └──┬─────┬──┘
    Yes │     │ No
        ▼     ▼
   [Send VIP  [Send Standard
    Welcome]   Welcome]
```

- **Trigger nodes** (green): Form submission, webhook, schedule, new email, Stripe payment
- **Action nodes** (blue): Send email, Slack message, create record, update sheet, send SMS
- **Condition nodes** (yellow): If/else branching based on data values
- **Delay nodes** (orange): Wait X minutes/hours/days before continuing
- **Transform nodes** (purple): Format data, extract fields, merge values

### Step Palette (Left Sidebar)

Categorized list of available triggers and actions, searchable:

```
TRIGGERS
  📋 Form Submission
  🔗 Webhook Received
  ⏰ Schedule (cron)
  💳 Stripe Payment
  📧 New Email Received

ACTIONS
  📧 Send Email
  💬 Slack Message
  📋 Create CRM Record
  📊 Add Google Sheet Row
  📅 Create Calendar Event
  📱 Send SMS
  🔗 HTTP Request (advanced)

LOGIC
  🔀 If/Else Condition
  ⏳ Delay / Wait
  🔄 Transform Data
  🛑 Stop Flow
```

### Step Config Panel (Right Sidebar)

When a node is selected, the right panel shows its configuration form:

- **Trigger config:** Which form, which webhook URL, cron schedule picker
- **Action config:** Template fields with variable insertion (`{{trigger.email}}`, `{{step_2.output.id}}`)
- **Condition config:** Field picker + operator (equals, contains, greater than) + value
- **Data mapping:** Visual dropdown to map output from previous steps into current step's inputs

### Variable Insertion UX

When configuring a step, the user types `{{` to get a dropdown of available variables from previous steps:

```
{{trigger.name}}          ← from the trigger event
{{trigger.email}}
{{step_create_crm.id}}    ← output from "Create CRM Record" step
{{step_create_crm.url}}
```

This is the key usability feature — no coding, just point-and-click data mapping.

---

## Execution Engine — Design Spec

### Flow Execution Lifecycle

```
1. TRIGGER fires (webhook, schedule, manual test)
2. Engine creates a Run record (status: PENDING)
3. Engine resolves trigger data into context object
4. For each step in topological order:
   a. Resolve inputMapping (replace {{variables}} with actual data)
   b. Call the appropriate adapter
   c. Log result to RunLog (input, output, duration)
   d. Add output to context for downstream steps
   e. If CONDITION: evaluate and choose branch
   f. If DELAY: schedule continuation via BullMQ delayed job
   g. If step fails: retry up to 3 times with exponential backoff
5. Mark Run as COMPLETED or FAILED
```

### Context Object

Each run maintains a context object that accumulates data as steps execute:

```typescript
interface ExecutionContext {
  trigger: Record<string, unknown>;    // Trigger event data
  steps: Record<string, {              // Keyed by step ID
    output: Record<string, unknown>;
    status: 'completed' | 'failed' | 'skipped';
    duration: number;
  }>;
  variables: Record<string, unknown>;  // User-defined variables
}
```

### Retry & Error Handling

- Each step retries up to 3 times with exponential backoff (1s, 4s, 16s)
- If all retries fail, the step is marked FAILED
- Flow can be configured to: stop on error (default), skip failed step, or use fallback value
- Users receive email notification on flow failure (configurable)

---

## AI Flow Generator — Design Spec

### "Describe Your Process" Feature

The user types a natural language description of their manual workflow:

> "When someone fills out the contact form on my website, I copy their info into a Google Sheet, send them a welcome email with our service brochure, post in our #new-leads Slack channel, and set a reminder to call them in 2 days."

Claude API analyzes this and returns a structured flow:

```json
{
  "name": "New Lead Processing",
  "description": "Automates new contact form submissions",
  "trigger": {
    "type": "TRIGGER",
    "adapter": "form",
    "action": "form_submitted",
    "config": { "formId": "contact-form" }
  },
  "steps": [
    {
      "type": "ACTION",
      "adapter": "google-sheets",
      "action": "add_row",
      "config": {
        "spreadsheetId": "{{select}}",
        "values": {
          "Name": "{{trigger.name}}",
          "Email": "{{trigger.email}}",
          "Phone": "{{trigger.phone}}"
        }
      }
    },
    {
      "type": "ACTION",
      "adapter": "email",
      "action": "send_email",
      "config": {
        "to": "{{trigger.email}}",
        "subject": "Welcome to [Your Business]!",
        "body": "AI-generated welcome template with brochure link"
      }
    },
    {
      "type": "ACTION",
      "adapter": "slack",
      "action": "post_message",
      "config": {
        "channel": "#new-leads",
        "text": "New lead: {{trigger.name}} ({{trigger.email}})"
      }
    },
    {
      "type": "DELAY",
      "config": { "duration": 2, "unit": "days" }
    },
    {
      "type": "ACTION",
      "adapter": "google-calendar",
      "action": "create_event",
      "config": {
        "title": "Follow up: {{trigger.name}}",
        "duration": 30
      }
    }
  ]
}
```

The generated flow appears on the canvas for the user to review, customize, and activate.

### AI Prompt Strategy

```
System: You are FlowGeek's automation designer. Convert natural language
process descriptions into structured workflow JSON. Use only the available
adapters: [list]. Map data between steps using {{step.field}} syntax.
Ask clarifying questions if the process is ambiguous.

User: [their process description]
Available integrations: [user's connected services]
```

### Pre-built Templates

Ship with 10-15 templates for common SMB workflows:

1. **New Lead → CRM + Email + Slack** (the flagship example)
2. **Stripe Payment → Invoice Email + Google Sheet Row**
3. **New Customer → Welcome Email Series** (with delays)
4. **Form Submission → Email Notification to Team**
5. **Weekly Report → Compile Sheet Data + Email Summary**
6. **Missed Call → SMS Follow-up + CRM Note**
7. **New Review → Slack Alert + Thank You Email**
8. **Appointment Booked → Confirmation Email + Calendar + Reminder SMS**
9. **Invoice Overdue → Reminder Email Series** (1 day, 3 days, 7 days)
10. **Social Media Mention → Slack Alert + CRM Activity Log**

---

## Integration Adapters — Phase Plan

### Phase 1 (MVP) — 6 Adapters

| Adapter | Triggers | Actions |
|---------|----------|---------|
| **Webhook** | Receive HTTP POST | Send HTTP POST/GET |
| **Email (SMTP)** | — | Send email (via SendGrid) |
| **Slack** | — | Post message, post to channel |
| **Google Sheets** | — | Add row, update row, read row |
| **Schedule** | Cron (hourly/daily/weekly/monthly) | — |
| **Form** | Form submission (embedded JS snippet) | — |

### Phase 2 — 6 More Adapters

| Adapter | Triggers | Actions |
|---------|----------|---------|
| **Stripe** | Payment received, subscription created | Create invoice, refund |
| **Google Calendar** | — | Create event, update event |
| **Twilio SMS** | SMS received | Send SMS |
| **Internal CRM** | Record created | Create record, update record |
| **Mailchimp** | — | Add subscriber, tag contact |
| **QuickBooks** | — | Create invoice, log expense |

### Phase 3 — Expansion

- Facebook Lead Ads (trigger)
- Instagram DMs (trigger)
- Shopify (orders, customers)
- Square POS (payments)
- Calendly (appointment booked)
- Notion (create page, update database)
- Airtable (add/update records)
- Zapier Webhooks (interop with Zapier flows)

---

## Pricing Model

| Plan | Price | Flows | Runs/Month | Features |
|------|-------|-------|------------|----------|
| **Free** | $0 | 3 | 100 | Basic triggers/actions, email support |
| **Starter** | $19/mo | 10 | 1,000 | All integrations, conditions, delays |
| **Pro** | $49/mo | Unlimited | 10,000 | AI suggestions, priority execution, templates, PDF reports |

Revenue model designed for Geek At Your Spot clients to start free, upgrade as they automate more.

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

**Goal:** Backend scaffold + visual builder MVP + 3 adapters working end-to-end.

1. **Workspace setup**
   - Create `FlowGeek-Workspace/` with Angular multi-project structure
   - Initialize `flowgeek-backend` with Express + TypeScript + Prisma + ESLint
   - Configure Supabase database, Prisma schema, initial migration
   - Register with ControllerBackend on port 3200

2. **Backend core**
   - Flow CRUD API (create, read, update, delete flows)
   - Step management (add/remove/reorder steps within a flow)
   - Execution engine (sequential step runner with context passing)
   - Webhook receiver (inbound trigger endpoint)
   - Schedule trigger (basic cron via node-cron)
   - Run logging (per-step input/output/duration/status)

3. **Integration adapters (first 3)**
   - Webhook adapter (send/receive HTTP)
   - Email adapter (SendGrid SMTP)
   - Slack adapter (post message via Web API)

4. **Frontend — Visual builder MVP**
   - SVG canvas with pan/zoom
   - Node rendering (trigger, action types)
   - Connection lines between nodes
   - Step palette (left sidebar) with drag-to-add
   - Step config panel (right sidebar) with form fields
   - Variable insertion (`{{trigger.field}}` picker)
   - Save/load flow from backend

5. **Frontend — Dashboard**
   - Flow list with status badges (draft/active/paused)
   - Create new flow button
   - Basic run history per flow

### Phase 2: Intelligence + Polish (Weeks 4-5)

**Goal:** AI flow generation, conditions/delays, 3 more adapters, testing.

6. **AI flow generator**
   - "Describe your process" input panel
   - Claude API integration for natural language → flow JSON
   - Generated flow renders on canvas for review/edit
   - 5 pre-built templates

7. **Advanced step types**
   - Condition nodes (if/else branching)
   - Delay nodes (wait X time, then continue)
   - Transform nodes (format/extract data)

8. **More adapters**
   - Google Sheets (OAuth + add row)
   - Schedule trigger (cron picker UI)
   - Form trigger (embeddable JS snippet)

9. **Execution improvements**
   - BullMQ job queue for async execution
   - Retry with exponential backoff
   - Delay step via BullMQ delayed jobs
   - Error notification emails

10. **UX polish**
    - Canvas minimap
    - Grid snapping
    - Undo/redo (command pattern)
    - Mobile-responsive dashboard (builder is desktop-only)
    - Flow activation validation (checks all steps configured)

### Phase 3: Production Launch (Week 6)

11. **Deployment**
    - Deploy backend to Render.com
    - Build Angular Elements bundle
    - FTP upload to WordPress
    - Create WordPress page template (`page-flowgeek.php`)
    - Update `functions.php` with `wp_enqueue_script_module()`

12. **Testing + hardening**
    - End-to-end flow: form submit → email + Slack + Sheet
    - Error handling for adapter failures
    - Rate limiting on webhook endpoints
    - Input validation on all API endpoints

13. **Documentation**
    - In-app onboarding tour (first flow wizard)
    - Template gallery with "Use this template" one-click setup
    - Help tooltips on builder UI

### Phase 4: Growth Features (Post-Launch)

14. **Phase 2 adapters** (Stripe, Calendar, SMS, CRM, Mailchimp, QuickBooks)
15. **AI improvements** (suggest automations from run history, optimize slow flows)
16. **Multi-user** (team workspaces, shared flows, role-based access)
17. **Analytics dashboard** (runs over time, failure rate, time saved estimates)
18. **Flow versioning** (edit without breaking active version, rollback)
19. **Marketplace** (share/sell flow templates)

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Canvas technology | SVG (not HTML5 Canvas) | DOM-based = accessible, styleable, debuggable. Adequate perf for <100 nodes. |
| Job queue | BullMQ + Redis | Proven for delayed jobs (delay steps), retries, and concurrency control. |
| Adapter pattern | Strategy pattern with base class | Each integration implements `execute(config, context)` — easy to add new ones. |
| Data passing | Template variables `{{step.field}}` | Familiar Handlebars-like syntax, non-technical users understand it. |
| Auth | Supabase Auth (JWT) | Already using Supabase, built-in auth with social logins. |
| Secrets storage | Encrypted JSON in `UserIntegration.credentials` | OAuth tokens encrypted at rest via Supabase column encryption. |
| AI model | Claude Sonnet 4+ | Best cost/quality ratio for structured output generation. |
| PDF reports | Reuse RankPilot's Puppeteer approach | Proven pattern, consistent across Geek products. |

---

## Competitive Differentiation

| Feature | Zapier | Make.com | FlowGeek |
|---------|--------|----------|----------|
| Target user | Tech-savvy | Power users | Non-technical SMB owners |
| Pricing | $20-$100+/mo | $9-$16+/mo | Free-$49/mo |
| AI suggestions | No | No | Yes — describe process, get flow |
| Pre-built for SMB | Generic | Generic | Templates for local businesses |
| Setup complexity | Medium | High | Low — guided wizard |
| White-label for MSPs | No | No | Planned (Geek clients) |
| Integration count | 7,000+ | 2,000+ | 6-20 (curated for SMB) |

The moat is **simplicity + AI + local SMB focus**, not integration count.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| OAuth complexity (Google, Slack) | Start with API key auth for Slack, webhook-based triggers. Add OAuth in Phase 2. |
| Canvas performance with many nodes | SVG is fine for <100 nodes. Most SMB flows have 3-8 steps. |
| BullMQ/Redis cost on Render | Use Render's free Redis tier (25MB). Sufficient for ~1,000 runs/day. |
| AI generating invalid flows | Validate AI output against adapter schemas before rendering. Show user what needs fixing. |
| Adapter failures (API downtime) | Retry with backoff. Dead letter queue for manual review. Email owner on persistent failure. |
| Scope creep | Strict Phase 1 = 3 adapters + builder + run. Ship fast, iterate based on real usage. |

---

## ControllerBackend Registration

Add to `ControllerBackend` proxy routes:

```typescript
// In ControllerBackend route config
'/api/flowgeek' -> FlowGeekBackend (Port 3200)
```

Updated architecture:
```
ControllerBackend (Port 4000)
  /api/web-dev       -> WebDevelopmentBackend (Port 3000)
  /api/ai-analytics  -> AIBusinessAnalyticsBackend (Port 5001)
  /api/marketing     -> MarketingBackend (Port 5002)
  /api/website-analytics -> WebsiteAnalyticsBackend (Port 5003)
  /api/flowgeek      -> FlowGeekBackend (Port 3200)      ← NEW
```

---

## Success Metrics

| Metric | Target (3 months post-launch) |
|--------|-------------------------------|
| Active flows | 50+ across 15+ users |
| Successful runs/month | 5,000+ |
| Flow failure rate | < 5% |
| AI suggestion acceptance | > 40% of generated flows activated |
| Free → Starter conversion | > 15% |
| Time to first active flow | < 10 minutes |

---

*Plan created: February 16, 2026*
