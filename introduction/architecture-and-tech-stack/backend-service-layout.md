---
description: Reference backend structure for governed workflows and multi-tenancy.
---

# Backend service layout

### Reference layout

Use a clear separation between routing, tenant resolution, governance, and engines.

#### `server.py`

* FastAPI app bootstrap.
* Dependency wiring.
* Router registration.
* Startup checks.

#### `middleware/`

* request ID
* tenant resolution
* auth verification
* rate limiting
* audit context injection

#### `tenant_manager/`

* tenant resolver
* domain/subdomain mapping
* tenant entitlements cache
* per-tenant limits

#### `gateway/`

* API gateway policies
* schema validation
* idempotency keys
* outbound integration clients

#### `plugin_system/`

* plugin registry
* permission model
* event hooks
* sandbox execution boundary

#### `white_label/`

* domain routing
* brand config resolver
* feature restriction
* tenant-specific UI config

### Deterministic engines (recommended modules)

* `mg_engine/` for MG validation.
* `tax_engine/` for GST math.
* `pricing_engine/` for catalog lookup and boundaries.
* `invoice_engine/` for finalization and PDF generation.

{% include "../../.gitbook/includes/platform-law-non-negotiable-rules.md" %}
