#!/usr/bin/env node

/**
 * agents-cli.js — CLI for the Multi-Model Agent Orchestration System
 * 
 * Usage:
 *   node agents-cli.js test --provider deepseek
 *   node agents-cli.js ask --role coder "Write a fibonacci function"
 *   node agents-cli.js ask --provider kimi --model moonshot-v1-auto "Analyze this code"
 *   node agents-cli.js pipeline --task "Implement an LRU cache"
 *   node agents-cli.js parallel --tasks '[{"role":"coder","task":"..."},{"role":"reviewer","task":"..."}]'
 */

import Orchestrator from './lib/orchestrator/orchestrator.js';
import llmClient from './lib/orchestrator/llm-client.js';
import config, { getRoleConfig } from './lib/orchestrator/config.js';
import { formatJSON } from './lib/orchestrator/output-formatter.js';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';

const args = process.argv.slice(2);
const command = args[0];

function parseFlag(flag) {
    const idx = args.indexOf(flag);
    if (idx === -1 || idx + 1 >= args.length) return null;
    return args[idx + 1];
}

function hasFlag(flag) {
    return args.includes(flag);
}

function getPositionalAfterFlags() {
    // Get the last argument that isn't a flag or flag value
    let i = 1; // skip command
    while (i < args.length) {
        if (args[i].startsWith('--')) {
            i += 2; // skip flag + value
        } else {
            return args[i];
        }
    }
    return null;
}

const format = hasFlag('--json') ? 'json' : 'markdown';

function output(data, markdownContent) {
    if (format === 'json') {
        console.log(formatJSON(data));
    } else {
        console.log(markdownContent || formatJSON(data));
    }
}

// ─────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────

async function cmdTest() {
    const providerName = parseFlag('--provider');

    if (!providerName) {
        // Test all providers
        console.log('🔍 Testing all providers...\n');
        for (const name of Object.keys(config.providers)) {
            try {
                const result = await llmClient.testConnection(name);
                if (result.status === 'ok') {
                    console.log(`✅ ${config.providers[name].name}: OK (${result.response}) — ${result.elapsed}ms`);
                } else {
                    console.log(`❌ ${config.providers[name].name}: ${result.error}`);
                }
            } catch (e) {
                console.log(`❌ ${config.providers[name].name}: ${e.message}`);
            }
        }
        return;
    }

    console.log(`🔍 Testing ${providerName}...\n`);
    const result = await llmClient.testConnection(providerName);
    output(result, result.status === 'ok'
        ? `✅ ${providerName}: OK\n   Model: ${result.model}\n   Response: ${result.response}\n   Time: ${result.elapsed}ms`
        : `❌ ${providerName}: ${result.error}`
    );
}

async function cmdAsk() {
    const role = parseFlag('--role') || 'coder';
    const provider = parseFlag('--provider');
    const model = parseFlag('--model');
    const task = getPositionalAfterFlags();

    if (!task) {
        console.error('❌ Missing task. Usage: node agents-cli.js ask --role coder "your task here"');
        process.exit(1);
    }

    const orchestrator = new Orchestrator();

    const agentConfig = { name: `${role}-agent`, role };
    if (provider) agentConfig.provider = provider;
    if (model) agentConfig.model = model;

    orchestrator.addAgent(agentConfig);

    console.log(`🤖 Asking ${role} agent (${provider || 'default'})...\n`);
    const result = await orchestrator.ask(`${role}-agent`, task);

    if (result.status === 'completed') {
        output(result, [
            `## 🤖 ${result.agent} (${result.role})`,
            `> Provider: **${result.provider}** | Model: **${result.model}** | Time: **${result.elapsed}ms**\n`,
            result.response,
        ].join('\n'));
    } else {
        console.error(`❌ Error: ${result.error}`);
        process.exit(1);
    }
}

async function cmdPipeline() {
    const task = parseFlag('--task');
    const context = parseFlag('--context') || '';
    const stagesStr = parseFlag('--stages');

    if (!task) {
        console.error('❌ Missing task. Usage: node agents-cli.js pipeline --task "your task"');
        process.exit(1);
    }

    const stages = stagesStr ? stagesStr.split(',') : undefined;

    console.log('🔄 Starting pipeline: ' + (stages || ['researcher', 'coder', 'tester', 'reviewer']).join(' → ') + '\n');

    const orchestrator = new Orchestrator();
    const result = await orchestrator.runPipeline(task, { stages, context });

    output(result, result.formatted + '\n' + orchestrator.getFormattedSummary());
}

async function cmdParallel() {
    const tasksJson = parseFlag('--tasks');

    if (!tasksJson) {
        console.error('❌ Missing tasks. Usage: node agents-cli.js parallel --tasks \'[{"role":"coder","task":"..."}]\'');
        process.exit(1);
    }

    let tasks;
    try {
        tasks = JSON.parse(tasksJson);
    } catch (e) {
        console.error('❌ Invalid JSON for --tasks');
        process.exit(1);
    }

    const orchestrator = new Orchestrator();

    // Create agents and assignments
    const assignments = tasks.map((t, i) => {
        const name = t.name || `${t.role}-${i + 1}`;
        orchestrator.addAgent({
            name,
            role: t.role,
            provider: t.provider,
            model: t.model,
        });
        return { agentName: name, task: t.task };
    });

    console.log(`⚡ Running ${assignments.length} tasks in parallel...\n`);

    const result = await orchestrator.runParallel(assignments);
    output(result, result.formatted + '\n' + orchestrator.getFormattedSummary());
}

