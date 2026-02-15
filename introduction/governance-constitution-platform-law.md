---
description: Permanent governance rules enforced by platform code.
---

# Governance Constitution (Platform Law)

### What this is

This is the immutable rule-set for EKA-AI.

Product features cannot override it.

### Gates vs. laws

* **Gates** decide if an AI action is allowed.
* **Laws** define what the platform must _never_ do.

Gates are described in [The "4-Gate" Safety System (The Constitution)](the-4-gate-safety-system-the-constitution.md).

Laws are below.

{% include "../.gitbook/includes/platform-law-non-negotiable-rules.md" %}

### Enforcement points (where these rules live)

* API gateway request validation.
* Tenant resolver and row-level access checks.
* Finance engines (MG, tax, invoice finalization).
* PDF renderer (invoice fields must be complete).
* Audit logging for all state transitions.

### Audit expectations

Keep logs that answer these questions:

* Who performed the action.
* Under which tenant.
* On which entity (job card, invoice, catalog item).
* Which inputs produced which outputs.
* Which rule allowed or blocked it.
