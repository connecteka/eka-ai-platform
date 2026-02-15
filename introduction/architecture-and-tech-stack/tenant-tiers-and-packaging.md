---
description: Starter, Pro, Fleet, Insurance, Parts, and White-label entitlements.
---

# Tenant tiers and packaging

### Why tiers exist

Tiers are governance and cost controls.

They should not be “feature surprises”.

### Tier definitions

#### Starter

* Single workshop.
* Core job card flow.
* Basic invoices.
* Limited AI usage.

#### Professional

* Multiple users.
* Advanced approvals and artifacts.
* Higher AI usage.
* Exports and reporting.

#### Fleet

* Fleet entities.
* Contract rates.
* MG engine.
* Fleet approvals and SLA logging.

#### Insurance

* Claim-friendly artifacts.
* Photo evidence rules.
* Adjuster workflows.
* Immutable audit trail.

#### Parts

* Parts catalog ingestion.
* HSN mapping and validations.
* Stock and purchase hooks.

#### White-label

* Custom domain.
* Brand override.
* Feature restriction by tenant.
* Separate marketing surface.

### Entitlements model

Use server-side entitlements.

Recommended shape:

* `plan` (starter/pro/enterprise)
* `modules` (fleet, insurance, parts)
* `limits` (users, workshops, AI tokens)

Never rely on front-end checks.
