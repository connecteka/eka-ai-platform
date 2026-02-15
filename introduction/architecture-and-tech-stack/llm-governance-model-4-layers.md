---
description: >-
  Context, governance, calculation, and execution layers. The LLM is the
  governor.
---

# LLM governance model (4 layers)

### Core principle

**The LLM is the governor, not the engine.**

The LLM can propose.

Deterministic services decide and execute.

{% include "../../.gitbook/includes/platform-law-non-negotiable-rules.md" %}

### Layer 1: Context layer

Purpose: collect and normalize facts.

Inputs:

* vehicle identity
* job card state
* customer history
* parts/labor catalogs
* fleet contract context

Outputs:

* a structured context object.
* missing fields list.

### Layer 2: Governance layer

Purpose: enforce constitution rules.

Checks:

* domain gate
* confidence gate
* context gate
* RBAC gate
* tenant boundary

Output:

* `ALLOW | CLARIFY | BLOCK`

### Layer 3: Calculation layer

Purpose: deterministic math.

Examples:

* GST computation.
* MG rule: `MAX(assured, actual)`.
* discount boundaries.
* rounding rules.

Output:

* numbers, ranges, and proofs.

### Layer 4: Execution layer

Purpose: state changes.

Examples:

* create job card.
* generate estimate draft.
* request approval.
* finalize invoice.

Execution requires:

* a permitted action.
* validated inputs.
* audit log write.

### Where the LLM stops

* It cannot finalize invoices.
* It cannot close job cards.
* It cannot override catalogs.
* It cannot bypass approvals.
