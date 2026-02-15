---
description: GST computation, HSN/SAC tagging, and invoice audit expectations.
---

# GST + HSN compliance handbook

### Non-negotiables

* GST math is deterministic.
* HSN/SAC is stored on each line item.
* invoice PDFs render stored fields.

{% include "../.gitbook/includes/platform-law-non-negotiable-rules.md" %}

### GST computation rules

* same state → CGST + SGST
* different states → IGST

Persist:

* place of supply
* tax rates
* breakup per rate

### HSN/SAC tagging

Rules:

* parts must carry HSN.
* labor/services must carry SAC.
* mapping lives in catalogs.

Never ask the LLM to “guess” HSN.

### Audit expectations

Keep these artifacts:

* job card snapshot used for invoicing
* approvals
* invoice finalization proof
* PDF checksum

### References

* [GST-Compliant Invoicing (IGST/CGST/SGST)](../mg-fleet-and-finance/gst-compliant-invoicing-igst-cgst-sgst.md)
