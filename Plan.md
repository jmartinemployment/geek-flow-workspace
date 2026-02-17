# GeekFlow — Gap Analysis & Implementation Roadmap

> **Compared against:** Zapier (industry leader, 8,000+ integrations) and 17+ competitors
> **Target audience:** Non-technical SMB owners (Geek At Your Spot clients)
> **Core problem:** Current GeekFlow UI uses developer jargon and abstractions
> that communicate nothing to the target user.

---

## Competitive Landscape

### Tier 1 — Major SMB/Mid-Market

| Platform | Website | Free Tier | Starting Paid | Integrations | Differentiator |
|----------|---------|-----------|---------------|-------------|----------------|
| **Zapier** | zapier.com | 100 tasks/mo | $19.99/mo | 8,000+ | Largest app library, easiest onboarding |
| **Make** (fka Integromat) | make.com | 1,000 ops/mo | ~$10.59/mo | 3,000+ | Visual flowchart builder with branching/iteration, much cheaper per operation |
| **Pabbly Connect** | pabbly.com/connect | 100 tasks/mo | $16/mo or $249 lifetime | 1,000+ | Lifetime deal pricing, internal steps are free (only trigger counts) |
| **Integrately** | integrately.com | Limited | ~$29.99/mo | 1,100+ | One-click pre-built automations, fastest time-to-automation |
| **IFTTT** | ifttt.com | Yes (limited) | $2.99/mo | 700+ | Consumer IoT/smart home (Alexa, Hue, Google Home) |
| **Pipedream** | pipedream.com | 10K inv/day | $29/mo | 900+ | Code-first — real Node.js/Python/Go in workflow steps |

### Tier 2 — Open Source / Self-Hosted

| Platform | Website | Free Tier | Starting Paid | Integrations | Differentiator |
|----------|---------|-----------|---------------|-------------|----------------|
| **n8n** | n8n.io | Unlimited (self-host) | €24/mo cloud | 400+ native | Open-source, no per-task pricing self-hosted, code nodes |
| **Activepieces** | activepieces.com | 1,000 tasks/mo | $1/1K tasks | 450+ | Fastest-growing OSS, MCP server support (400+ servers) |
| **Automatisch** | automatisch.io | Unlimited (self-host) | €20/user/mo | 50+ | GDPR-first, European data residency |

### Tier 3 — Enterprise / iPaaS

| Platform | Website | Free Tier | Starting Paid | Integrations | Differentiator |
|----------|---------|-----------|---------------|-------------|----------------|
| **Power Automate** | powerautomate.microsoft.com | With M365 | $15/user/mo | 1,000+ | Microsoft ecosystem + RPA for desktop apps |
| **Workato** | workato.com | None | ~$60K+/yr | 1,200+ | Enterprise governance, SOC 2 Type II, audit logs |
| **Tray.ai** | tray.ai | None | Custom | 600+ | Embeddable — SaaS companies offer integrations to their customers |
| **Celigo** | celigo.com | None | Custom | 200+ apps | ERP/eCommerce specialist (NetSuite, Shopify, Amazon) |
| **Boomi** | boomi.com | None | ~$550/mo | 200K+ | Full iPaaS + MDM + EDI, spun from Dell |

### Tier 4 — AI-Native (New Wave)

| Platform | Website | Free Tier | Starting Paid | Differentiator |
|----------|---------|-----------|---------------|----------------|
| **Gumloop** | gumloop.com | 2,000 credits/mo | $37/mo | AI-first canvas — nodes are LLM calls, scrapers, transformers |
| **Relay.app** | relay.app | 200 steps/mo | Contact | Human-in-the-loop — workflows pause for human approval |
| **Lindy AI** | lindy.ai | Trial | $49.99/mo | AI agents that operate autonomously (email, scheduling, research) |

### Strategic Positioning for GeekFlow

