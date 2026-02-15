---
description: >-
  Checkout, webhooks, idempotency, subscription tables, and GST on subscription
  invoices.
---

# Billing flow, PayU integration, and Supabase mapping

### Billing flow

1. user initiates checkout.
2. PayU redirect completes.
3. webhook confirms payment.
4. subscription state updates.
5. entitlements update.

Source of truth is the webhook.

### Idempotency

Every billing update must be idempotent.

Use a stable dedupe key.

Example:

* `payu_txnid + status + amount`

### Supabase billing mapping (reference)

Recommended tables:

* `billing_customers` (tenant ↔ PayU customer mapping)
* `subscriptions` (plan, status, renewal)
* `payment_events` (raw webhooks, append-only)
* `payments` (normalized payment records)
* `tax_invoices` (subscription invoice docs)

RLS rules:

* tenant can only read its own billing rows.
* only server roles can write payment events.

### GST on subscription invoices

If you issue GST invoices for SaaS:

* store seller GSTIN.
* store place of supply.
* compute GST deterministically.

{% hint style="warning" %}
Have a CA validate GST position for SaaS supply. This doc is not tax advice.
{% endhint %}

### References

* [Pricing, Trials, and Billing](./)
* [Webhooks & Integrations](../../developers-and-api/api-and-integrations/webhooks-and-integrations.md)
