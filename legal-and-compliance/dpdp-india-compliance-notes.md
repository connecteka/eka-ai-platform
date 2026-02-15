---
description: Practical controls for India’s DPDP Act aligned with EKA-AI workflows.
---

# DPDP (India) compliance notes

### Scope

This is an implementation guide.

It is not legal advice.

### Data categories handled

Typical categories:

* customer identity and contact
* vehicle identifiers
* photos and inspection artifacts
* invoices and payment references
* chat transcripts (if stored)

### Core controls

#### Consent and purpose limitation

* collect only what is needed for service.
* explain purpose in-product.
* separate marketing consent.

#### Access control

* RBAC at the app layer.
* tenant isolation at the data layer.

#### Retention

Define retention per category.

Examples:

* invoices: retain for statutory period.
* photos: retain per risk contract.
* chat logs: shortest acceptable period.

#### Deletion and erasure

Provide deletion workflows.

Keep an audit record of deletion requests.

#### Breach response

Have an incident plan.

Log and time-stamp containment actions.

### Engineering checklist

* `tenant_id` everywhere.
* RLS policies for relational data.
* signed URLs for artifacts.
* immutable audit logs.
