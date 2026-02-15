---
description: >-
  Firebase Studio frontend, Supabase, PayU, AI providers, and production
  checklist.
---

# Deployment architecture (reference)

### Components

* Frontend: Firebase Studio hosting.
* Backend: FastAPI service.
* Database: Supabase (Postgres + Auth).
* Payments: PayU.
* AI providers: Gemini, Claude, Kimi.

### Data flows

#### Auth

* user logs in via Supabase Auth.
* JWT includes `tenant_id` and `role`.

#### App requests

* frontend calls API.
* API resolves tenant.
* governance checks run.
* engines compute outputs.

#### Payments

* checkout starts in app.
* PayU processes payment.
* PayU webhook activates entitlements.

#### AI

* API selects provider.
* provider calls are tenant-scoped.
* prompts exclude sensitive data by default.

### Production readiness checklist

Use the existing runbooks:

* [EKA-AI Production Deployment Checklist](../backend/backend/deployment/production_deployment_checklist.md)
* [EKA-AI SSL/TLS Configuration Guide](../backend/backend/deployment/ssl_configuration.md)

### Required controls

* webhook signature verification.
* idempotent finalize endpoints.
* RLS enabled in Supabase.
* audit logs for finance actions.
