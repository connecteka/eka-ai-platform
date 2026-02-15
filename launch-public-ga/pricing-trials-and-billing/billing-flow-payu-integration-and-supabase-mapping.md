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

### Required endpoints (reference)

Keep names consistent across code + PayU dashboard config.

At minimum:

* **Webhook (server-to-server):** `POST /api/webhooks/payu`
  * Publicly reachable on **Cloud Run**.
  * Verifies signature.
  * Writes an append-only `payment_events` record.
  * Activates entitlement only after successful durable write.
* **Redirect landing (user browser):** a Firebase route such as:
  * `GET /billing/payu/result?txnid=...&status=success|failure`

{% hint style="info" %}
Treat redirect as _UI only_. It can show **Payment pending**.

Only the webhook can activate paid access.
{% endhint %}

### Idempotency

Every billing update must be idempotent.

Use a stable dedupe key.

Example:

* `payu_txnid + status + amount`

### Webhook verification (minimum)

* Reject missing/invalid signature (4xx).
* Return **2xx only after durable write** (event stored / job enqueued).
* Return **5xx** on transient failures so PayU retries.

Log these fields at minimum:

* `txnid`
* `status`
* `amount`
* `email` (if present)
* raw payload (for audit)
* signature verification result

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

### Reconciliation job (must exist for Paid day‑1)

Goal: handle “redirect success but webhook missing” and any delayed/failed webhook deliveries.

Minimum approach:

* a scheduled job (Cloud Scheduler → Cloud Run endpoint) that:
  * pulls PayU status for recent `txnid`s, or
  * replays stored `payment_events` stuck in `RECEIVED` but not `APPLIED`.

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
