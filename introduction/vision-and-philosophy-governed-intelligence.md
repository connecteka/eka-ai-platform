---
description: Why EKA-AI is governed AI for workshops, finance, and safety.
---

# Vision & Philosophy: Governed Intelligence

### Governed automobile intelligence

EKA-AI is the operating system for Go4Garage workshops.

It is not a generic chatbot.

EKA-AI is a governed automobile intelligence system. It prioritizes safety, financial accuracy, and domain expertise.

### Why “governed” AI

In automotive, a wrong answer is expensive. It can also be unsafe.

Generic AI may guess prices. It may suggest risky procedures.

EKA-AI is constrained by a constitution.

It is enforced before any response is generated.

### The governance engine

Every query passes through the Governance Engine (`ai_governance.py`). It applies gates before responding.

### The 4 gates (high level)

1. **Domain gate**
   * Blocks non-automotive requests.
2. **Confidence gate**
   * Avoids guessing.
   * Enforces a **0.90 (90%)** confidence threshold.
   * Asks clarifying questions when below threshold.
3. **Context gate**
   * Requires vehicle context.
   * Uses job card history when available.
4. **Permission gate (RBAC)**
   * Enforces Owner vs Technician actions.

Read the details in [The "4-Gate" Safety System (The Constitution)](the-4-gate-safety-system-the-constitution.md).

### Core capabilities

* **Mega job card**
  * Deep workflow from complaint to delivery.
  * Includes inspection evidence and approvals.
* **MG fleet engine**
  * Deterministic billing logic.
  * Zero tolerance for creative finance outputs.
* **GST invoicing**
  * IGST vs CGST/SGST handling.
  * PDF invoices and email delivery.
* **PDI and artifacts**
  * Mobile-first checklists.
  * Photo evidence requirements.

### Technical foundation

* Frontend: React 19 + TypeScript
* Backend: FastAPI
* Data: document + relational split, based on feature fit

{% hint style="info" %}
Pricing is never guessed. Final pricing must come from server-side catalogs and approvals.
{% endhint %}

### Ready to start

Go to [Getting Started](/broken/spaces/TVzkJlkx3M2vwS6FA0Xx/pages/NimTlNUwUIHe88XOY1uE).