1. **SMB price ceiling is ~$25-30/mo.** Pabbly and Make have trained the market to expect sub-$30 starting prices. Zapier's $20 floor is the benchmark.
2. **Per-task pricing is becoming a liability.** Pabbly's "internal steps free" and Activepieces' flat task pricing are direct attacks on Zapier's model.
3. **Open source is winning developer mindshare.** n8n and Activepieces growing fast with self-host options and no vendor lock-in.
4. **AI-native tools are fragmented.** Gumloop, Relay, and Lindy each solve narrow AI-adjacent use cases but none combine a visual no-code builder with AI-native flow generation at SMB prices.
5. **GeekFlow's gap opportunity:** AI-assisted, SMB-first, WordPress-native delivery at consumer pricing. No current competitor owns that specific combination — an automation tool that lives inside the client's existing WordPress site, speaks their language, and uses AI to generate workflows from plain-English descriptions.

---

## What Zapier Gets Right (That GeekFlow Must Copy)

### 1. App-First, Not Protocol-First

Zapier users pick **"Gmail"**, not "email adapter." They pick **"New Form Submission"**,
not "Webhook Received." The entire UX is organized around app icons and plain-English
event names. Users never see URLs, HTTP methods, or JSON.

**GeekFlow today:** "Webhook Received", "Schedule (Cron)", "HTTP Request" — meaningless
to a small business owner.

### 2. Vertical Step-by-Step Wizard (Not Free-Form Canvas)

Zapier deliberately chose a **linear vertical editor** over a canvas. One step expanded
at a time. Progressive disclosure. No node positioning, no connection drawing. The system
handles layout automatically.

**GeekFlow today:** SVG canvas with manually-placed nodes and bezier curves — higher
cognitive load, zero benefit for simple 3-8 step flows that SMB owners will create.

### 3. Structured Config Forms (Not JSON Editing)

Every Zapier action has **specific form fields** — text inputs, dropdowns, toggles.
Dynamic data from previous steps appears as **colored pills** (e.g., green pill
"1. Trigger > Email Address"). Users never see or edit JSON.

**GeekFlow today:** Raw JSON textarea with `{{template}}` syntax for step configuration.

### 4. Template-Driven Onboarding

Zapier's home page shows **recommended templates** based on connected apps and
**category filters** ("Lead management", "Customer support", "Marketing & growth").
New users start from a working automation, not a blank canvas.

**GeekFlow today:** Empty flow list with "+ New Flow" button (blank page problem).

### 5. AI Copilot (Describe → Generate)

Zapier's home page prominently features an **AI prompt bar**: "Enter an idea or app name
to get started." Users describe what they want in plain English (text or voice), and
Copilot generates a complete Zap draft.

**GeekFlow today:** Anthropic API key configured but unused. No AI-assisted flow creation.

### 6. Per-Step Testing with Real Data

Each Zapier step has a **"Test" button** that executes just that step with real data.
Users see actual output before continuing to the next step. This builds confidence
for non-technical users.

**GeekFlow today:** No test button in the builder. Test run only via API endpoint.

---

## Current GeekFlow Inventory

### What Works

| Component | Status | Notes |
|-----------|--------|-------|
| Flow CRUD | Working | Create, list, edit, delete, duplicate |
| Step CRUD | Working | Create, edit, delete, reorder |
| Webhook adapter | Working | Outbound HTTP requests via fetch() |
| Email adapter | Working | SendGrid v3 API (needs API key) |
| Slack adapter | Working | chat.postMessage (needs bot token) |
| Execution engine | Working | Sequential steps, 3 retries, exponential backoff |
| Template variables | Working | `{{trigger.body.field}}` deep path resolution |
| Per-step run logging | Working | Input, output, duration, status per step |
| Inbound webhook trigger | Working | POST /api/webhooks/:flowId |
| Cron scheduler | Working | Loads active flows on startup |
| Run history | Working | Paginated list with status badges |
| SVG canvas | Working | Nodes, bezier connections, zoom |
| WordPress integration | Working | Angular Elements on geekatyourspot.com/geek-flow/ |
| Render deployment | Working | Auto-deploy from GitHub |
| Supabase database | Working | 6 tables, 4 enums |

### What's Stubbed (Schema Only, No Implementation)

