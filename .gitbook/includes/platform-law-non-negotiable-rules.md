---
title: Platform Law (Non‑negotiable rules)
---

## Platform law

These rules are enforced by platform code.

* **LLM cannot output final prices.**
  * The LLM may only return _price ranges_.
  * Final prices must come from server-side catalogs and deterministic engines.
* **Pricing logic lives outside the LLM.**
  * Catalog lookup, MG validation, discount rules, and tax math are deterministic.
* **MG loop must validate before invoice finalization.**
  * If MG validation fails, invoice finalization must be blocked.
* **Job card closure ends LLM authority.**
  * When `job_card.status = CLOSED`, the LLM cannot mutate finance or workflow state.
  * Post-close changes require an Owner action and an audit log entry.
* **All invoices must include GST + HSN/HSN/SAC when applicable.**
  * GST computation is deterministic.
  * HSN/SAC mapping must be stored on the line item.
* **All tenants are isolated.**
  * No cross-tenant reads.
  * No cross-tenant writes.
  * No shared identifiers that can be enumerated.
