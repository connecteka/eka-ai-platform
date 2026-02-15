---
description: Tenant isolation, request routing, and data segregation logic.
---

# Multi-tenant architecture

### Goals

* Hard isolation between tenants.
* Predictable performance per tenant.
* Auditability of every cross-service call.

### Tenant model

A **tenant** is the top-level security boundary.

A tenant may contain multiple workshops, users, and fleets.

### Request routing

Every request resolves a `tenant_id`.

Recommended resolution order:

1. Explicit header (internal services only).
2. Auth token claim.
3. Subdomain / custom domain mapping.

If tenant cannot be resolved, the request fails.

### Isolation layers

#### 1) Identity isolation

* Users belong to a single tenant.
* Tokens include `tenant_id` and `role`.

#### 2) Data isolation

* Every row/document includes `tenant_id`.
* Every query is scoped by `tenant_id`.
* Back-end never accepts tenant\_id from the client body.

#### 3) Compute isolation

* Rate limits per tenant.
* Token budgets per tenant.
* Background jobs are tenant-scoped.

#### 4) Observability isolation

* Logs include `tenant_id`.
* Traces include `tenant_id`.
* Metrics can be filtered per tenant.

{% hint style="warning" %}
“Soft multi-tenancy” is not acceptable. Every storage read must be tenant-scoped.
{% endhint %}

### Data segregation logic

Split storage by workload.

Typical pattern:

* **Relational**: auth, billing, invoices, ledgers, catalogs.
* **Document**: job card rich artifacts, inspection evidence, chat transcripts.

The split is allowed.

Tenant boundary is still enforced at both layers.
