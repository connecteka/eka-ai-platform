---
description: >-
  Cost + margin boundaries, validation gates, and why LLM cannot output exact
  prices.
---

# Dynamic pricing boundaries and governance

### Principle

LLM may suggest.

LLM cannot decide final numbers.

### Boundary model

Every price must be validated against boundaries.

Recommended boundary inputs:

* `cost` (last purchase price or reference)
* `margin_min`
* `margin_target`
* `margin_max`
* `discount_max`
* `state_tax_rules`

Computed boundary outputs:

* `price_floor`
* `price_ceiling`
* `allowed_discount_range`

### Cost + margin + governance validation

Validation sequence:

1. catalog lookup.
2. boundary compute.
3. role check (who can discount).
4. MG check (fleet).
5. tax compute.

If any validation fails, block finalization.

### Why ranges only

Ranges are safe for discussion.

Exact prices are finance outputs.

Exact prices must be deterministic.

{% include "../../.gitbook/includes/platform-law-non-negotiable-rules.md" %}
