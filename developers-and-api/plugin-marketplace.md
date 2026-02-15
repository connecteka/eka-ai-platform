---
description: Developer onboarding, permissions, revenue share, and event hooks.
---

# Plugin Marketplace

### Goals

* Let partners extend EKA-AI safely.
* Keep governance and tenant isolation intact.

### Developer onboarding

Recommended onboarding steps:

1. developer account approval.
2. plugin ID issuance.
3. permission request review.
4. sandbox testing.
5. marketplace listing.

### Permission model

Permissions must be explicit.

Split by:

* entity: job card, invoice, vehicle, customer
* action: read, write, approve
* scope: current tenant only

### Revenue sharing

Define revenue share at the product level.

Suggested mechanics:

* percentage split per paid install.
* monthly settlement.
* refunds reverse settlement.

### Event hook system

Expose stable event hooks.

Examples:

* `job_card.created`
* `job_card.closed`
* `invoice.draft_created`
* `invoice.finalized`
* `payment.succeeded`

Rules:

* hooks are tenant-scoped.
* payloads are minimized.
* retries are at-least-once.

### Safety constraints

* plugins cannot finalize invoices.
* plugins cannot override catalogs.
* plugins cannot output final prices.

{% include "../.gitbook/includes/platform-law-non-negotiable-rules.md" %}
