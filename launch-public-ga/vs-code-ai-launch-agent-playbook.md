---
description: >-
  End-to-end flow, guardrails, and checklists for an AI agent in VS Code to
  drive a production launch with testing and go/no-go gates.
---

# VS Code AI Launch Agent Playbook

### What this is

This is a **repeatable launch procedure** for running EKA-AI releases with an **AI agent in VS Code**.

The agent reads docs, runs checks, prepares a release, and drives deployment.

Humans keep **final approval** for all risky steps.

### Assumptions (non-negotiable)

* You ship via **Cloud Run (backend)** + **Firebase Hosting (frontend)**.
* You treat launch as **go/no-go**.
* No deploy happens without:
  * green CI,
  * smoke tests,
  * rollback plan.

Reference runbooks:

* [Public GA Launch Checklist](public-ga-launch-checklist.md)
* [Production Deployment Guide](../developers-and-api/deployment-and-ops/docs/production_deployment.md)
* [Production Deployment Checklist](../developers-and-api/backend/backend/deployment/production_deployment_checklist.md)
* [EKA-AI Testing Checklist](../developers-and-api/deployment-and-ops/docs/testing_checklist.md)
* [EKA-AI Load Testing Guide](../developers-and-api/backend/backend/load-tests/load_testing_guide.md)
* [Legal & Compliance Pack (Pre-launch + Templates)](../enterprise-launch-b2b/legal-and-compliance-pack-pre-launch-+-templates.md)

### Agent operating rules (VS Code)

The agent is fast.

Your product is audited.

So the agent must be constrained.

#### Allowed

* Read repository files and docs.
* Create branches and PRs.
* Run read-only commands.
* Run build/test commands.
* Draft release notes and checklists.

#### Requires explicit human approval

* Deploy to production.
* Rotate secrets.
* Run destructive database commands.
* Change payment, pricing, or webhooks.
* Modify governance rules.

#### Hard safety boundaries

* Do not bypass the “4-gate” governance model.
* Do not output or hardcode secrets.
* Do not weaken RBAC or tenant isolation.

References:

* [The "4-Gate" Safety System (The Constitution)](../introduction/the-4-gate-safety-system-the-constitution.md)
* [EKA-AI Platform - GitHub Copilot Instructions](../developers-and-api/ci-cd/.github/copilot-instructions.md)

{% hint style="warning" %}
Treat payments (PayU) as **at-least-once delivery**. Assume duplicate webhooks.

Never “activate on redirect”. Activate only on verified webhook.

See the PayU rules in [Launch (Public GA)](./).
{% endhint %}

### One-page flow (what the agent does)

1. **Scope lock**
2. **Release branch**
3. **Quality gates** (build, tests, security)
4. **Staging deploy** (or preview env)
5. **Staging validation** (smoke + E2E)
6. **Production go/no-go**
7. **Production deploy**
8. **Post-deploy verification**
9. **72h monitoring + patch lane**

### VS Code setup (once)

#### How to run the agent in VS Code

Use an agent-capable chat in VS Code (example: Copilot Chat Agent mode).

* [ ] Open the repo folder as a workspace.
* [ ] Start a new agent chat for the release.
* [ ] Tell it the **version label** and **target environment**.
* [ ] Give it explicit permission boundaries:
  * read repo: yes
  * run tests/build: yes
  * deploy prod: **no (ask first)**
* [ ] Ensure it can see the right context:
  * include `README`, deployment docs, and launch checklist pages
  * include relevant code folders (`src/`, `backend/`, `.github/`)

#### Using Kimi (Moonshot) as the VS Code agent model

Kimi works well for long checklists and multi-step planning.

You still need to enforce guardrails, because “agentic” tools can move fast.

**Setup checklist (tool-agnostic)**

* [ ] Install a VS Code AI chat/agent extension that supports custom providers.
* [ ] Configure **Kimi** as the provider (API key + base URL + model).
* [ ] Enable “tool use” only if you trust the extension’s execution controls.
* [ ] Set the default workspace permissions to **read-first**.

**Kimi operating constraints (what the agent must respect)**

