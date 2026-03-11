---
description: Orchestrating the Aïna Software Factory Agents (Digital Labor)
---

# Aïna Software Factory Orchestration Workflow

This workflow describes how the Aïna SaaS Marketplace agents collaborate asynchronously to deliver enterprise-grade software projects securely and frugally.

## 1. The Briefing Phase (Client -> Architect)
**Agent involved:** `aina-architect`
- The client enters the "Salle de Briefing" via the Web UI.
- The `aina-architect` agent gathers functional needs, SLA constraints, and budget.
- The architect drafts a technical Specification and an Architecture Decision Record (ADR).

## 2. Squad Mobilization & Queue Planning
**Tooling involved:** RabbitMQ, Orchestrator
- The architect fragments the project into discrete tasks and publishes them to RabbitMQ queues (e.g., `agent_leadtech_queue`, `agent_secu_queue`).
- Example: "Feature A is coded by `aina-fast-track`, audited by `aina-pentester`, and optimized by `aina-finops`".

## 3. Asynchronous Pipeline Execution (Digital Labor)
**Agents involved:** specialized escouades (`aina-clean-coder`, `aina-data-engineer`, etc.)
- **Step 3A (Build):** The required coder agent picks up the task, generates the code, and writes automated tests.
- **Step 3B (Audit):** The `aina-ciso` and `aina-pentester` automatically intercept the code to check for vulnerabilities and GDPR compliance (Data Governance).
- **Step 3C (Optimize):** The `aina-finops` agent analyzes the code for memory usage and suggests lighter dependencies to reduce cloud costs.

## 4. Delivery & Client Review
- The resulting code is packed into a Pull Request (PR).
- The `aina-architect` summarizes the work, the security score, and the performance metrics, and presents them back to the client in the chat interface.

// turbo-all
