---
description: How you handle customer issues and outages during Public GA.
---

# Support & Incident Response

Public GA needs a real support loop. Define it before you push marketing.

### Support channels

Primary channel: **Support email**.

Define:

* Support hours
* Expected first response time
* What info to include in a ticket

### Support email address

Set one public address and use it everywhere:

* `connect@eka-ai.in`

Update:

* Signup screen
* App footer
* Terms + Privacy pages

### What users must include

* Workshop name
* User email
* Phone number
* Steps to reproduce
* Screenshot or screen recording
* Approx time and timezone

### Triage tags

* **Login / Access**
* **Billing**
* **Payments (PayU)**
* **Job cards**
* **Invoices**
* **WhatsApp notifications**
* **AI chat**
* **Performance**

### Incident severity

* **SEV-1**: Signup/login broken, data leak risk, payments down.
* **SEV-2**: Core workflow degraded, partial outage.
* **SEV-3**: Minor bug, workaround exists.

### SEV-1 process

{% stepper %}
{% step %}
### Detect

* Confirm impact.
* Identify affected users.
* Start an incident log.
{% endstep %}

{% step %}
### Contain

* Disable the broken feature.
* Roll back if needed.
* Block bad traffic if needed.
{% endstep %}

{% step %}
### Communicate

* Post a short status update.
* Reply to active support threads.
* Give an ETA only if you have one.
{% endstep %}

{% step %}
### Resolve

* Deploy the fix.
* Monitor recovery.
* Confirm with a fresh signup.
{% endstep %}

{% step %}
### Learn

* Write a 10-line postmortem.
* Add regression test.
* Add a runbook note.
{% endstep %}
{% endstepper %}

### PayU-specific diagnostics (copy/paste into tickets)

Ask for:

* `txnid` / payment reference
* Amount and timestamp
* Customer email used at checkout
* Screenshot of PayU result page (success/failure)
* Screenshot of the in-app **Payment pending** screen (if shown)

Check:

* Webhook logs for the `txnid`
* Internal subscription state vs PayU payment status
* Duplicate webhook deliveries and idempotency handling
* Redirect callback happened but webhook missing (common cause of “paid but not activated”)
* Webhook failures triggering retries (5xx spikes, timeouts)

### Webhook acknowledgement policy (for support + on-call)

This is the policy we expect from the webhook handler:

* **2xx** only after a durable write (event stored / job enqueued).
* **5xx** on transient failures (DB down, queue down, timeout) to trigger retries.
* **4xx** on permanent failures (invalid signature/payload). No retries expected.

Use this to explain to customers why “success page” != “activated yet”.

Response template (email):

* Confirm you received the payment reference (`txnid`).
* Tell them you activate access only after PayU confirmation.
* Give an ETA range if you have one.
* Ask them to retry after a few minutes.
* If it persists, tell them you will reconcile manually.

### Links you’ll use during incidents

* [Production Deployment Guide](../developers-and-api/deployment-and-ops/docs/production_deployment.md)
* [Production Deployment Checklist](../developers-and-api/backend/backend/deployment/production_deployment_checklist.md)
