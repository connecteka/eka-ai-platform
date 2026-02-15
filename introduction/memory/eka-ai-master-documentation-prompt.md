---
description: Internal prompt used to generate full platform documentation in GitBook.
---

# EKA-AI master documentation prompt

### GitBook AI custom instructions

Write in plain language.

Keep sentences short.

Avoid fluff.

Prioritize audit-grade specifics.

### Master prompt

Use this prompt as the seed for full documentation generation.

```
EKA-AI MASTER DOCUMENTATION GENERATION PROMPT

You are preparing full production documentation for:
EKA-AI by Go4Garage Private Limited

This is a multi-tenant automobile AI operating system.

Generate a complete documentation structure including:

1) Executive Overview
- Vision: Remove OEM monopoly
- Mission: Democratize AI for automobile ecosystem
- Industry Positioning
- Platform Sovereignty Strategy

2) Core Architecture
- Multi-Tenant Architecture
- Tenant isolation
- Starter / Professional / Fleet / Insurance / Parts / White-label tiers
- Data segregation logic
- Backend Structure (server.py, middleware, tenant_manager, gateway, plugin_system, white_label)
- LLM Layer (4-Layer Model): Context, Governance, Calculation, Execution
- Explain: "LLM is Governor, not Engine"

3) MG Model Documentation
- State-wise MG calculation
- Fleet-wise calculation
- Dynamic pricing boundaries
- Cost + Margin + Governance validation
- Loop mechanism
- Error protection
- Compliance enforcement
- Clarify:
  - LLM cannot output exact prices
  - Pricing logic is outside LLM
  - Only range retrieval allowed

4) Job Card to Invoice Flow
- Vehicle Check-In
- Digital Job Card Creation
- Diagnosis
- Estimate Generation
- Approval
- Work Execution
- PDI
- Parts + HSN tagging
- GST Calculation
- Invoice Generation
- Job Card Closure
Include:
- Database mapping
- API mapping
- Compliance mapping
- Invoice structure
- PDF structure
- Part codes
- HSN codes

5) Pricing & Governance
- Freemium, Pro, Enterprise, White-label, Fleet, Insurance
- Usage rules
- Token logic
- AI cost logic
- Billing flow
- PayU integration
- Supabase billing mapping
- GST logic

6) Security Architecture
- JWT logic
- Supabase RLS
- API Gateway control
- Plugin sandbox
- Tenant isolation
- Audit logging

7) Plugin Marketplace
- Developer onboarding
- Plugin permission system
- Revenue sharing logic
- Event hook system

8) White Label System
- Custom domain logic
- Brand override
- Feature restriction
- Subdomain deployment

9) Compliance
- GST
- HSN
- RBI (if financial flows)
- Data Protection (DPDP India)
- Audit logs

10) Deployment Architecture
- Firebase Studio (frontend)
- Supabase (DB)
- PayU (payments)
- AI APIs (Gemini / Claude / Kimi)
- Production readiness checklist

11) Governance Constitution
- LLM cannot output final prices
- LLM exits flow when Job Card = CLOSED
- Pricing logic outside LLM
- MG loop must validate before invoice
- All invoices must include GST + HSN
- All tenants are isolated

Format the documentation:
- Structured
- Clean
- Enterprise-level
- No fluff
- Technical
- Ready for investors
- Ready for compliance audit
- Ready for developers
```
