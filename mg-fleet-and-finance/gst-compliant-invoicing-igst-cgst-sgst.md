---
description: GST logic, invoice fields, and compliance notes.
---

# GST-Compliant Invoicing (IGST/CGST/SGST)

Invoices must be GST-correct. Keep the logic deterministic.

### Basic rule

* Same state: CGST + SGST
* Different states: IGST

### What an invoice should include

* GSTIN (seller)
* Customer GSTIN (if provided)
* HSN/SAC codes (if applicable)
* Tax breakup
* Place of supply

{% hint style="warning" %}
Have a CA review the final invoice format. Docs are not legal advice.
{% endhint %}
