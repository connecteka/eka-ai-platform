# Table of contents

## 👋 Introduction

* [🚗 EKA-AI Platform](README.md)
* [Executive Overview](introduction/executive-overview.md)
* [Investor narrative (deck backbone)](introduction/investor-narrative-deck-backbone.md)
* [Vision & Philosophy: Governed Intelligence](introduction/vision-and-philosophy-governed-intelligence.md)
* [The "4-Gate" Safety System (The Constitution)](introduction/the-4-gate-safety-system-the-constitution.md)
* [Governance Constitution (Platform Law)](introduction/governance-constitution-platform-law.md)
* [Architecture & Tech Stack](introduction/architecture-and-tech-stack/README.md)
  * [Multi-tenant architecture](introduction/architecture-and-tech-stack/multi-tenant-architecture.md)
  * [Tenant tiers and packaging](introduction/architecture-and-tech-stack/tenant-tiers-and-packaging.md)
  * [White-label system architecture](introduction/architecture-and-tech-stack/white-label-system-architecture.md)
  * [Backend service layout](introduction/architecture-and-tech-stack/backend-service-layout.md)
  * [LLM governance model (4 layers)](introduction/architecture-and-tech-stack/llm-governance-model-4-layers.md)
  * [Plugin system and sandboxing](introduction/architecture-and-tech-stack/plugin-system-and-sandboxing.md)
* [memory](introduction/memory/README.md)
  * [EKA-AI Platform - Product Requirements Document](introduction/memory/prd.md)
  * [EKA-AI master documentation prompt](introduction/memory/eka-ai-master-documentation-prompt.md)

## 🚀 Getting Started

* [Workshop Onboarding & Catalog Setup](getting-started/workshop-onboarding-and-catalog-setup.md)
* [Role-Based Access (Owners vs. Technicians)](getting-started/role-based-access-owners-vs.-technicians.md)
* [Dashboard Overview](getting-started/dashboard-overview.md)

## 🧠 The AI Assistant

* [How to Chat with EKA-AI](the-ai-assistant/how-to-chat-with-eka-ai.md)
* [Diagnostics & Troubleshooting](the-ai-assistant/diagnostics-and-troubleshooting.md)
* [Governance: Why the AI might "Block" you](the-ai-assistant/governance-why-the-ai-might-block-you.md)

## 🛠️ Core Modules

* [The 17-Section Job Card (Mega Template)](core-modules/the-17-section-job-card-mega-template.md)
* [PDI Checklists & Artifacts](core-modules/pdi-checklists-and-artifacts.md)
* [Digital Signatures & Customer Approvals](core-modules/digital-signatures-and-customer-approvals.md)
* [Job Card → Invoice (end-to-end)](core-modules/job-card-invoice-end-to-end.md)

## 🚛 MG Fleet & Finance

* [Understanding "Minimum Guarantee" (MG) Logic](mg-fleet-and-finance/understanding-minimum-guarantee-mg-logic/README.md)
  * [MG calculations (state-wise and fleet-wise)](mg-fleet-and-finance/understanding-minimum-guarantee-mg-logic/mg-calculations-state-wise-and-fleet-wise.md)
  * [Dynamic pricing boundaries and governance](mg-fleet-and-finance/understanding-minimum-guarantee-mg-logic/dynamic-pricing-boundaries-and-governance.md)
  * [MG loop: validation, errors, and compliance](mg-fleet-and-finance/understanding-minimum-guarantee-mg-logic/mg-loop-validation-errors-and-compliance.md)
* [GST-Compliant Invoicing (IGST/CGST/SGST)](mg-fleet-and-finance/gst-compliant-invoicing-igst-cgst-sgst.md)
* [Audit Logs & Financial Security](mg-fleet-and-finance/audit-logs-and-financial-security.md)

## 🔌 Developers & API

