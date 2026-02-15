---
description: Deterministic MG billing logic for fleet workflows.
---

# Understanding "Minimum Guarantee" (MG) Logic

MG billing must be deterministic. No hallucinations.

### The core rule

Use the maximum of:

* assured amount (MG)
* actual amount

In plain terms:

* If actual exceeds MG, bill actual.
* If actual is below MG, bill MG.

This is the same rule you will see as `MAX(assured, actual)`.

{% include "../../.gitbook/includes/platform-law-non-negotiable-rules.md" %}

### Deep dives

* [MG calculations (state-wise and fleet-wise)](mg-calculations-state-wise-and-fleet-wise.md)
* [Dynamic pricing boundaries and governance](dynamic-pricing-boundaries-and-governance.md)
* [MG loop: validation, errors, and compliance](mg-loop-validation-errors-and-compliance.md)

### Where it fits

MG is a finance module.

It should feed invoice generation.

It should not be overridden by free-text edits.

### What to log

* Inputs (assured, actual, contract/rate identifiers)
* Output (billable value and final amount)
* Linked entity (invoice ID and/or job card ID)
* Approval (Owner)
* Timestamp
