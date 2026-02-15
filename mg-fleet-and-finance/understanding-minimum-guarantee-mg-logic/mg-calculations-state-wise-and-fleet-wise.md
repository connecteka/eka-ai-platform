---
description: How MG is computed per state rules and per fleet contract context.
---

# MG calculations (state-wise and fleet-wise)

### Inputs

MG calculation must be input-driven.

Typical inputs:

* `tenant_id`
* `fleet_id`
* `contract_id`
* `job_card_id`
* `state_code` (for GST and local rules)
* `assured_amount` (MG)
* `actual_amount`

### State-wise behavior

State affects tax, not MG math.

MG math stays invariant:

* `billable_base = MAX(assured_amount, actual_amount)`

State adds deterministic rules:

* IGST vs CGST/SGST selection.
* invoice place-of-supply fields.
* state-specific rounding rules (if adopted).

### Fleet-wise behavior

Fleet context can modify _allowed line items_.

Examples:

* contract rate cards
* excluded parts categories
* capped labor hours

Fleet context cannot change the MG invariant.

### Output

Return a structured result:

* `billable_base`
* `delta_from_actual` (if MG uplift applies)
* `reason_codes` (why uplift applied)
* `proof` (inputs hash + rule version)

{% hint style="info" %}
If you must change MG rules, bump a rule version. Keep both versions auditable.
{% endhint %}
