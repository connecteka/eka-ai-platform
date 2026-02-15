---
description: JWT, Supabase RLS, gateway controls, plugin sandboxing, and audit logging.
---

# Security architecture

### Threat model (what we defend)

* cross-tenant data access
* forged approvals
* price tampering
* invoice mutation after closure
* plugin abuse

### Auth and JWT

* Use short-lived JWTs.
* Include `tenant_id`, `user_id`, and `role` claims.
* Rotate signing keys.

Never accept `tenant_id` from the request body.

### Supabase RLS

RLS is the last line of defense.

Rules:

* every table has `tenant_id`.
* every policy scopes by `tenant_id`.
* writes require role checks.

### API gateway controls

Enforce centrally:

* schema validation
* rate limits per tenant
* idempotency for finance endpoints
* webhook signature verification (PayU)

### Plugin sandbox

* no DB credentials.
* strict permissions.
* timeouts.
* execution logs.

### Tenant isolation

Isolation must exist at:

* auth
* API routing
* DB queries
* storage buckets
* logs

### Audit logging

Log all sensitive transitions:

* estimate approvals
* invoice finalization
* catalog edits
* refund/cancel events

Audit logs must be append-only.

{% hint style="info" %}
Match evidence requirements to your risk. Fleet and insurance flows need stricter artifacts.
{% endhint %}
