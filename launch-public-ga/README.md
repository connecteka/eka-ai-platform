---
description: Go-live checklist and ops runbook for self-serve EKA-AI.
---

# 🚀 Launch (Public GA)

Use this section to run a **Public GA** launch with **self-serve signups**.

You already have strong deployment material. Link it into launch ops instead of duplicating it.

### What “Public GA” means here

* Anyone can create an account.
* Your default path must work without human help.
* Support and incident response must be defined.
* Legal pages must exist before marketing.

### Use these pages in order

1. **Public GA Launch Checklist**
2. **Self-serve Signup & Onboarding**
3. **Pricing, Trials, and Billing**
4. **Support & Incident Response**
5. **Legal (Terms + Privacy)**
6. **Analytics & KPIs**

### Engineering readiness references

* Use the existing [Production Deployment Guide](../developers-and-api/deployment-and-ops/docs/production_deployment.md).
* Use the existing [Production Deployment Checklist](../developers-and-api/backend/backend/deployment/production_deployment_checklist.md).
* Keep customer-visible changes tracked in [Changelog](changelog.md).

### Payments: webhook acknowledgement policy (PayU)

We treat PayU webhooks as **at-least-once delivery**. Assume duplicates and retries.

Rules:

* Return **2xx only after a durable write** (event stored / job enqueued).
* Return **5xx on transient failures** to trigger retries.
* Return **4xx on permanent failures** (invalid signature, invalid payload).
