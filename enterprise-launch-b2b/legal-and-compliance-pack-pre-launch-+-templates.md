---
description: >-
  Required legal, compliance, and enterprise readiness documents before go-live.
  Includes copy/paste templates.
---

# Legal & Compliance Pack (Pre-launch + Templates)

### Use this page

Use this as a **launch blocker** list.

Use the templates to create customer-ready artifacts.

{% hint style="warning" %}
This is not legal advice.

Have counsel review anything you publish or sign.
{% endhint %}

### 1) Public-facing documents (minimum for any launch)

These should exist **before marketing or onboarding new customers**.

#### Must-have

* [ ] **Terms of Service** (SaaS)
* [ ] **Privacy Policy** (DPDP + GDPR-aligned)
* [ ] **Cookie Policy** (if you use cookies/analytics)
* [ ] **Refund / Cancellation policy** (if you charge online)
* [ ] **Security page** (high-level controls + contact)
* [ ] **Support policy** (support hours + channels + escalation)

#### Strongly recommended

* [ ] **Acceptable Use Policy (AUP)**
* [ ] **Subprocessor list** (Gemini, hosting, email, WhatsApp provider, etc.)
* [ ] **Data retention statement**
* [ ] **Pricing + tax disclosure** (GST clarity)
* [ ] **Responsible disclosure / security.txt**

References already in your docs:

* [Terms of Service](../legal-and-compliance/terms-of-service.md)
* [Privacy Policy & GDPR Data Erasure](../legal-and-compliance/privacy-policy-and-gdpr-data-erasure.md)
* [DPDP (India) compliance notes](../legal-and-compliance/dpdp-india-compliance-notes.md)
* [GST + HSN compliance handbook](../legal-and-compliance/gst-+-hsn-compliance-handbook.md)
* [Support & Incident Response](../launch-public-ga/support-and-incident-response.md)

### 2) Enterprise contract set (typical)

This is what enterprise procurement usually asks for.

#### Contract core

* [ ] MSA (Master Services Agreement) or SaaS Agreement
* [ ] SOW (Statement of Work) per rollout
* [ ] SLA (Service Level Agreement)
* [ ] DPA (Data Processing Addendum)
* [ ] Pricing schedule + payment terms

#### Enterprise security + compliance add-ons

* [ ] Subprocessors schedule
* [ ] Data residency commitment (if required)
* [ ] Breach notification clause
* [ ] Audit rights clause
* [ ] DR/BCP commitments
* [ ] Change management / release notification clause

### 3) Enterprise security packet (what security teams ask)

Prepare these once.

Keep them updated per release.

#### Must-have

* [ ] Security overview (architecture + controls)
* [ ] Data flow diagram (where customer data goes)
* [ ] Access control model (RBAC + admin paths)
* [ ] Audit logging overview
* [ ] Incident response plan
* [ ] Backup + recovery runbook + restore proof

#### Often requested

* [ ] Vulnerability management policy
* [ ] Secure SDLC / change control process
* [ ] Pen test report or executive summary
* [ ] Threat model (high-level is fine)
* [ ] RTO/RPO targets and DR test evidence
* [ ] ISO 27001 alignment statement (even if not certified)

References:

* [Security Standards (ISO 27001)](../developers-and-api/security/security-standards-iso-27001.md)
* [Security architecture](../developers-and-api/security/security-architecture.md)
* [Audit Logs & Financial Security](../mg-fleet-and-finance/audit-logs-and-financial-security.md)
* [EKA-AI Database Backup & Recovery](../developers-and-api/backend/backend/deployment/backup_configuration.md)

### 4) Go-live compliance checklist (agent-friendly)

Mark **PASS/FAIL** and attach evidence (links, screenshots, signed PDFs).

#### Legal publication

* [ ] Terms published and linked from footer
* [ ] Privacy published and linked from footer
* [ ] Refund policy published (if payments enabled)
* [ ] Support policy published (email + hours)

#### Data protection

* [ ] DPA available for enterprise customers
* [ ] Subprocessor list available and accurate
* [ ] Data retention documented
* [ ] Data deletion / erasure workflow tested

#### Payments (if enabled)

* [ ] GST fields and invoice numbering comply
* [ ] Payment terms disclosed
* [ ] Refund workflow tested end-to-end

#### Security readiness

* [ ] Incident response owner assigned
* [ ] Escalation contacts are correct
* [ ] Backup restore test recorded
* [ ] Monitoring + alerts enabled

### 5) Templates (copy/paste)

<details>

<summary>Template: Support policy (public)</summary>

#### Support policy

**Channels**

* Email: `support@…`
* Phone (optional): `+91 …`

**Support hours**

* Days: Mon–Sat
* Hours: 10:00–19:00 IST

**Severity definitions**

* Sev-1: complete outage, payments down, data loss risk
* Sev-2: major feature broken with no workaround
* Sev-3: degraded performance or partial feature impact
* Sev-4: questions, minor bugs

**Response targets**

* Sev-1: acknowledge in 30 minutes
* Sev-2: acknowledge in 2 hours
* Sev-3: acknowledge in 1 business day

**Escalation**

* If unresolved in X hours → escalate to on-call lead

</details>

<details>

<summary>Template: Subprocessors list</summary>

#### Subprocessors

List every vendor that can process customer data.

For each subprocessor include:

* Name
* Purpose
* Data categories
* Regions
* Link to vendor security page

Example entries:

* **Google (Gemini API)**
  * Purpose: AI inference
  * Data: user prompts, vehicle context
  * Region: (declare)
* **Firebase Hosting**
  * Purpose: web hosting
  * Data: access logs, static assets
  * Region: (declare)
* **Cloud Run / GCP**
  * Purpose: backend runtime
  * Data: application logs, API traffic
  * Region: (declare)
* **Supabase**
  * Purpose: auth + finance DB
  * Data: users, invoices, audit logs
  * Region: (declare)

</details>

<details>

<summary>Template: DPA (Data Processing Addendum) outline</summary>

#### DPA outline

* Parties and roles (Controller/Processor)
* Processing instructions
* Data categories and purpose
* Security measures (technical + organizational)
* Subprocessors and approvals
* Data subject rights handling
* Breach notification timeline
* Retention and deletion
* Audit and compliance
* Cross-border transfers (if any)

</details>

<details>

<summary>Template: SLA (Service Level Agreement) outline</summary>

#### SLA outline

* Availability target (monthly uptime)
* Maintenance window policy
* Incident severity definitions
* Support hours and response targets
* Service credits (if any)
* Exclusions (force majeure, customer misconfig)
* Monitoring method (how uptime is measured)

</details>

<details>

<summary>Template: Security overview (1–2 pages)</summary>

#### Security overview

**Architecture summary**

* Frontend hosting
* Backend runtime
* Datastores
* AI providers

**Identity and access**

* Auth methods
* RBAC model
* Admin actions

**Data protection**

* Encryption at rest
* Encryption in transit
* Backup and restore

**Auditability**

* Audit log coverage
* Financial change controls

**AppSec**

* Secure SDLC
* Dependency management
* Vulnerability management

**Incident response**

* Detection
* Escalation
* Communication

</details>

<details>

<summary>Template: Change management / release notice</summary>

#### Change management

**Release cadence**

* Regular releases: weekly / bi-weekly
* Emergency hotfix: anytime

**Customer notification**

* Notice period for breaking changes: X days
* Maintenance window notice: X hours

**What we notify**

* New features
* Bug fixes that change behavior
* Security patches
* Schema changes

</details>
