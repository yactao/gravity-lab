---
name: multi-model-orchestration
description: Use when a task would benefit from external AI model perspectives — DeepSeek for code/debugging, Kimi for research/long context analysis. Enables multi-model pipelines and parallel agent work.
---

# Multi-Model Orchestration

## Overview

Dispatch tasks to external AI models (DeepSeek, Kimi/Moonshot) via a unified CLI. Use this when the current task benefits from specialized model strengths or multiple perspectives.

## When to Use

- **Code generation/review** needing a second opinion → DeepSeek (coder, reviewer)
- **Long document analysis** → Kimi (researcher, 128k context)
- **Multi-perspective pipeline** → research → code → test → review chain
- **Parallel investigations** → different models test different hypotheses
- **Test generation** → DeepSeek tester role for comprehensive test suites

## Available Roles

| Role | Provider | Strength |
|---|---|---|
| `coder` | DeepSeek | Code generation, algorithms, refactoring |
| `researcher` | Kimi | Long context analysis, documentation, summaries |
| `reviewer` | DeepSeek | Code review, bug detection, quality |
| `tester` | DeepSeek | Test generation, edge cases, coverage |
| `architect` | DeepSeek | System design, patterns, architecture |
| `debugger` | DeepSeek | Error analysis, hypothesis testing |

## How to Use

### Single Agent Ask
```bash
node agents-cli.js ask --role coder "Write a binary search in JavaScript"
node agents-cli.js ask --role researcher "Analyze the trade-offs between REST and GraphQL"
```

### Pipeline (research → code → test → review)
```bash
node agents-cli.js pipeline --task "Implement an LRU cache in JavaScript"
```

### Parallel Tasks
```bash
node agents-cli.js parallel --tasks '[{"role":"coder","task":"Write a sort function"},{"role":"tester","task":"Write sort tests"}]'
```

### Custom Pipeline Stages
```bash
node agents-cli.js pipeline --task "Design a user auth system" --stages architect,coder,tester,reviewer
```

### Test Connectivity
```bash
node agents-cli.js test
node agents-cli.js test --provider deepseek
```

## Output Formats

- Default: markdown (readable in Antigravity)
- JSON: add `--json` flag for programmatic parsing

## Integration with Other Skills

- Use with **writing-plans** to get multi-model input on architecture
- Use with **systematic-debugging** to test hypotheses via DeepSeek debugger
- Use with **test-driven-development** to generate tests via tester role
- Use with **requesting-code-review** to get external review from DeepSeek
