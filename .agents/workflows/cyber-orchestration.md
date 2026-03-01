---
description: Orchestrate the cybersecurity agents (Red Team vs Blue Team) to audit and harden your code
---

# Cyber Security Orchestration Workflow (Red vs Blue Team)

This workflow guides you through using our specialized Cybersecurity Agent Team to conduct "Wargames" on your architecture or codebase. The goal is to ethically hack your own system before deploying it to production.

## 1. Threat Modeling & Brainstorming (CISO / Purple Team)
Before attacking, define the scope and the risk landscape of your project.

**Example Prompt:**
> "Act as the `cyber-ciso`. I am building [Feature/App], which uses [Tech Stack, e.g., NestJS, Next.js, MQTT]. Identify the top 5 theoretical attack vectors we should be worried about (e.g., OWASP Top 10, IoT interception, IAM bypass). Create a Threat Model report."

## 2. Ethical Hacking & Exploitation (Red Team / Attacker)
Unleash the attacker to try and break the code or architecture.

**Example Prompt:**
> "Act as the `cyber-red-team`. Review the code in [File/Folder] or the architecture described above. Try to find vulnerabilities like Injection, XSS, insecure direct object references (IDOR), or business logic flaws. Write a Proof of Concept (PoC) exploit or payload for any vulnerability you find. Do not hold back."

## 3. Defense & Patching (Blue Team / Defender)
Once the Red Team has found vulnerabilities, call the Blue Team to fix them robustly.

**Example Prompt:**
> "Act as the `cyber-blue-team`. The `cyber-red-team` just found the following vulnerabilities in our system: [List of Vulns]. Provide the exact code changes, firewall rules, or configuration updates needed to patch these holes. Explain why your patch is resilient."

## 4. Code Review & Compliance Audit (Security Auditor)
Ensure the patches didn't break compliance (e.g., GDPR, HIPAA) and that cryptography/authentication standards are respected.

**Example Prompt:**
> "Act as the `cyber-auditor`. Review the patches provided by the `cyber-blue-team`. Do they meet modern compliance requirements (GDPR)? Are we using the correct encryption standard (e.g., Argon2id for passwords, TLS 1.3)? Flag any remaining 'Security Smells'."

## 5. Security Posture Report (CISO)
Synthesize the findings of the wargame into an actionable Executive Summary.

**Example Prompt:**
> "Act as the `cyber-ciso`. Summarize the results of this Red vs Blue Team exercise. List the vulnerabilities that were found, how they were mitigated, and give this module a final Security Score (A to F)."
