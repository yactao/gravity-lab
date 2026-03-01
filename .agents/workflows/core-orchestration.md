---
description: A workflow detailing how to orchestrate the core team of specialized agents from idea to reviewed code.
---

# Core Team Orchestration Workflow

This workflow guides you through using the `core-*` agents to build software systematically, using specialized roles for maximum quality and accountability.

## 1. Strategy & Research (Orchestrator & Researcher)
Before deciding *how* to build something, determine *what* needs to be built and gather context.

**Example Prompts:**
> "Act as the `core-orchestrator`. I want to build a [Feature]. What information do you need from me before we can start planning?"

If external knowledge or deep context is needed:
> "Act as the `core-researcher`. Read through the documentation for [Tool/API] and summarize the best practices for implementing [Feature]."

## 2. Challenging the Idea (Challenger)
Before locking in a plan, subject the idea to the "Devil's Advocate" to prevent over-engineering.

**Example Prompt:**
> "Act as the `core-challenger`. Review the current proposal/idea for [Feature]. What are the biggest risks, unwarranted assumptions, or simpler alternatives we are ignoring?"

## 3. System Design (Architect)
Once the idea survives the Challenger, have the Architect create the technical blueprint.

**Example Prompt:**
> "Act as the `core-architect`. Based on the agreed-upon requirements, design the technical approach for [Feature]. Provide component boundaries, API schemas, and data flow. Ensure it follows SOLID principles."

## 4. Implementation (Coder)
With a solid blueprint, generate the actual code.

**Example Prompt:**
> "Act as the `core-coder`. Strictly following the `core-architect`'s design below, write the implementation code for [Component/Module]. Ensure it includes appropriate comments and error handling."

## 5. Testing (Tester)
Simultaneously or immediately following implementation, write the tests.

**Example Prompt:**
> "Act as the `core-tester`. Write unit and integration tests for the code provided by the `core-coder`. Focus specifically on the edge cases and failure modes we discussed."

## 6. Final Review (Reviewer & Orchestrator)
Have the strict reviewer check the code, then the orchestrator synthesizes the result.

**Example Prompt:**
> "Act as the `core-reviewer`. Review the implemented code and tests against the original `core-architect` plan. Flag any deviations, security issues, or standard violations. Categorize your findings as CRITICAL, IMPORTANT, or NIT."

If everything looks good:
> "Act as the `core-orchestrator`. Synthesize the final accepted code and testing instructions into a clean summary for me."
