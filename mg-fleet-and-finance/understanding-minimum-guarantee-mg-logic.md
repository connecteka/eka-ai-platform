---
description: Deterministic MG billing logic for fleet workflows.
---

# Understanding "Minimum Guarantee" (MG) Logic

MG billing must be deterministic. No hallucinations.

### The core rule

Use the maximum of:

* assured amount
* actual amount

In plain terms:

* If actual exceeds MG, bill actual.
* If actual is below MG, bill MG.

### What to log

* Inputs (assured, actual)
* Output
* Who approved
* Timestamp
