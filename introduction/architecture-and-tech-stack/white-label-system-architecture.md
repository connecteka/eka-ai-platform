---
description: Custom domains, brand overrides, and feature restriction per tenant.
---

# White-label system architecture

### What white-label means

A tenant can ship EKA-AI under their brand.

The platform remains the same security boundary.

### Custom domain routing

Two common patterns:

* `tenant.eka-ai.in` subdomains.
* `app.customer-domain.com` custom domains.

Requirements:

* domain → tenant mapping table.
* TLS provisioning.
* strict host validation.

### Brand overrides

Store tenant brand config server-side.

Typical overrides:

* logo
* colors
* app name
* email sender name
* PDF header/footer

### Feature restriction

White-label often needs feature control.

Implement restrictions as entitlements.

Examples:

* hide marketplace
* restrict exports
* disable AI chat

### Deployment notes

* separate staging domain per tenant.
* separate email templates per brand.
* separate invoice numbering prefix per tenant.
