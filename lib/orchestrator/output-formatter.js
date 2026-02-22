/**
 * Output Formatter — format results for display in Antigravity or terminal
 */

/**
 * Format a list of results into readable markdown
 */
export function formatResults(results) {
    const lines = [];

    for (const result of results) {
        const statusIcon = result.status === 'completed' ? '✅' : '❌';
        lines.push(`## ${statusIcon} ${result.agent} (${result.role})`);
        lines.push(`> Provider: **${result.provider}** | Model: **${result.model}** | Time: **${formatElapsed(result.elapsed)}**`);
        lines.push('');

        if (result.status === 'completed') {
            lines.push(result.response);
        } else {
            lines.push(`**Error:** ${result.error}`);
        }

        lines.push('');
        lines.push('---');
        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Format pipeline results with stage headers
 */
export function formatPipelineResults(results, stages) {
    const lines = ['# 🔄 Pipeline Results\n'];

    const stageIcons = {
        researcher: '🔍',
        coder: '💻',
        tester: '🧪',
        reviewer: '📋',
        architect: '🏗️',
        debugger: '🐛',
    };

    for (const result of results) {
        const stage = result.stage || result.role;
        const icon = stageIcons[stage] || '▶️';
        const statusIcon = result.status === 'completed' ? '✅' : '❌';

        lines.push(`## ${icon} Stage: ${stage.toUpperCase()} ${statusIcon}`);
        lines.push(`> Agent: **${result.agent}** | Provider: **${result.provider}** | Model: **${result.model}** | Time: **${formatElapsed(result.elapsed)}**`);
        lines.push('');

        if (result.status === 'completed') {
            lines.push(result.response);
        } else {
            lines.push(`**Error:** ${result.error}`);
        }

        lines.push('');
        lines.push('---');
        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Format overall execution summary
 */
export function formatSummary(summary, results) {
    const lines = ['# 📊 Execution Summary\n'];

    // Timing
    lines.push(`**Total time:** ${formatElapsed(summary.totalElapsed)}`);
    lines.push('');

    // Task status
    const t = summary.tasks;
    lines.push(`**Tasks:** ${t.completed}/${t.total} completed, ${t.failed} failed, ${t.inProgress} in progress`);
    lines.push('');

    // Agents table
    lines.push('## Agents Used\n');
    lines.push('| Agent | Role | Provider | Model | Tasks | Status |');
    lines.push('|---|---|---|---|---|---|');

    for (const agent of summary.agents) {
        const status = agent.tasksFailed > 0 ? '⚠️' : '✅';
        lines.push(`| ${agent.name} | ${agent.role} | ${agent.provider} | ${agent.model} | ${agent.tasksCompleted + agent.tasksFailed} | ${status} |`);
    }

    lines.push('');

    // Token usage (if available)
    const totalTokens = results.reduce((acc, r) => {
        if (r.usage) {
            acc.input += r.usage.prompt_tokens || 0;
            acc.output += r.usage.completion_tokens || 0;
        }
        return acc;
    }, { input: 0, output: 0 });

    if (totalTokens.input > 0 || totalTokens.output > 0) {
        lines.push('## Token Usage\n');
        lines.push(`- **Input tokens:** ${totalTokens.input.toLocaleString()}`);
        lines.push(`- **Output tokens:** ${totalTokens.output.toLocaleString()}`);
        lines.push(`- **Total tokens:** ${(totalTokens.input + totalTokens.output).toLocaleString()}`);
    }

    return lines.join('\n');
}

/**
 * Format JSON output (for programmatic consumption by Antigravity)
 */
export function formatJSON(data) {
    return JSON.stringify(data, null, 2);
}

/**
 * Helper: format milliseconds to readable string
 */
function formatElapsed(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}