| Feature | Schema | Adapter | Executor | UI |
|---------|--------|---------|----------|-----|
| CONDITION steps | Enum exists | None | No logic | No palette template |
| DELAY steps | Enum exists | None | No logic | No palette template |
| TRANSFORM steps | Enum exists | None | No logic | No palette template |
| UserIntegration | Table exists | N/A | N/A | Never read or written |
| Plan/flowLimit | Fields exist | N/A | Never enforced | No UI |
| Connection conditions | JSON field exists | N/A | Executor ignores | No UI |
| Node drag-to-move | Output declared | N/A | N/A | Never wired |

### Known Bugs

| Bug | Impact |
|-----|--------|
| Activate/pause don't integrate with scheduler | Cron flows only load on server restart |
| Run cancellation doesn't stop execution | Executor has no mid-run cancellation check |
| Flow delete doesn't cascade to runs | Orphan run records remain in database |
| createFlow() uses hardcoded 'default-user' | No authentication |

---

## Gap Analysis: Feature-by-Feature

### UX & Navigation (P0 — Blocks Everything)

| # | Zapier Feature | GeekFlow Status | Gap | Priority |
|---|---------------|-----------------|-----|----------|
| 1 | App directory with icons and plain-English names | Protocol-first jargon | **MISSING** — Need AppDefinition model + branded tiles | P0 |
| 2 | Vertical step wizard editor | SVG canvas only | **MISSING** — Need linear step-list editor | P0 |
| 3 | Structured per-adapter config forms | Raw JSON textarea | **MISSING** — Need dynamic form rendering from ConfigField[] | P0 |
| 4 | Visual data pills from previous steps | `{{template}}` syntax in JSON | **MISSING** — Need dropdown variable picker with friendly names | P0 |
| 5 | Template gallery on home page | Empty flow list | **MISSING** — Need 5-10 pre-built SMB templates | P0 |
| 6 | Category filters (Lead mgmt, Support, Marketing) | None | **MISSING** — Need business-outcome categories | P0 |
| 7 | Per-step test with real data preview | No test in builder | **MISSING** — Need inline test button per step | P1 |
| 8 | AI Copilot ("describe what you want") | API key exists, no UI | **MISSING** — Need prompt bar + flow generation | P1 |

### Flow Builder Features (P1)

| # | Zapier Feature | GeekFlow Status | Gap | Priority |
|---|---------------|-----------------|-----|----------|
| 9 | Filters (conditional gates) | CONDITION enum only | **MISSING** — Need rule builder UI + executor logic | P1 |
| 10 | Paths (branching if/else, up to 10 branches) | Connection.condition field ignored | **MISSING** — Need branching executor + UI | P2 |
| 11 | Delay steps (wait for, wait until) | DELAY enum only | **MISSING** — Need delay adapter + executor logic | P1 |
| 12 | Formatter (text/number/date transforms) | TRANSFORM enum only | **MISSING** — Need transform adapter + UI | P2 |
| 13 | Drag-and-drop step reordering | Steps ordered by `order` field | Partial — API supports reorder, no drag UI | P2 |
| 14 | Undo/redo | None | **MISSING** | P3 |
| 15 | Flow name editing in builder | Not available | **MISSING** | P2 |
| 16 | Sub-Zaps (reusable step sequences) | None | **MISSING** | P3 |

### App Connections & Auth (P1)

| # | Zapier Feature | GeekFlow Status | Gap | Priority |
|---|---------------|-----------------|-----|----------|
| 17 | User authentication | Hardcoded 'default-user' | **MISSING** — Need Supabase Auth | P1 |
| 18 | OAuth connection management | UserIntegration table unused | **MISSING** — Need connection UI + OAuth flows | P2 |
| 19 | Multiple accounts per app | None | **MISSING** | P3 |
| 20 | Dynamic field population from user data | Static config fields | **MISSING** | P3 |

### Execution & Reliability (P1-P2)

| # | Zapier Feature | GeekFlow Status | Gap | Priority |
|---|---------------|-----------------|-----|----------|
| 21 | Autoreplay (5 retries) | 3 retries implemented | Close enough for MVP | — |
| 22 | Custom error handler step | None | **MISSING** | P3 |
| 23 | Run cancellation stops execution | DB flag only, executor ignores | **BUG** — Need mid-run check | P2 |
| 24 | Scheduler ↔ activate/pause | Not integrated | **BUG** — Need to wire scheduleFlow()/unscheduleFlow() | P1 |
| 25 | Run cascade delete | Runs don't cascade from flow | **BUG** — Need onDelete: Cascade | P2 |
| 26 | Webhook signing/secrets | No auth on inbound webhooks | **MISSING** — Need per-flow secret | P2 |