async function cmdRoles() {
    console.log('# Available Roles\n');
    for (const [name, role] of Object.entries(config.roles)) {
        console.log(`## ${name}`);
        console.log(`- Provider: ${role.provider}`);
        console.log(`- Model: ${role.model}`);
        console.log(`- Prompt: ${role.systemPrompt.substring(0, 100)}...`);
        console.log('');
    }
}

async function cmdProviders() {
    console.log('# Available Providers\n');
    for (const [name, provider] of Object.entries(config.providers)) {
        const hasKey = provider.apiKey && !provider.apiKey.startsWith('sk-your-');
        console.log(`## ${provider.name}`);
        console.log(`- Key: ${hasKey ? '✅ configured' : '❌ not set'}`);
        console.log(`- Base URL: ${provider.baseURL}`);
        console.log(`- Models: ${provider.models.join(', ')}`);
        console.log('');
    }
}

async function cmdOcr() {
    const imagePath = parseFlag('--image');
    const prompt = parseFlag('--prompt') || 'Extract all text from this image. Output in clean markdown format.';
    const outputPath = parseFlag('--output');

    if (!imagePath) {
        console.error('❌ Missing image. Usage: node agents-cli.js ocr --image "path/to/image.png"');
        process.exit(1);
    }

    const resolvedPath = resolve(imagePath);
    if (!existsSync(resolvedPath)) {
        console.error(`❌ File not found: ${resolvedPath}`);
        process.exit(1);
    }

    // Detect MIME type
    const ext = extname(resolvedPath).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png', '.webp': 'image/webp',
        '.gif': 'image/gif', '.bmp': 'image/bmp',
    };
    const mimeType = mimeTypes[ext];
    if (!mimeType) {
        console.error(`❌ Unsupported image format: ${ext}. Supported: ${Object.keys(mimeTypes).join(', ')}`);
        process.exit(1);
    }

    // Read and encode image
    const imageBuffer = readFileSync(resolvedPath);
    const imageBase64 = imageBuffer.toString('base64');
    const sizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);

    console.log(`📷 OCR: ${resolvedPath} (${sizeMB} MB)`);
    console.log(`📝 Prompt: ${prompt}\n`);

    const roleConfig = getRoleConfig('ocr');

    try {
        const result = await llmClient.chatWithImage(
            roleConfig.provider,
            roleConfig.model,
            roleConfig.systemPrompt,
            prompt,
            imageBase64,
            mimeType
        );

        const resultData = {
            status: 'completed',
            image: resolvedPath,
            provider: result.provider,
            model: result.model,
            elapsed: result.elapsed,
            response: result.content,
        };

        if (outputPath) {
            const { writeFileSync } = await import('fs');
            writeFileSync(outputPath, result.content, 'utf-8');
            console.log(`💾 Output saved to: ${outputPath}\n`);
        }

        output(resultData, [
            `## 📷 OCR Result`,
            `> Provider: **${result.provider}** | Model: **${result.model}** | Time: **${result.elapsed}ms**\n`,
            result.content,
        ].join('\n'));
    } catch (error) {
        console.error(`❌ OCR failed: ${error.message}`);
        process.exit(1);
    }
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

const commands = {
    test: cmdTest,
    ask: cmdAsk,
    pipeline: cmdPipeline,
    parallel: cmdParallel,
    roles: cmdRoles,
    providers: cmdProviders,
    ocr: cmdOcr,
};

if (!command || command === '--help' || command === '-h') {
    console.log(`
🤖 Multi-Model Agent Orchestration CLI

Usage:
  node agents-cli.js <command> [options]

Commands:
  test         Test API connectivity
  ask          Ask a single agent a question
  pipeline     Run a task through research → code → test → review
  parallel     Run multiple tasks in parallel
  ocr          Extract text from an image (OCR)
  roles        List available agent roles
  providers    List available API providers

Options:
  --provider   API provider (deepseek, kimi)
  --model      Specific model to use
  --role       Agent role (coder, researcher, reviewer, tester, architect, debugger, ocr)
  --task       Task description (for pipeline)
  --tasks      JSON array of tasks (for parallel)
  --image      Path to image file (for ocr)
  --prompt     Custom OCR prompt (for ocr)
  --output     Save OCR result to file (for ocr)
  --stages     Comma-separated pipeline stages (for pipeline)
  --context    Additional context
  --json       Output in JSON format
  --help       Show this help

Examples:
  node agents-cli.js test
  node agents-cli.js test --provider deepseek
  node agents-cli.js ask --role coder "Write a binary search in JavaScript"
  node agents-cli.js pipeline --task "Implement an LRU cache in JavaScript"
  node agents-cli.js ocr --image "screenshot.png"
  node agents-cli.js ocr --image "document.jpg" --prompt "Extract the table data" --output result.md
  node agents-cli.js parallel --tasks '[{"role":"coder","task":"Write sort"},{"role":"tester","task":"Write sort tests"}]'
`);
    process.exit(0);
}

if (!commands[command]) {
    console.error(`❌ Unknown command: ${command}. Use --help to see available commands.`);
    process.exit(1);
}

try {
    await commands[command]();
} catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    if (hasFlag('--debug')) {
        console.error(error.stack);
    }
    process.exit(1);
}
