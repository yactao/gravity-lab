---
description: Orchestrate multi-model agent team for complex tasks using DeepSeek and Kimi APIs
---

# Orchestrate Multi-Model Agents

Use this workflow to coordinate external AI agents (DeepSeek, Kimi) for complex tasks.

## Steps

1. **Verify API connectivity**
// turbo
```bash
node agents-cli.js test
```

2. **Choose execution mode based on task:**

   - **Single question** → `node agents-cli.js ask --role <role> "<task>"`
   - **Full pipeline** → `node agents-cli.js pipeline --task "<task>"`
   - **Parallel work** → `node agents-cli.js parallel --tasks '<json>'`

3. **Review results** from the agent output

4. **Integrate** the agent's output into your current work

## Available Roles
- `coder` (DeepSeek) — code generation
- `researcher` (Kimi) — analysis, long docs
- `reviewer` (DeepSeek) — code review
- `tester` (DeepSeek) — test generation
- `architect` (DeepSeek) — system design
- `debugger` (DeepSeek) — error analysis
