---
description: Decisions and product behavior for monetization at Public GA.
---

# Pricing, Trials, and Billing

Decision: **Paid from day 1**.

Make the billing behavior explicit. Avoid “surprise paywalls”.

### Pricing rules (lock these before GA)

Write down:

* Plan name(s) and price.
* Billing period (monthly/annual).
* Taxes (GST) handling.
* Refund policy.
* Cancellation behavior.

### Customer-facing pricing terms (copy/paste)

{% include "../.gitbook/includes/pricing-terms-customer-facing.md" %}

### Billing states to implement

* Paid active
* Payment failed
* Cancelled

For each state, define:

* What features are blocked.
* What pages are still accessible.
* What message is shown.

### In-product billing UX

* Put billing under an **Owner/Admin** area.
* Add a “Manage plan” entry point.
* Add a “Download invoices” area for payments.

### Payment provider

Payment provider: **PayU**.

Source of truth: **PayU webhook**. Do not activate access on the redirect result page.

Lock these before GA:

* Live merchant credentials are in production (not sandbox).
* Success and failure callbacks are handled.
* Webhooks are enabled in production.
* Webhook signature verification is enabled.
* Webhook processing is idempotent (duplicate deliveries are safe).
* Webhook retries do not cause double activation.
* A reconciliation job exists (PayU status vs internal status).
* Payment status is persisted and auditable.
* Invoice/receipt email behavior is defined.

#### Webhook retry policy (our stance)

Do not depend on PayU’s exact retry schedule. Assume **at-least-once delivery** and **duplicates**.

Rules:

* Return **2xx only after a durable write** (event stored / job enqueued).
* Return **5xx on transient failures** to trigger provider retries.
* Return **4xx on permanent failures** (invalid signature, invalid payload).
  * Do not retry these automatically.
* Keep response time low (target **< 2s**).
* Dedupe key must be stable (ex: `txnid` + status + amount).

Reference:

* [Production Deployment Guide](../developers-and-api/deployment-and-ops/docs/production_deployment.md) (PayU secrets)

### Redirect UX (webhook pending)

You will see cases where the user returns from PayU before the webhook lands. Handle this cleanly.

Requirements:

* Show a **Payment pending** screen after redirect.
* Auto-refresh status (poll) until activated.
* Let users manually refresh.
* Show a clear support CTA: `connect@eka-ai.in`.
* Never grant access from the redirect alone.

{% include "../.gitbook/includes/payment-confirmation-payu.md" %}

#### Draft UI copy (use this)

**Title:** Payment pending

**Body:**

We received your payment attempt.\
We are waiting for confirmation from PayU.\
This usually takes a few minutes.

**Primary action:** Refresh status

**Support line:**

Still stuck? Email `connect@eka-ai.in` with your payment reference (`txnid`).

### Metrics you must track

* Checkout started
* Checkout succeeded
* Checkout failed
* Payment failed
* Cancellation reason

{% hint style="info" %}
If payments are not live, do **not** ship “paid day‑1”. Switch to a manual payment flow until payments are stable.
{% endhint %}
