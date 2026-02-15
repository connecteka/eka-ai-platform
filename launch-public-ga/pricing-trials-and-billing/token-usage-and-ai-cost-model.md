---
description: Token budgets, model selection, and how costs map to billing.
---

# Token, usage, and AI cost model

### What is metered

Meter AI usage per tenant.

Recommended meters:

* input tokens
* output tokens
* tool calls (retrieval, vision)

### Token budgets

Define budgets by plan.

Examples:

* freemium: small fixed quota.
* pro: larger quota.
* enterprise: pooled quota.

### Cost model

Keep the model deterministic.

Recommended approach:

* store provider pricing per 1K tokens.
* compute cost = tokens × rate × model multiplier.
* persist the computation proof.

### Governance rules

* sensitive outputs never depend on “prompt only”.
* finance outputs must be computed outside the LLM.

{% include "../../.gitbook/includes/platform-law-non-negotiable-rules.md" %}

### Billing behavior

* hard stop when quota is exhausted.
* or degrade to non-AI mode.

The UX must be explicit.