* **No silent production actions.** It must ask before prod deploy.
* **No guessed pricing.** Keep EKA rules: ranges only.
* **No governance edits.** Constitution changes require human review.
* **No destructive DB steps.** Migrations and deletes require approval.

**Recommended prompt prefix (paste once per release)**

Use this at the top of the agent chat.

_You are the VS Code Launch Agent for EKA-AI. You must follow the “Agent operating rules” in this playbook. Default to read-only actions. Before any risky step, ask for explicit approval. Always output checklists with PASS/FAIL and a short evidence note. If unsure, stop and ask a targeted question._

#### Workspace preflight

* [ ] Repo opens cleanly.
* [ ] `.env*` files are not committed.
* [ ] VS Code terminal can run Node + Python.
* [ ] You can authenticate to:
  * [ ] GitHub
  * [ ] Google Cloud (`gcloud`)
  * [ ] Firebase CLI

#### Agent permissions

* [ ] Agent has read access to repo and docs.
* [ ] Agent can open PRs.
* [ ] Agent cannot push to `main`.

### Release inputs (what you give the agent)

Provide these 6 fields.

1. **Version label** (example: `v1.0.3`)
2. **Target date/time**
3. **Launch scope** (features included)
4. **Out of scope** (explicitly excluded)
5. **Risk notes** (payments, auth, migrations)
6. **Rollback trigger** (what metric makes you roll back)

### Phase 0 — Scope lock (T-7d to T-1d)

#### Agent tasks

* Compile a “launch packet” in a single doc:
  * summary
  * diff highlights
  * known risks
  * testing plan
  * rollback plan
* Verify the Public GA happy path is unchanged:
  * signup → workshop → job card → approval → invoice → notify

#### Scope lock checklist

* [ ] Launch scope written and shared.
* [ ] “Happy path” is locked.
* [ ] No schema changes without migration plan.
* [ ] Any payment changes have a replay plan.

### Phase 1 — Code freeze + release branch (T-24h)

#### Agent tasks

* Create a release branch.
* Ensure all PRs are merged.
* Generate a changelog draft.

References:

* [Changelog](changelog.md)

#### Freeze checklist

* [ ] CI is green on `main`.
* [ ] No open P0 bugs.
* [ ] Secrets and env vars confirmed.
* [ ] Backups are scheduled and tested.

### Phase 2 — Quality gates (must be green)

#### 2.1 Build gate

* [ ] Frontend builds cleanly.
* [ ] Backend starts cleanly.
* [ ] No lint/type regressions.

References:

* [UI Testing Guide](../developers-and-api/testing/testing.md)

#### 2.2 Test gate

Minimum bar for production:

* [ ] Unit tests (if present) are green.
* [ ] Manual smoke tests are executed.
* [ ] Auth-gated flows are validated.

References:

* [Auth-Gated App Testing Playbook](../developers-and-api/testing/auth_testing.md)
* [EKA-AI Testing Checklist](../developers-and-api/deployment-and-ops/docs/testing_checklist.md)

#### 2.3 Governance gate (AI safety)

Run a tiny, explicit test set.

* [ ] Domain gate blocks non-auto questions.
* [ ] Confidence gate asks clarifying questions < 0.90.
* [ ] Context gate requires vehicle context.
* [ ] Permission gate blocks owner-only actions.

References:

* [Governance Constitution (Platform Law)](../introduction/governance-constitution-platform-law.md)
* [Governance: Why the AI might "Block" you](../the-ai-assistant/governance-why-the-ai-might-block-you.md)

#### 2.4 Security gate

* [ ] No secrets in repo.
* [ ] Tenant isolation checks pass.
* [ ] RLS is enabled (Supabase).

References:

* [Security Standards (ISO 27001)](../developers-and-api/security/security-standards-iso-27001.md)
* [Security architecture](../developers-and-api/security/security-architecture.md)

#### 2.5 Performance gate

* [ ] Load test baseline passes.
* [ ] P95 is within target.
* [ ] Error rate stays below 1%.

Reference:

* [EKA-AI Load Testing Guide](../developers-and-api/backend/backend/load-tests/load_testing_guide.md)

