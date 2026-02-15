---
description: When RBI rules apply, what to avoid, and what controls to add.
---

# RBI compliance (if financial flows expand)

### Scope

EKA-AI is primarily a workshop operations system.

RBI compliance becomes relevant only if you handle regulated financial activity.

This is an engineering risk note.

It is not legal advice.

### When RBI scope may trigger

Treat these as escalation triggers:

* storing card details or bank credentials
* holding customer funds (wallet / stored value)
* facilitating lending, credit lines, or BNPL
* issuing payment instruments
* doing settlement or payouts (beyond a payment gateway)

### Current safe posture (recommended)

* Use PayU as the payment processor.
* Do not store card data.
* Do not build an internal wallet.
* Do not promise “returns” or “interest”.

### Controls to add if you expand scope

* segregated ledger with immutable entries
* reconciliation jobs and exception queues
* KYC/AML workflows if required
* enhanced audit logs for every financial event
* policy docs reviewed by counsel

### Evidence to keep

* payment webhook events (append-only)
* invoice/receipt linkage to payment IDs
* refund and cancellation approvals
* reconciliation reports