### Monitoring & History (P2)

| # | Zapier Feature | GeekFlow Status | Gap | Priority |
|---|---------------|-----------------|-----|----------|
| 27 | Run detail view (per-step logs) | API exists, no UI | **MISSING** — Need RunDetail component | P2 |
| 28 | Search/filter run history | Pagination only | **MISSING** — Need status filter at minimum | P2 |
| 29 | Task usage meter | None | **MISSING** — Need counter + plan display | P2 |
| 30 | Error notification emails | None | **MISSING** | P3 |
| 31 | Version history for flows | None | **MISSING** | P3 |

---

## Implementation Roadmap

### Phase 2: Make It Communicate (UX Overhaul) — P0

**Goal:** A non-technical user can understand and use the product without explanation.

#### 2.1 App Directory & Plain-English Labels

Replace the developer-oriented step palette with an app-first experience.

**Backend:**
- Create `AppDefinition` registry (in-memory or DB):
  ```
  { id: 'gmail', name: 'Gmail', icon: '/assets/icons/gmail.svg', category: 'email' }
  { id: 'slack', name: 'Slack', icon: '/assets/icons/slack.svg', category: 'messaging' }
  { id: 'webhook', name: 'Custom Webhook', icon: '🔗', category: 'advanced' }
  { id: 'schedule', name: 'Schedule', icon: '📅', category: 'triggers' }
  ```
- Each app has triggers and actions with user-friendly names:
  ```
  Gmail > "New Email Received" (trigger)
  Gmail > "Send Email" (action)
  Slack > "New Message in Channel" (trigger)
  Slack > "Send Message" (action)
  Schedule > "Every Day at..." (trigger)
  Schedule > "Every Week on..." (trigger)
  Webhook > "When data arrives from another app" (trigger)
  Webhook > "Send data to another app" (action)
  ```
- `GET /api/apps` endpoint returning available apps with their triggers/actions

**Frontend:**
- Replace `StepPaletteComponent` with `AppPickerComponent`:
  - Grid of app tiles with icons (not a text list)
  - Click app → see its triggers/actions with descriptions
  - Search by app name or description
- Replace all developer labels:

  | Current | New |
  |---------|-----|
  | Webhook Received | When data arrives from another app |
  | Schedule (Cron) | Run on a schedule |
  | HTTP Request | Send data to another app |
  | Send Email | Send an email |
  | Slack Message | Send a Slack message |

#### 2.2 Structured Config Forms

Replace raw JSON editing with dynamic form fields.

- Define `ConfigField[]` per adapter action (model already exists in `integration.model.ts`):
  ```typescript
  interface ConfigField {
    key: string;           // 'to', 'subject', 'body'
    label: string;         // 'Recipient Email'
    type: 'text' | 'email' | 'textarea' | 'select' | 'number' | 'toggle' | 'cron';
    placeholder?: string;  // 'e.g., customer@example.com'
    helpText?: string;     // 'The email address to send to'
    required?: boolean;
    options?: { label: string; value: string }[];  // For select fields
    supportsVariables?: boolean;  // Show variable picker for this field
  }
  ```
- Rewrite `StepConfigComponent` to render form fields dynamically
- Add inline variable picker (dropdown, not raw `{{syntax}}`):
  - Dropdown shows friendly names: "Trigger > Email Address", "Step 1 > Response Body"
  - Inserts as visual pill/chip, not raw text
  - Resolves to `{{trigger.body.email}}` under the hood

#### 2.3 Vertical Wizard Editor (Replace Canvas for Default View)

Replace SVG canvas with a Zapier-style linear step editor for the default experience.

- **Step list layout:** Vertical card stack, one step per card
- **Each card shows:** App icon + event name + status indicator (configured/needs setup/error)
- **Click to expand:** Inline config form appears inside the card
- **"+" button** between cards to insert a new step
- **Progressive disclosure:** Complete step 1 before step 2 opens
- Keep SVG canvas accessible as "Advanced View" toggle for power users

