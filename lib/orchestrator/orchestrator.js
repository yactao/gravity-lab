import Agent from './agent.js';
import TaskManager from './task-manager.js';
import { formatResults, formatPipelineResults, formatSummary } from './output-formatter.js';

/**
 * Orchestrator — dispatches tasks to agents across multiple AI providers
 */
export default class Orchestrator {
    constructor() {
        this.agents = new Map();
        this.taskManager = new TaskManager();
        this.results = [];
        this.startTime = null;
    }

    /**
     * Create and register an agent
     */
    addAgent({ name, role, provider, model, systemPrompt }) {
        const agent = new Agent({ name, role, provider, model, systemPrompt });
        this.agents.set(name, agent);
        return agent;
    }

    /**
     * Get a registered agent
     */
    getAgent(name) {
        const agent = this.agents.get(name);
        if (!agent) throw new Error(`Agent "${name}" not found. Available: ${[...this.agents.keys()].join(', ')}`);
        return agent;
    }

    // ─────────────────────────────────────────────
    // Execution Modes
    // ─────────────────────────────────────────────

    /**
     * PARALLEL — Execute N tasks simultaneously on N agents
     * Each task is assigned to a different agent and runs concurrently.
     * 
     * @param {Array<{agentName: string, task: string}>} assignments
     */
    async runParallel(assignments) {
        this.startTime = Date.now();

        const promises = assignments.map(async ({ agentName, task }) => {
            const agent = this.getAgent(agentName);
            const taskEntry = this.taskManager.addTask({
                description: task.substring(0, 80) + (task.length > 80 ? '...' : ''),
                assignedTo: agentName,
            });

            this.taskManager.assignTask(taskEntry.id, agentName);

            const result = await agent.execute(task);

            if (result.status === 'completed') {
                this.taskManager.completeTask(taskEntry.id, result);
            } else {
                this.taskManager.failTask(taskEntry.id, result.error);
            }

            return result;
        });

        this.results = await Promise.all(promises);
        return {
            mode: 'parallel',
            results: this.results,
            summary: this.getSummary(),
            formatted: formatResults(this.results),
        };
    }

    /**
     * SEQUENTIAL — Execute tasks one after another, each receiving prior results as context
     * 
     * @param {Array<{agentName: string, task: string}>} steps
     */
    async runSequential(steps) {
        this.startTime = Date.now();
        this.results = [];
        let previousResult = null;

        for (const { agentName, task } of steps) {
            const agent = this.getAgent(agentName);

            // Inject previous result as context
            let fullTask = task;
            if (previousResult) {
                fullTask = `Previous step result:\n\`\`\`\n${previousResult.response}\n\`\`\`\n\nYour task: ${task}`;
            }

            const taskEntry = this.taskManager.addTask({
                description: task.substring(0, 80),
                assignedTo: agentName,
            });
            this.taskManager.assignTask(taskEntry.id, agentName);

            const result = await agent.execute(fullTask);

            if (result.status === 'completed') {
                this.taskManager.completeTask(taskEntry.id, result);
            } else {
                this.taskManager.failTask(taskEntry.id, result.error);
            }

            this.results.push(result);
            previousResult = result;
        }

        return {
            mode: 'sequential',
            results: this.results,
            summary: this.getSummary(),
            formatted: formatResults(this.results),
        };
    }

    /**
     * PIPELINE — A task flows through specialized roles: research → code → test → review
     * 
     * @param {string} task - The task description
     * @param {object} options - Pipeline options
     * @param {string[]} options.stages - Custom stages (default: research → code → test → review)
     * @param {string} options.context - Additional context
     */
    async runPipeline(task, options = {}) {
        this.startTime = Date.now();

        const stages = options.stages || ['researcher', 'coder', 'tester', 'reviewer'];
        const stagePrompts = {
            researcher: `Research and analyze the following task. Provide a structured analysis with key concepts, approaches, trade-offs, and recommendations.\n\nTask: ${task}`,
            coder: null, // Will be built dynamically with research result
            tester: null, // Will be built dynamically with code result
            reviewer: null, // Will be built dynamically with all previous results
        };

        this.results = [];
        const pipelineData = {};

        for (const stage of stages) {
            // Create agent for this stage if not already registered
            const agentName = `pipeline-${stage}`;
            if (!this.agents.has(agentName)) {
                this.addAgent({ name: agentName, role: stage });
            }

            const agent = this.getAgent(agentName);

            // Build the prompt based on stage and previous results
            let prompt;
            if (stage === 'researcher') {
                prompt = stagePrompts.researcher;
                if (options.context) prompt += `\n\nAdditional context:\n${options.context}`;
            } else if (stage === 'coder') {
                prompt = `Based on the following research analysis, write the implementation code.\n\n## Research Analysis\n${pipelineData.researcher}\n\n## Task\n${task}`;
            } else if (stage === 'tester') {
                prompt = `Based on the following code implementation, write comprehensive tests.\n\n## Implementation Code\n${pipelineData.coder}\n\n## Original Task\n${task}\n\nGenerate test cases covering: happy path, edge cases, error handling, and boundary conditions.`;
            } else if (stage === 'reviewer') {
                prompt = `Review the following implementation and tests for quality, correctness, and best practices.\n\n## Original Task\n${task}\n\n## Research\n${pipelineData.researcher || 'N/A'}\n\n## Implementation\n${pipelineData.coder || 'N/A'}\n\n## Tests\n${pipelineData.tester || 'N/A'}\n\nProvide a structured review with: strengths, issues (categorized by severity), and recommendations.`;
            } else {
                // Custom stage
                prompt = `${task}\n\nPrevious results:\n${JSON.stringify(pipelineData, null, 2)}`;
            }

            const taskEntry = this.taskManager.addTask({
                description: `[${stage.toUpperCase()}] ${task.substring(0, 60)}`,
                assignedTo: agentName,
            });
            this.taskManager.assignTask(taskEntry.id, agentName);

            const result = await agent.execute(prompt);

            if (result.status === 'completed') {
                this.taskManager.completeTask(taskEntry.id, result);
                pipelineData[stage] = result.response;
            } else {
                this.taskManager.failTask(taskEntry.id, result.error);
                pipelineData[stage] = `[FAILED: ${result.error}]`;
            }

            this.results.push({ ...result, stage });
        }

        return {
            mode: 'pipeline',
            stages,
            results: this.results,
            pipelineData,
            summary: this.getSummary(),
            formatted: formatPipelineResults(this.results, stages),
        };
    }

    /**
     * ASK — Single agent, single question
     */
    async ask(agentName, task) {
        this.startTime = Date.now();
        const agent = this.getAgent(agentName);
        const result = await agent.execute(task);
        this.results = [result];
        return result;
    }

    // ─────────────────────────────────────────────
    // Reporting
    // ─────────────────────────────────────────────

    /**
     * Get execution summary
     */
    getSummary() {
        const elapsed = this.startTime ? Date.now() - this.startTime : 0;
        const taskStatus = this.taskManager.getStatus();
        const agentInfos = [...this.agents.values()].map(a => a.getInfo());

        return {
            totalElapsed: elapsed,
            tasks: taskStatus,
            agents: agentInfos,
        };
    }

    /**
     * Get formatted markdown summary
     */
    getFormattedSummary() {
        return formatSummary(this.getSummary(), this.results);
    }

    /**
     * Get task list as markdown
     */
    getTaskMarkdown() {
        return this.taskManager.toMarkdown();
    }
}
