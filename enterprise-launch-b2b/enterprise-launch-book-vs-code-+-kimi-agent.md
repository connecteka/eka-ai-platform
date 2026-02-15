---
description: >-
  End-to-end enterprise launch process with security gates, UAT, cutover
  runbook, and an AI agent workflow.
---

# Enterprise Launch Book (VS Code + Kimi Agent)

### What you get from this “book”

A repeatable enterprise launch that is:

* **auditable** (every decision has evidence)
* **safe** (human approvals for risky actions)
* **predictable** (clear gates and rollback)

This is stricter than Public GA.

It assumes you are deploying for a specific enterprise customer.

### Reality check (important)

No process eliminates all mistakes.

This book reduces risk by forcing:

* explicit decisions,
* testable gates,
* documented evidence,
* rollback triggers.

If you want “zero mistakes”, you need:

* staging that mirrors production,
* UAT sign-off,
* production access controls,
* change freeze.

### How this relates to your existing launch docs

* Public self-serve launch: [Launch (Public GA)](../launch-public-ga/)
* Go/no-go list: [Public GA Launch Checklist](../launch-public-ga/public-ga-launch-checklist.md)
* Your agent procedure: [VS Code AI Launch Agent Playbook](../launch-public-ga/vs-code-ai-launch-agent-playbook.md)

Enterprise launches reuse the same foundations.

They add customer-specific gates, security controls, and sign-offs.

### Enterprise launch outcomes (definition of done)

You are “launched” only when all are true:

* [ ] Customer users can authenticate.
* [ ] Customer data is isolated.
* [ ] Happy path works end-to-end:
  * [ ] intake → job card → approvals → invoice → notifications.
* [ ] Monitoring, alerting, and escalation exist.
* [ ] Backups and recovery are tested.
* [ ] Security review is complete.
* [ ] Customer signs UAT + go-live.

### Enterprise decisions (must be locked early)

If any of these are unclear, stop.

#### Commercial + scope

* [ ] Contract type: pilot / production.
* [ ] SLA: uptime %, support hours, response times.
* [ ] SLOs: latency targets for API endpoints.
* [ ] Scope boundaries: what is not included.

#### Deployment model

Pick one:

* [ ] Multi-tenant shared (default)
* [ ] Single-tenant (dedicated DB + separate runtime)
* [ ] Private network access (VPN / Private Service Connect)

Reference architecture:

* [Architecture & Tech Stack](../introduction/architecture-and-tech-stack/)
* [Multi-tenant architecture](../introduction/architecture-and-tech-stack/multi-tenant-architecture.md)

#### Identity and access

Pick what you support now:

* [ ] Email/password
* [ ] Google OAuth
* [ ] SSO (SAML/OIDC)
* [ ] SCIM provisioning

{% hint style="warning" %}
If the customer requires SSO/SCIM and you don’t have it.

This is a hard blocker.
{% endhint %}

#### Data + compliance

* [ ] Data residency (India only / multi-region).
* [ ] Retention policy.
* [ ] Export requirements (audit + invoices).
* [ ] DPA / DPDP requirements.
* [ ] Subprocessor list requirement (yes/no) and approval flow.

References:

* [DPDP (India) compliance notes](../legal-and-compliance/dpdp-india-compliance-notes.md)
* [Privacy Policy & GDPR Data Erasure](../legal-and-compliance/privacy-policy-and-gdpr-data-erasure.md)
* [Legal & Compliance Pack (Pre-launch + Templates)](legal-and-compliance-pack-pre-launch-+-templates.md)

### The Enterprise “Launch Packet” (deliverables)

Create one folder or doc bundle per customer.

#### 1) Architecture pack

* [ ] System diagram (runtime + data stores).
* [ ] Network diagram (if private access).
* [ ] Data flow diagram:
  * auth
  * payments
  * notifications
  * AI providers

#### 2) Security pack

* [ ] Shared responsibility model.
* [ ] RLS and tenant isolation explanation.
* [ ] Audit logging coverage.
* [ ] Encryption statement.
* [ ] Vulnerability management process.

References:

* [Security architecture](../developers-and-api/security/security-architecture.md)
* [Security Standards (ISO 27001)](../developers-and-api/security/security-standards-iso-27001.md)

#### 3) Ops pack

* [ ] Monitoring dashboard links.
* [ ] Alert routing (on-call rotation).
* [ ] Incident severity definitions.
* [ ] Backup and restore proof.

References:

* [Support & Incident Response](../launch-public-ga/support-and-incident-response.md)
* [EKA-AI Database Backup & Recovery](../developers-and-api/backend/backend/deployment/backup_configuration.md)

#### 4) Product + training pack

* [ ] Admin guide (roles + approvals).
* [ ] Technician guide (PDI + evidence).
* [ ] Owner guide (catalog + invoicing).

#### 5) Legal + compliance pack

* [ ] Contract set: MSA/SOW/SLA/DPA (as required).
* [ ] Subprocessor list shared with customer.
* [ ] Support policy and escalation shared.
* [ ] Data retention + deletion workflow shared.

Template source of truth:

* [Legal & Compliance Pack (Pre-launch + Templates)](legal-and-compliance-pack-pre-launch-+-templates.md)

### Enterprise quality gates (hard gates)

These gates must be green before go-live.

#### Gate A — Tenant isolation + RBAC

* [ ] Cross-tenant data access is impossible by ID.
* [ ] Owner-only actions are blocked for non-owners.
* [ ] Audit logs capture sensitive actions.

References:

* [Role-Based Access (Owners vs. Technicians)](../getting-started/role-based-access-owners-vs.-technicians.md)
* [Audit Logs & Financial Security](../mg-fleet-and-finance/audit-logs-and-financial-security.md)

