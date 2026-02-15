---
description: Plugin marketplace architecture, permissions, and safe execution.
---

# Plugin system and sandboxing

### Objectives

* Extend the platform without weakening governance.
* Prevent plugins from reading or writing outside their scope.
* Keep execution observable and revocable.

### Plugin types

* UI extensions (front-end only).
* Workflow hooks (server-side events).
* Integrations (outbound calls).

### Permission system

Define permissions in three dimensions:

* **tenant scope**: current tenant only.
* **data scope**: entities allowed (job cards, invoices, vehicles).
* **action scope**: read vs write vs approve.

Plugins should request the minimal set.

### Sandbox boundary

Recommended rules:

* no direct DB credentials.
* no raw network egress by default.
* use a signed outbound proxy if needed.
* execution timeouts.
* memory limits.

### Audit logging

Log every plugin execution:

* plugin ID and version
* tenant
* triggering event
* input payload hash
* outputs (redacted)
* duration
* success/failure

{% hint style="warning" %}
A plugin can never finalize an invoice. A plugin can never output a final price.
{% endhint %}
