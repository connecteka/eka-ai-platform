---
description: 'How to build on EKA-AI safely: APIs, plugins, data, and governance.'
---

# Developer handbook

### Non-negotiables

{% include "../.gitbook/includes/platform-law-non-negotiable-rules.md" %}

### Key concepts

* tenant isolation
* governed actions
* deterministic finance engines
* append-only audit logs

### Integration paths

* APIs: [API & Integrations](api-and-integrations/)
* Streaming chat: [API Reference (`/api/chat/stream`)](api-and-integrations/api-reference-api-chat-stream.md)
* Webhooks: [Webhooks & Integrations](api-and-integrations/webhooks-and-integrations.md)
* Plugins: [Plugin Marketplace](plugin-marketplace.md)

### Build rules

* do not trust client fields for tenant scoping.
* do not compute taxes in the UI.
* do not generate invoices from free-text.
* do not store secrets in plugins.