#### Gate B — AI governance

Run explicit safety tests.

* [ ] Non-auto queries are blocked.
* [ ] Confidence < 0.90 triggers clarify.
* [ ] Context missing triggers context request.
* [ ] Pricing outputs are ranges only.

References:

* [The "4-Gate" Safety System (The Constitution)](../introduction/the-4-gate-safety-system-the-constitution.md)
* [Governance Constitution (Platform Law)](../introduction/governance-constitution-platform-law.md)

#### Gate C — Performance + reliability

* [ ] Load test passes.
* [ ] P95 within agreed SLO.
* [ ] Error rate < 1% under target load.
* [ ] Backup restore tested.

References:

* [EKA-AI Load Testing Guide](../developers-and-api/backend/backend/load-tests/load_testing_guide.md)

#### Gate D — UAT sign-off

* [ ] Customer validates the happy path.
* [ ] Customer validates reporting and exports.
* [ ] Customer signs go-live approval.

#### Gate E — Legal + compliance ready

* [ ] DPA is signed (or explicitly waived in writing).
* [ ] SLA is signed (or explicitly waived in writing).
* [ ] Subprocessors disclosed and accepted.
* [ ] Data residency is documented and met.
* [ ] Support + incident response contacts are exchanged.

Reference:

* [Legal & Compliance Pack (Pre-launch + Templates)](legal-and-compliance-pack-pre-launch-+-templates.md)

### Environments (enterprise standard)

Minimum:

* **Dev**: engineers only.
* **Staging**: production-like.
* **Prod**: customer.

Enterprise best practice:

* **Customer UAT**: staging fork with customer data set.

{% hint style="info" %}
If you can’t maintain a production-like staging environment.

Expect production issues.

Don’t promise “enterprise”.
{% endhint %}

### Cutover runbook (enterprise go-live)

Use this for go-live day.

{% stepper %}
{% step %}
### 1) T-7 days: change freeze starts

* [ ] Freeze scope.
* [ ] Freeze data model.
* [ ] Freeze pricing and payments changes.
* [ ] Publish release notes draft.

Evidence:

* [ ] Release tag planned.
* [ ] Known risks logged.
{% endstep %}

{% step %}
### 2) T-3 days: staging final validation

* [ ] Run full smoke checklist.
* [ ] Run auth-gated tests.
* [ ] Run load test baseline.

Evidence:

* [ ] PASS/FAIL report saved.
* [ ] Bugs triaged with severity.
{% endstep %}

{% step %}
### 3) T-24h: final go/no-go

* [ ] All gates green.
* [ ] Rollback rehearsed.
* [ ] On-call confirmed.
* [ ] Customer go-live meeting scheduled.

Output:

* [ ] Go/no-go summary.
{% endstep %}

{% step %}
### 4) T-0: production deploy

Human-run step.

Agent assists.

* [ ] Deploy backend.
* [ ] Deploy frontend.
* [ ] Validate health checks.

References:

* [Production Deployment Guide](../developers-and-api/deployment-and-ops/docs/production_deployment.md)
{% endstep %}

{% step %}
### 5) T+30m: production verification

* [ ] Login and RBAC.
* [ ] Create job card.
* [ ] Approvals flow.
* [ ] Invoice generation.
* [ ] Notifications.

Output:

* [ ] PASS/FAIL + evidence.
{% endstep %}

{% step %}
### 6) T+72h: stabilization

* [ ] Daily incident review.
* [ ] Patch lane only.
* [ ] No refactors.

Output:

* [ ] Daily summary.
* [ ] Top 3 issues + fixes.
{% endstep %}
{% endstepper %}

### VS Code + Kimi agent workflow (enterprise mode)

This is the agent procedure.

It is designed to avoid “silent damage”.

#### Required guardrails

* Read-first.
* Evidence-first.
* Ask-before-risk.

#### What the agent produces

* Launch packet.
* Test evidence pack.
* Go/no-go summary.
* Cutover checklist with PASS/FAIL.

#### Enterprise prompt prefix (paste once)

_You are the Enterprise Launch Agent for EKA-AI. You must follow this book. Default to read-only actions. Never deploy to production unless I explicitly say “APPROVE PROD DEPLOY”. Produce checklists with PASS/FAIL and a short evidence note. If any decision field is missing, stop and ask._

#### Enterprise prompts (copy/paste)

1. **Decisions**

_Collect missing enterprise decisions from the “Enterprise decisions” section. Ask only what blocks the plan. Output a locked decision list._

2. **Launch packet**

_Build the customer launch packet. Include architecture, security, ops, and training packs. Link each claim to evidence (config, logs, docs)._

3. **Gates**

_Run through all enterprise gates. Output PASS/FAIL. Include evidence and remediation steps._

4. **Cutover**

_Generate a minute-by-minute cutover runbook for go-live day. Include rollback triggers and who decides rollback._

### Appendix — minimum enterprise checklist

Use this when you’re in a hurry.

* [ ] Tenant isolation proven.
* [ ] RBAC proven.
* [ ] AI governance proven.
* [ ] Backups tested.
* [ ] Monitoring + on-call ready.
* [ ] UAT signed.
* [ ] Rollback rehearsed.

### What I still need from you

Reply with these and I’ll tailor this book to your exact enterprise launch:

1. Enterprise deployment model: shared / single-tenant / private network
2. Required auth: email+Google only, or SSO?
3. Data residency: India only?
4. SLA target: 99.5 / 99.9?
5. Any integrations required at go-live: PayU, WhatsApp, email, webhooks