#### 2.4 Template Gallery on Home Page

Redesign the dashboard from a bare flow list to a template-driven home page.

- **Top section:** "What would you like to automate?" prompt (text, leads to AI Copilot later)
- **Category tabs:** "For you", "Lead management", "Customer support", "Marketing"
- **Template cards:** 5-10 pre-built flow templates with:
  - App icons
  - Plain-English title: "Email me when my contact form is submitted"
  - Description: "Sends you an email notification whenever someone fills out your website contact form"
  - "Use this template" button → clones flow + steps, opens in editor
- **"Start from scratch"** option below templates
- **Your Flows** section below (current flow list, moved down)

**Seed templates:**

| Template | Trigger | Actions |
|----------|---------|---------|
| Notify me of new form submissions | Webhook (form) | Send Email |
| Post new leads to Slack | Webhook (form) | Slack Message |
| Send follow-up email after inquiry | Webhook (form) | Delay 24h → Send Email |
| Weekly email summary every Monday | Schedule (Mon 9am) | Send Email |
| Forward webhook data to another app | Webhook | HTTP Request |
| Notify team of new sale | Webhook (payment) | Slack + Email |

#### 2.5 Per-Step Testing

Add inline test capability to each step in the wizard editor.

- **Trigger step:** "Pull sample data" or "Send a test webhook" button
  - Shows sample output data (what fields are available for later steps)
- **Action steps:** "Test this step" button
  - Executes just that step with real data from the trigger test
  - Shows success/failure and output data
- Test results persist in the editor session for reference

---

### Phase 3: Core Missing Features — P1

**Goal:** Feature parity with Zapier Free tier.

#### 3.1 User Authentication (Supabase Auth)

- Integrate Supabase Auth (email/password + magic link)
- Replace hardcoded `'default-user'` with authenticated user ID from JWT
- Add auth middleware to all `/api/*` endpoints
- Login/signup flow in the Angular Elements app

#### 3.2 Condition Steps (Filters)

- **Visual rule builder** in the step config form:
  - Field picker (dropdown of available variables from previous steps)
  - Operator picker: equals, not equals, contains, does not contain, greater than, less than, exists, is empty
  - Value input (text or variable reference)
  - AND/OR grouping for multiple conditions
- **Executor logic:** Evaluate conditions. If false, skip remaining steps (Zapier behavior).
- **Adapter:** Built-in condition evaluator (not an external service)

#### 3.3 Delay Steps

