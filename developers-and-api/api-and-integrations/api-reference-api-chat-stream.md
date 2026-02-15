---
description: Streaming chat endpoint behavior and integration notes.
---

# API Reference (\`/api/chat/stream\`)

### Endpoint

* `POST /api/chat/stream`

### What it does

Streams the AI response over SSE. Use it for “typing” responses in the UI.

### Expected behavior

* Auth required.
* Returns events until completion.
* Client must handle disconnects.

{% hint style="info" %}
For the full backend contract list, also see [EKA-AI API Contracts](../backend/backend/api_contracts.md).
{% endhint %}
