---
description: The go/no-go checklist for launching EKA-AI with self-serve signups.
---

# Public GA Launch Checklist

This is the **go/no-go** list. Stop if any **Blocker** item is not done.

### Scope lock

* [ ] Launch date and timezone set.
* [ ] Target region(s) defined.
* [ ] The “happy path” is locked:
  * [ ] Signup → create workshop → create job card → customer approval (digital signature) → invoice → notify.

### Blockers (must be green)

#### Signup and access

* [ ] New users can sign up without staff help.
* [ ] Google OAuth consent screen is configured.
* [ ] Authorized redirect URIs are correct.
* [ ] No Google Workspace domain restriction is enabled.
* [ ] Login/logout works.
* [ ] First login lands on a guided setup.

#### Data isolation and permissions

* [ ] Workshop data is isolated per tenant.
* [ ] A user cannot access other workshops by ID.
* [ ] Owner actions are permission-gated.

#### Payments (if you charge at GA)

Decision: **Paid day‑1**.

* [ ] Pricing rules are implemented.
* [ ] PayU checkout is live in production (not sandbox).
* [ ] PayU success and failure callbacks work.
* [ ] PayU webhook endpoint is reachable from PayU.
* [ ] PayU webhook signature verification is enabled.
* [ ] Webhook processing is idempotent (duplicate deliveries are safe).
* [ ] Webhook retries do not double-charge or double-activate.
* [ ] Webhook handler returns 2xx only after durable write (event stored / job enqueued).
* [ ] Webhook handler returns 5xx on transient errors (to trigger retries).
* [ ] A reconciliation script/job exists for stuck payments.
* [ ] Access is activated **only** after a valid PayU webhook.
* [ ] Redirect result page never activates access by itself.
* [ ] Redirect shows **Payment pending** if webhook is delayed.
* [ ] Pending screen auto-refreshes and has support CTA: `connect@eka-ai.in`.
* [ ] Payment failure states are handled.
* [ ] Downgrade and cancellation behavior is defined.

#### Reliability

* [ ] Error tracking is enabled.
* [ ] Health checks are live.
* [ ] Backups are scheduled and tested.
* [ ] Rollback plan is rehearsed.

Use the existing production guides:

* [Production Deployment Guide](../developers-and-api/deployment-and-ops/docs/production_deployment.md)
* [Production Deployment Checklist](../developers-and-api/backend/backend/deployment/production_deployment_checklist.md)

### Launch-day runbook

{% stepper %}
{% step %}
### Freeze

* [ ] Cut a release tag.
* [ ] Stop non-urgent merges.
* [ ] Confirm env vars and secrets are final.
{% endstep %}

{% step %}
### Deploy

* [ ] Deploy backend.
* [ ] Deploy frontend.
* [ ] Run smoke tests.

Smoke tests:

* [ ] Signup
* [ ] Google login
* [ ] PayU payment: user returns from redirect and sees correct state
* [ ] Activation happens only after webhook (not redirect)
* [ ] “Payment pending” auto-refresh works if webhook is delayed
* [ ] Create job card
* [ ] Generate invoice
* [ ] AI chat response
* [ ] WhatsApp send (if enabled)
{% endstep %}

{% step %}
### Monitor

* [ ] Watch error rate and latency.
* [ ] Watch signup funnel completion.
* [ ] Confirm support channel is staffed.
{% endstep %}

{% step %}
### Announce

* [ ] Update website/app store listings.
* [ ] Post launch note.
* [ ] Add entry in [Changelog](changelog.md).
{% endstep %}
{% endstepper %}

### Post-launch (first 72 hours)

* [ ] Daily review: errors, drop-offs, top support issues.
* [ ] Patch fast. Keep releases small.
* [ ] Write a short “What broke” note after fixes.
