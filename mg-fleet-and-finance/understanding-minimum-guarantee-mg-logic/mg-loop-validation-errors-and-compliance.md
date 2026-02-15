---
description: The loop mechanism, error protection, and invoice enforcement.
---

# MG loop: validation, errors, and compliance

### The MG loop

MG is validated in a loop.

It runs before invoice finalization.

Loop stages:

1. gather inputs.
2. compute billable base.
3. validate against contract.
4. attach proof to invoice draft.
5. require Owner approval.

### Error protection

Hard failure cases:

* missing contract link
* missing assured amount
* negative amounts
* currency mismatch
* state mismatch

Soft failure cases:

* missing optional evidence
* missing customer GSTIN

Hard failures must block invoice finalization.

### Compliance enforcement

Persist these fields for audit:

* rule version
* input hashes
* contract identifiers
* approver user ID
* timestamps

### Where to block

Block at:

* invoice `FINALIZE` endpoint
* PDF generation

Never allow “manual override without trace”.
