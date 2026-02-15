---
description: >-
  The governance layers that prevent unsafe, out-of-domain, or unauthorized
  actions.
---

# The "4-Gate" Safety System (The Constitution)

EKA-AI runs governed workflows.

Every AI request must pass all four gates.

Gates are enforced by the Governance Engine (`ai_governance.py`).

### 1) Domain gate

Blocks anything outside automobiles and workshop operations.

Allowed examples:

* Engine overheating diagnosis questions
* Drafting a GST invoice from job card context

Blocked examples:

* Medical advice
* General trivia
* Creative writing requests

### 2) Confidence gate

No guessing.

Threshold: **0.90 (90%)**.

If confidence is below the threshold:

* EKA-AI asks clarifying questions.
* EKA-AI proposes a checklist to collect missing signals.
* EKA-AI follows a root-cause flow instead of guessing.

### 3) Context gate

Automotive advice needs context.

Required context for technical outputs:

* Brand
* Model
* Year
* Fuel type

EKA-AI should also use:

* Recent job cards
* Photos and inspection artifacts

### 4) Permission gate (RBAC)

Actions are permissioned.

Typical split:

* **Technician**: diagnostics, checklist updates, job progress updates
* **Owner**: pricing catalogs, invoice approval, billing and settings

If the user lacks permission, EKA-AI must refuse the action.

{% hint style="warning" %}
If an action is blocked, the UI should explain why. It should also show the next allowed step.
{% endhint %}