* [API & Integrations](developers-and-api/api-and-integrations/README.md)
  * [API Reference (\`/api/chat/stream\`)](developers-and-api/api-and-integrations/api-reference-api-chat-stream.md)
  * [Webhooks & Integrations](developers-and-api/api-and-integrations/webhooks-and-integrations.md)
* [Backend](developers-and-api/backend/README.md)
  * [backend](developers-and-api/backend/backend/README.md)
    * [EKA-AI API Contracts](developers-and-api/backend/backend/api_contracts.md)
    * [LangChain & LlamaIndex Integration Guide](developers-and-api/backend/backend/langchain_llamaindex_guide.md)
    * [deployment](developers-and-api/backend/backend/deployment/README.md)
      * [EKA-AI Database Backup & Recovery](developers-and-api/backend/backend/deployment/backup_configuration.md)
      * [EKA-AI Production Deployment Checklist](developers-and-api/backend/backend/deployment/production_deployment_checklist.md)
      * [EKA-AI SSL/TLS Configuration Guide](developers-and-api/backend/backend/deployment/ssl_configuration.md)
    * [load-tests](developers-and-api/backend/backend/load-tests/README.md)
      * [EKA-AI Load Testing Guide](developers-and-api/backend/backend/load-tests/load_testing_guide.md)
* [Frontend](developers-and-api/frontend/README.md)
  * [⚡ Quick Start Guide - Claude-like Frontend](developers-and-api/frontend/deployment_guide.md)
  * [🎨 Claude-like Frontend for EKA-AI](developers-and-api/frontend/quick_start.md)
  * [EKA-AI Claude-like Frontend - Project Summary](developers-and-api/frontend/project_summary.md)
  * [🚀 EKA-AI Claude-like Frontend - Deployment Guide](developers-and-api/frontend/claude_frontend_readme.md)
  * [Getting Started with Create React App](developers-and-api/frontend/frontend.md)
* [Deployment & Ops](developers-and-api/deployment-and-ops/README.md)
  * [docs](developers-and-api/deployment-and-ops/docs/README.md)
    * [🔥 Firebase Deployment Guide - EKA-AI Platform](developers-and-api/deployment-and-ops/docs/firebase_deployment.md)
    * [🔥 Firebase Studio Deployment - EKA-AI Platform](developers-and-api/deployment-and-ops/docs/firebase_readme.md)
    * [✅ Firebase Studio Deployment Checklist](developers-and-api/deployment-and-ops/docs/firebase_studio_checklist.md)
    * [Google OAuth & Gemini API Setup Guide](developers-and-api/deployment-and-ops/docs/google_setup.md)
    * [🚀 EKA-AI PRODUCTION IMPLEMENTATION GUIDE](developers-and-api/deployment-and-ops/docs/implementation_guide.md)
    * [✅ MASTER PROMPT EXECUTION COMPLETE](developers-and-api/deployment-and-ops/docs/master_prompt_execution_report.md)
    * [✅ EKA-AI PRODUCTION AUDIT - EXECUTIVE SUMMARY](developers-and-api/deployment-and-ops/docs/production_audit_summary.md)
    * [Production Deployment Guide](developers-and-api/deployment-and-ops/docs/production_deployment.md)
    * [✅ EKA-AI PRODUCTION DEPLOYMENT CHECKLIST](developers-and-api/deployment-and-ops/docs/production_deployment_checklist.md)
    * [🚀 EKA-AI PLATFORM v4.5 - PRODUCTION READINESS REPORT](developers-and-api/deployment-and-ops/docs/production_readiness_report.md)
    * [EKA-AI Testing Checklist](developers-and-api/deployment-and-ops/docs/testing_checklist.md)
  * [Cloud Run Deployment Guide](developers-and-api/deployment-and-ops/cloudrun_deployment.md)
  * [Google Cloud Platform (GCP) Migration Guide](developers-and-api/deployment-and-ops/gcp_migration_guide.md)
  * [Deployment architecture (reference)](developers-and-api/deployment-and-ops/deployment-architecture-reference.md)
* [CI/CD](developers-and-api/ci-cd/README.md)
  * [.github](developers-and-api/ci-cd/.github/README.md)
    * [EKA-AI Platform - GitHub Copilot Instructions](developers-and-api/ci-cd/.github/copilot-instructions.md)
    * [GitHub Actions Workflows](developers-and-api/ci-cd/.github/workflows.md)
  * [GitHub Actions Secrets Setup Guide](developers-and-api/ci-cd/github_secrets_setup.md)
  * [🔐 Migrate Secrets from Previous Repository](developers-and-api/ci-cd/migrate_secrets.md)
  * [Contributing to EKA-AI Platform](developers-and-api/ci-cd/contributing.md)
* [Testing](developers-and-api/testing/README.md)
  * [UI Testing Guide](developers-and-api/testing/testing.md)
  * [Auth-Gated App Testing Playbook](developers-and-api/testing/auth_testing.md)
  * [test\_result](developers-and-api/testing/test_result.md)
* [Security](developers-and-api/security/README.md)
  * [Security Standards (ISO 27001)](developers-and-api/security/security-standards-iso-27001.md)
  * [Security architecture](developers-and-api/security/security-architecture.md)
* [Internal Notes](developers-and-api/internal-notes/README.md)
  * [.emergent](developers-and-api/internal-notes/.emergent/README.md)
    * [EKA\_AI\_SYSTEM\_DOCUMENTATION](developers-and-api/internal-notes/.emergent/eka_ai_system_documentation.md)
    * [FRONTEND\_TESTING\_CHECKLIST](developers-and-api/internal-notes/.emergent/frontend_testing_checklist.md)
    * [PRODUCTION\_TESTING\_CHECKLIST](developers-and-api/internal-notes/.emergent/production_testing_checklist.md)
* [Plugin Marketplace](developers-and-api/plugin-marketplace.md)
* [Developer handbook](developers-and-api/developer-handbook.md)

## ⚖️ Legal & Compliance

* [Privacy Policy & GDPR Data Erasure](legal-and-compliance/privacy-policy-and-gdpr-data-erasure.md)
* [Terms of Service](legal-and-compliance/terms-of-service.md)
* [DPDP (India) compliance notes](legal-and-compliance/dpdp-india-compliance-notes.md)
* [GST + HSN compliance handbook](legal-and-compliance/gst-+-hsn-compliance-handbook.md)
* [RBI compliance (if financial flows expand)](legal-and-compliance/rbi-compliance-if-financial-flows-expand.md)

***

* [🚀 Launch (Public GA)](launch-public-ga/README.md)
  * [Public GA Launch Checklist](launch-public-ga/public-ga-launch-checklist.md)
  * [Self-serve Signup & Onboarding](launch-public-ga/self-serve-signup-and-onboarding.md)
  * [Pricing, Trials, and Billing](launch-public-ga/pricing-trials-and-billing/README.md)
    * [Plans and entitlements](launch-public-ga/pricing-trials-and-billing/plans-and-entitlements.md)
    * [Token, usage, and AI cost model](launch-public-ga/pricing-trials-and-billing/token-usage-and-ai-cost-model.md)
    * [Billing flow, PayU integration, and Supabase mapping](launch-public-ga/pricing-trials-and-billing/billing-flow-payu-integration-and-supabase-mapping.md)
  * [Support & Incident Response](launch-public-ga/support-and-incident-response.md)
  * [Legal (Terms + Privacy)](launch-public-ga/legal-terms-+-privacy.md)
  * [Analytics & KPIs](launch-public-ga/analytics-and-kpis.md)
  * [Changelog](launch-public-ga/changelog.md)
  * [VS Code AI Launch Agent Playbook](launch-public-ga/vs-code-ai-launch-agent-playbook.md)

## 🏢 Enterprise Launch (B2B)

* [Enterprise Launch Book (VS Code + Kimi Agent)](enterprise-launch-b2b/enterprise-launch-book-vs-code-+-kimi-agent.md)
* [Legal & Compliance Pack (Pre-launch + Templates)](enterprise-launch-b2b/legal-and-compliance-pack-pre-launch-+-templates.md)