#### 2.6 Product + ops gate (non-engineering)

These are launch blockers too.

* [ ] Support workflow is staffed and tested.
* [ ] Incident response path is clear.
* [ ] Analytics events and KPIs are ready.
* [ ] Legal + compliance pack is complete and published.
  * [ ] Terms of Service
  * [ ] Privacy Policy
  * [ ] Cookie policy (if analytics/cookies)
  * [ ] Refund/cancellation policy (if payments)
  * [ ] Support policy (hours + escalation)
  * [ ] Security overview + disclosure contact
  * [ ] Subprocessor list is accurate (AI + hosting + comms)

References:

* [Support & Incident Response](support-and-incident-response.md)
* [Analytics & KPIs](analytics-and-kpis.md)
* [Legal (Terms + Privacy)](legal-terms-+-privacy.md)
* [Legal & Compliance Pack (Pre-launch + Templates)](../enterprise-launch-b2b/legal-and-compliance-pack-pre-launch-+-templates.md)

### Phase 3 — Staging / preview deploy

#### Agent tasks

* Deploy release branch to staging (or preview).
* Collect URLs.
* Run the full smoke checklist.

#### Staging smoke checklist (happy path)

* [ ] Signup works.
* [ ] Login works (Google + email, if enabled).
* [ ] Create workshop.
* [ ] Create job card.
* [ ] Move job card through the critical states.
* [ ] Capture customer approval.
* [ ] Generate invoice.
* [ ] AI chat responds and stays in domain.

{% hint style="info" %}
If WhatsApp or email is disabled, test the fallback UX.

Never silently “pretend sent”.
{% endhint %}

### Phase 4 — Production go/no-go (T-60m)

#### Agent tasks

* Produce a single go/no-go summary:
  * what changed
  * what was tested
  * known issues
  * rollback plan
* Ask for explicit approval:
  * “Approve production deploy: YES/NO”

#### Go/No-Go checklist

* [ ] All quality gates are green.
* [ ] Public GA checklist blockers are green.
* [ ] Incident owner is on-call.
* [ ] Rollback step is rehearsed.

Reference:

* [Public GA Launch Checklist](public-ga-launch-checklist.md)

### Phase 5 — Production deploy (T-0)

#### Human action

This is a human-run step.

The agent can guide and observe.

#### Deploy checklist

* [ ] Backend deploy done.
* [ ] Frontend deploy done.
* [ ] Secrets are unchanged (unless planned).
* [ ] Health checks are green.

Reference:

* [Production Deployment Guide](../developers-and-api/deployment-and-ops/docs/production_deployment.md)

### Phase 6 — Post-deploy verification (T+15m)

#### Agent tasks

* Run production smoke tests.
* Check critical dashboards.
* Confirm the “happy path” works.

#### Production smoke checklist

* [ ] `/api/health` returns healthy.
* [ ] Signup and login work.
* [ ] Payment state transitions behave.
* [ ] Job card create → approval → invoice works.
* [ ] Error tracking has no spikes.

### Phase 7 — First 72 hours

#### Agent tasks

* Produce a daily summary.
* Track top 3 failures.
* Prepare hotfix PRs.
* Keep diffs small.

#### 72h checklist

* [ ] Review support inbox.
* [ ] Review error tracking.
* [ ] Review payment webhook failures.
* [ ] Review database errors.
* [ ] Add an entry to [Changelog](changelog.md) for any patch shipped.

### Copy/paste prompts for the VS Code agent

Use these as your starting prompts.

#### Prompt: Build the launch packet

_Read the Public GA checklist + deployment guide. Then generate a launch packet for version X. Include scope, risks, test plan, and rollback triggers. Ask me 5 missing questions._

#### Prompt: Run quality gates

_Run build + test checks. Report failures with exact commands and logs. Propose minimal fixes. Do not deploy._

#### Prompt: Staging validation

_Use the staging URL(s). Walk through the happy path. Output a checklist with PASS/FAIL and evidence._

#### Prompt: Go/No-Go

_Summarize what was tested and what changed. Call out any remaining risks. Ask for explicit approval to deploy._
