---
description: Freemium, Pro, Enterprise, White-label, Fleet, and Insurance plan structure.
---

# Plans and entitlements

### Plan primitives

Separate three things:

* **plan** (billing)
* **modules** (fleet, insurance, parts)
* **limits** (users, AI tokens, workshops)

### Freemium

Purpose: onboarding and trial usage.

Suggested limits:

* single workshop
* low AI quota
* watermark on PDFs (optional)

### Pro

Purpose: single-business operations.

Includes:

* multi-user RBAC
* approvals and signatures
* exports

### Enterprise

Purpose: fleets, multi-branch, insurers.

Includes:

* SSO (optional)
* advanced audit controls
* custom SLAs

### White-label

Add-on or separate plan.

Includes:

* custom domain
* brand overrides
* feature restriction

### Fleet tier

Includes:

* fleet entities
* contract rates
* MG engine

### Insurance tier

Includes:

* claim artifacts
* immutable evidence packs
* audit-ready exports

### Enforcement

Entitlements are enforced server-side.

Never rely on UI checks.
