---
description: The governed workflow from check-in to GST invoice and closure.
---

# Job Card → Invoice (end-to-end)

### Core rule

Invoices are generated from job cards.

Not from free-text.

{% include "../.gitbook/includes/platform-law-non-negotiable-rules.md" %}

### End-to-end flow

{% stepper %}
{% step %}
### 1) Vehicle check-in

Capture:

* vehicle identifiers
* customer identity
* odometer
* fuel level
* photos

Create `job_card` in `DRAFT`.
{% endstep %}

{% step %}
### 2) Digital job card creation

Populate the mega template sections.

Attach artifacts as immutable references.
{% endstep %}

{% step %}
### 3) Diagnosis

Record:

* symptoms
* tests performed
* probable causes
* confidence score

If confidence is below 0.90, ask questions.
{% endstep %}

{% step %}
### 4) Estimate generation

Generate an estimate draft from:

* labor catalog
* parts catalog
* fleet contract rates (if fleet)

Return ranges to the UI.

Store exact numbers only in server engines.
{% endstep %}

{% step %}
### 5) Approval

Capture approval with:

* digital signature
* timestamp
* approved scope

Approval is required before work execution.
{% endstep %}

{% step %}
### 6) Work execution

Track:

* technician assignments
* time
* parts consumption
* deviations

Deviations require re-approval.
{% endstep %}

{% step %}
### 7) PDI

Run PDI checklists.

Attach photo evidence.

Block delivery if required items are missing.
{% endstep %}

{% step %}
### 8) Parts + HSN tagging

Each line item must store:

* part/labor code
* HSN (parts) or SAC (services)
* tax category

HSN/SAC is persisted on the line item.
{% endstep %}

{% step %}
### 9) GST calculation

Compute tax deterministically:

* same state → CGST + SGST
* different state → IGST

Store breakdown per rate.
{% endstep %}

{% step %}
### 10) Invoice generation

Create invoice from job card snapshot.

Apply:

* MG validation (fleet)
* discount boundaries
* rounding rules

Generate PDF from structured fields.
{% endstep %}

{% step %}
### 11) Job card closure

Set `job_card.status = CLOSED`.

After closure:

* LLM cannot mutate state.
* edits require Owner flow + audit log.
{% endstep %}
{% endstepper %}

### Reference data model (minimal)

Use this as the baseline mapping.

* `tenants`
* `workshops`
* `users`
* `vehicles`
* `customers`
* `job_cards`
* `job_card_artifacts`
* `parts_catalog`
* `labor_catalog`
* `estimates`
* `approvals`
* `invoices`
* `invoice_line_items`
* `tax_lines`
* `audit_logs`

### Reference API surface (minimal)

Routes vary by implementation.

Keep these invariants:

* job card create/update is separate from invoice finalize.
* approvals are first-class objects.
* invoice finalization is idempotent.

Typical endpoints:

* `POST /job-cards`
* `PATCH /job-cards/{id}`
* `POST /job-cards/{id}/estimate`
* `POST /approvals`
* `POST /invoices/draft`
* `POST /invoices/{id}/finalize`
* `GET /invoices/{id}/pdf`

### Part codes and HSN/SAC strategy

Treat part/labor codes as catalog identifiers.

Recommended fields on **parts** catalog items:

* `part_code` (internal SKU)
* `mfg_part_number` (OEM or aftermarket)
* `brand`
* `hsn_code`
* `tax_rate`
* `unit`

Recommended fields on **labor** catalog items:

* `labor_code`
* `sac_code`
* `tax_rate`

Rules:

* Invoice line items must copy `part_code` + `hsn_code` from the parts catalog.
* Labor line items must copy `labor_code` + `sac_code` from the labor catalog.
* If HSN/SAC is missing, invoice finalization must be blocked.

Never ask the LLM to infer HSN/SAC.

### Compliance mapping (what must be provable)

* Approval exists before work execution.
* Deviations create a new approval.
* GST breakup is stored, not recomputed.
* Finalized invoice PDF has a stable checksum.

### Invoice structure (GST)

Minimum invoice header fields:

* seller legal name + GSTIN
* invoice number + date
* place of supply
* customer name + address
* customer GSTIN (optional)

Minimum line item fields:

* description
* qty
* unit price
* taxable value
* HSN/SAC
* GST rate
* CGST/SGST/IGST amounts

### PDF structure (minimum)

PDF must be a render of stored fields.

Avoid “recomputing” inside the PDF renderer.

Include:

* invoice header
* line items
* tax breakup
* totals
* signature block
* terms