- **UI:** Duration picker (number + unit: minutes, hours, days)
- **"Wait until" option:** Pick a datetime field from a previous step
- **Executor:** For MVP, use `setTimeout` in-process. For production, queue a delayed job.
- **Max delay:** 30 days (Zapier's limit)

#### 3.4 Scheduler ↔ Activate/Pause Integration (Bug Fix)

- `POST /flows/:id/activate` calls `scheduleFlow()` if flow has cron schedule
- `POST /flows/:id/pause` calls `unscheduleFlow()`
- Add to activate endpoint: validate all steps have required config

#### 3.5 AI Flow Generator (Copilot)

- **UI:** Text prompt on home page: "What would you like to automate?"
- **Backend:** `POST /api/ai/generate` — sends user description to Claude API
- **Claude prompt:** System prompt with available apps/triggers/actions, user's connected services
- **Output:** Structured flow JSON that creates a Flow + Steps in DRAFT status
- **UX:** User sees generated flow in the editor, reviews, customizes, and activates

---

### Phase 4: Reliability & Polish — P2

**Goal:** Production-ready for paying customers.

#### 4.1 App Connections (OAuth/API Keys)

- Connection management UI (My Connections page)
- Per-adapter setup: API key entry form or OAuth redirect
- Store encrypted credentials in `user_integrations` table
- Connection health indicators (connected/expired/error)
- Adapter actions pull credentials from UserIntegration, not hardcoded env vars

#### 4.2 Transform Steps (Formatter)

- Text operations: uppercase, lowercase, trim, find/replace, extract email/phone/URL
- Number operations: basic math, format currency
- Date operations: format, add/subtract time, convert timezone
- Lookup table: key→value mapping
- Visual form for each operation type (not JSON)

#### 4.3 Paths (Branching Logic)

- If/else branching with up to 5 branches
- Each branch has its own condition set and action steps
- Fallback branch for when no condition matches
- Executor follows matching branch(es)

#### 4.4 Run Detail UI

- New `RunDetailComponent` showing per-step execution:
  - App icon + step name + status (green check / red X)
  - Expandable: input data → output data → duration
  - Error message for failed steps
- Link from run history table → detail view

#### 4.5 Bug Fixes

- Add `onDelete: Cascade` to Run→Flow relation (orphan runs)
- Add cancellation check between steps in executor
- Flow name editing in builder

#### 4.6 Plan Enforcement

- Check flowLimit before creating new flows
- Track task usage (successful action executions per month)
- Usage meter in dashboard header
- Upgrade prompt when approaching limits

#### 4.7 Webhook Security

- Per-flow webhook secret (auto-generated on creation)
- HMAC signature verification on inbound webhooks
- Show webhook URL + secret in flow config

---

### Phase 5: Growth — P3

| Feature | Description |
|---------|-------------|
| More adapters | Google Sheets, Stripe, Twilio SMS, WordPress hooks, Calendly, QuickBooks |
| Error notification emails | Alert flow owner on failure |
| Version history | Track changes, rollback to previous version |
| Custom error handler step | Alternative workflow branch on step failure |
| Team/multi-user | Shared flows, role-based access |
| Undo/redo in editor | Action history stack |
| Sub-flows | Reusable step sequences callable from multiple flows |
| Dynamic field population | Dropdowns populated from user's actual account data |

---

## Priority Summary

| Priority | What | Why |
|----------|------|-----|
| **P0** | App directory, structured forms, wizard editor, templates, friendly labels | Product is **unusable** without these |
| **P1** | Auth, conditions, delays, scheduler fix, AI copilot, per-step testing | Core functionality for real usage |
| **P2** | App connections, transforms, paths, run detail UI, bug fixes, plan enforcement, webhook security | Required for launch |
| **P3** | More adapters, error emails, versioning, teams, undo/redo, sub-flows | Growth features |

---

## Architecture Notes

### Wizard vs. Canvas Decision

Zapier uses a vertical wizard for its core 95% of users and offers a "Visual Editor"
(canvas view) as an optional advanced feature. GeekFlow should follow the same pattern:

- **Default:** Vertical wizard (Phase 2.3)
- **Advanced toggle:** SVG canvas (already built, just needs toggle access)

### Template Storage

Flow templates should be stored as regular Flow records with a `isTemplate: true` flag
(add to Prisma schema) and `category` field. Cloning a template creates a new Flow in
DRAFT status with all steps copied.

### AI Integration Architecture

The Claude API call for flow generation should:
1. Receive user's plain-English description
2. Include system prompt with available apps, triggers, actions, and their ConfigField schemas
3. Return structured JSON matching the Flow + Steps schema
4. Backend validates and creates Flow in DRAFT status
5. Frontend opens the wizard editor with the generated flow pre-populated

---

## Zapier UI Reference Screenshots

Visual references from Zapier's production UI captured February 17, 2026.

### 1. Home Page (zapier.com/app/home)

AI Copilot prompt bar front and center: "Enter an idea or app name to get started."
Below it: category filter chips (Lead management, Sales pipeline, Marketing campaigns,
Customer support, Project management). Two "Start from scratch" tiles: one for
single-step Zaps, one for multi-step. Below that: "Recommended for you" template
cards showing real app icons (Gmail, Slack, HubSpot, Google Sheets) with
plain-English descriptions like "Create Trello cards from new Typeform entries."

**Key takeaway:** The home page is a launchpad, not a list. Users are guided toward
templates and AI generation before they ever see "create from scratch."

### 2. Zap Editor (zapier.com/editor)

Vertical wizard layout. Left sidebar has Copilot with "Describe your workflow" text
input (supports text and voice). Main area shows a linear card stack:
- **Trigger card** (top) — app icon + "1. Trigger" label, expandable
- **Action card** — app icon + "2. Action" label, expandable
- **"+" buttons** between every card to insert new steps
- Each card has a configure/test/publish progression

No canvas. No nodes. No connection lines. Pure vertical progression.

**Key takeaway:** The editor is a form wizard, not a diagramming tool. One step
visible at a time. Progressive disclosure eliminates overwhelm.

### 3. Templates Page (zapier.com/templates)

Header: "Workflow Automation Templates." Left sidebar with use-case categories:
Lead management, Sales pipeline, Marketing campaigns, Customer support, etc.
Main area: grid of template cards, each showing:
- Two app icons connected by an arrow
- Plain-English title (e.g., "Add new Facebook Lead Ads leads to HubSpot")
- "Use this Zap" CTA button

**Key takeaway:** Templates are organized by business outcome, not by app or
technology. Users find automations by what they want to accomplish.

### 4. Assets / Zaps Page (zapier.com/app/assets/zaps)

Left sidebar navigation: Folders, Zaps, Tables, Forms, Chatbots, Canvases, Agents.
Main area shows "My Zaps" list with status toggles (on/off), last edit date,
folder assignment. Below the list: "Templates for you" section with recommended
automations based on connected apps.

**Key takeaway:** Zapier has expanded well beyond simple Zaps — Tables, Forms,
Chatbots, Canvases, and Agents are all first-class products in the nav. GeekFlow
should note this trajectory but stay focused on core workflow automation for now.

### 5. App Connections (zapier.com/app/assets/connections)

Clean empty state with "Add connection" CTA button and descriptive text explaining
what connections are. Each connected app shows: app icon, account name, connection
status (Connected/Expired), and last used date.

**Key takeaway:** Connections are a standalone management page, not buried in flow
config. Users set up connections once and reuse them across all flows.

### 6. Zap History (zapier.com/app/history)

Filter bar across the top: Date range picker, Zaps dropdown, Apps dropdown, Folders
dropdown, Status filter (Success/Error/Filtered/Held/Waiting/Played). "Autoreplay"
toggle to automatically retry failed tasks. Table below shows: Zap name, app icons,
status badge, timestamp, data preview.

**Key takeaway:** Monitoring is filterable and actionable. Autoreplay is a
one-toggle feature that eliminates manual retry. Status categories are
user-friendly (not HTTP codes).

### 7. Explore Apps (zapier.com/apps)

"9,199 apps" headline. Category tabs: Integrations (8,500+), AI (477), Custom
(Unlimited), Zapier AI, Zapier Tools. Each app tile shows icon + name + brief
description. Search bar at top for finding specific apps.

**Key takeaway:** The app directory IS the product catalog. 9,199 integrations
is the moat. GeekFlow will never compete on quantity — must compete on curation
and SMB relevance.

### 8. Functions Beta (zapier.com/functions)

Code-first automation for developers. Write JavaScript/TypeScript functions that
run on Zapier's infrastructure. Escape hatch for when no-code isn't enough.

**Key takeaway:** Even the no-code leader provides a code escape hatch. GeekFlow's
"Advanced View" (SVG canvas) serves a similar purpose — power users need an
off-ramp from the wizard.

### 9. Lead Router (leadrouter.zapier.com/records/fields)

CRM-like field definitions table: First Name, Last Name, Email columns with
entity type "Sales Rep." Routing rules and queue management. This is a standalone
Zapier product, not a Zap feature.

**Key takeaway:** Zapier is building vertical SaaS products on top of their
automation platform. Not relevant for GeekFlow Phase 2-3, but shows where the
market is heading.

### 10. GeekFlow Current State (geekatyourspot.com/geek-flow/)

"My Workflows" header with "+ New Flow" button. Flow list showing test entries
("test" and "Another") with Edit/Activate/Pause/Delete/Duplicate buttons. Activate
returns 400 errors. No icons, no templates, no categories, no AI prompt. Raw
developer-facing UI with no guidance for non-technical users.

**Key takeaway:** This is the starting point. Everything above represents the
gap between where GeekFlow is and where it needs to be.

---

*Created: February 17, 2026*
*Based on: Zapier feature audit + full GeekFlow codebase audit*
*Updated from original plan (February 16, 2026)*
