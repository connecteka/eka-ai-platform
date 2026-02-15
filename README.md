---
description: >-
  AI-powered automobile workshop management software for job cards, GST
  invoices, vehicle records, and customer notifications.
---

# 🚗 EKA-AI Platform

### Governed automobile intelligence

EKA-AI is the operating system for Go4Garage workshops.

It is not a generic chatbot.

It is governed AI for safety and audit-grade finance.

### Start here

* [Getting Started](/broken/spaces/TVzkJlkx3M2vwS6FA0Xx/pages/NimTlNUwUIHe88XOY1uE)
* [Executive Overview](introduction/executive-overview.md)
* [Workshop Onboarding & Catalog Setup](getting-started/workshop-onboarding-and-catalog-setup.md)
* [How to Chat with EKA-AI](the-ai-assistant/how-to-chat-with-eka-ai.md)
* [Vision & Philosophy: Governed Intelligence](introduction/vision-and-philosophy-governed-intelligence.md)
* [The "4-Gate" Safety System (The Constitution)](introduction/the-4-gate-safety-system-the-constitution.md)
* [Governance Constitution (Platform Law)](introduction/governance-constitution-platform-law.md)
* [Architecture & Tech Stack](introduction/architecture-and-tech-stack/)

### Why “governed” AI

Automotive mistakes cost money. They can also be unsafe.

Generic AI guesses. It also drifts out of scope.

EKA-AI is constrained by a constitution.

> **Promise:** No guessed prices. No non-automotive advice. No bypassed approvals.

### Platform law (non-negotiable)

These rules are enforced by platform code.

{% include ".gitbook/includes/platform-law-non-negotiable-rules.md" %}

### The 4-gate safety system

Every request passes the Governance Engine (`ai_governance.py`).

#### 1) Domain gate

EKA-AI rejects non-automotive queries.

* Allowed: “Why is the engine overheating?”
* Blocked: “What is the capital of France?”

#### 2) Confidence gate

EKA-AI enforces a **0.90 (90%)** confidence threshold.

If confidence is lower, it asks targeted questions.

#### 3) Context gate

EKA-AI requires vehicle context before guidance.

Provide brand, model, year, and fuel type.

When available, job card history is also used.

#### 4) Permission gate (RBAC)

Actions are permissioned, not just suggested.

Typical split:

* **Technician**: diagnostics and checklist updates
* **Owner**: catalog changes and invoice approvals

### Core capabilities

* Mega job card
  * 17 sections, evidence, approvals, and signatures.
* MG fleet engine
  * Deterministic billing using `MAX(assured, actual)`.
* GST invoicing
  * IGST vs CGST/SGST logic and compliant PDFs.
* PDI and artifacts
  * Mobile-first inspections with photo evidence.

### Technical foundation

* Frontend: React 19 + TypeScript
* Backend: FastAPI
* Data: MongoDB (job cards) + PostgreSQL/Supabase (auth and finance)

{% hint style="info" %}
EKA-AI can provide ranges and estimates only. Final prices must come from `parts_catalog` and `labor_catalog`.
{% endhint %}

— EKA-AI, Go4Garage Intelligence

<details>

<summary>For developers</summary>

* Start here: [Developer handbook](developers-and-api/developer-handbook.md)
* Streaming chat: [API Reference (`/api/chat/stream`)](developers-and-api/api-and-integrations/api-reference-api-chat-stream.md)
* Webhooks: [Webhooks & Integrations](developers-and-api/api-and-integrations/webhooks-and-integrations.md)
* Security: [Security Standards (ISO 27001)](developers-and-api/security/security-standards-iso-27001.md)

</details>
