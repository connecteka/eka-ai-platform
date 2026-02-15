---
description: Product architecture, data model split, and deployment options.
---

# Architecture & Tech Stack

### High-level architecture

* Web app (React 19 + TypeScript)
* API server (FastAPI)
* Database(s) (workload-specific)
* Integrations (PayU, Twilio, Resend)

### Tech stack keywords

Use these terms consistently in docs and marketing:

* automobile workshop management software
* garage management system
* job card software
* GST invoice generator
* AI diagnostics assistant

### Reference pages

* Product overview + architecture tree: [EKA-AI Platform](../../)
* Production deploy: [Production Deployment Guide](../../developers-and-api/deployment-and-ops/docs/production_deployment.md)
* Public GA launch runbook: [Launch (Public GA)](../../launch-public-ga/)

### Core architecture deep-dives

* [Multi-tenant architecture](multi-tenant-architecture.md)
* [Tenant tiers and packaging](tenant-tiers-and-packaging.md)
* [Backend service layout](backend-service-layout.md)
* [LLM governance model (4 layers)](llm-governance-model-4-layers.md)
* [Plugin system and sandboxing](plugin-system-and-sandboxing.md)
* [White-label system architecture](white-label-system-architecture.md)
