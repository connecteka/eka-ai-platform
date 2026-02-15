---
description: The default onboarding flow for workshops starting without sales help.
---

# Self-serve Signup & Onboarding

Self-serve means the product must explain itself. Every step must have a clear next action.

### Signup method

Decision: **Google sign-in (OAuth)**.

No domain restriction. Any Google account can sign in.

Use the existing setup guide:

* [Google OAuth & Gemini API Setup Guide](../developers-and-api/deployment-and-ops/docs/google_setup.md)

### Target flow

1. Create account
2. Consent + sign in with Google
3. Create workshop
4. Add first vehicle
5. Create first job card
6. Capture signature
7. Generate invoice
8. Notify customer

### Required screens and states

#### Signup

* Collect only what you need.
* Delay “business details” until after signup.
* Tell users what Google profile data you use (name, email).

#### OAuth edge cases

* Handle cancelled consent.
* Handle “email already exists”.
* Handle blocked accounts.
* Handle domain restrictions (not used at GA).

#### Workshop setup

Minimum fields to start:

* Workshop name
* Phone
* Address (optional at GA)

#### Empty states

Every empty state needs:

* One sentence explaining the value.
* One primary CTA.

Example CTAs:

* **Create job card**
* **Add vehicle**
* **Invite staff**

### Guided tour

If you keep the tour:

* Start it after workshop creation.
* Make it skippable.
* Store completion state per user.

### Invite + roles (recommended for GA)

* Add at least two roles:
  * **Owner/Admin**
  * **Staff**
* Owners can manage billing and integrations.

### Copy blocks you should have

* “What is EKA-AI?”
* “What data do we store?”
* “How to contact support?”
* “How payments are confirmed”

{% include "../.gitbook/includes/payment-confirmation-payu.md" %}

### Acceptance tests

* [ ] A new user completes onboarding in under 5 minutes.
* [ ] The flow works on mobile.
* [ ] No step requires contacting staff.
