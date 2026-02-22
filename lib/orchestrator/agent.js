import { getRoleConfig } from './config.js';
import llmClient from './llm-client.js';

/**
 * An Agent — a specialized AI worker with a role, model, and conversation history
 */
export default class Agent {
    constructor({ name, role, systemPrompt, provider, model }) {
        const roleConfig = role ? getRoleConfig(role) : null;

        this.name = name;
        this.role = role || 'custom';
        this.provider = provider || roleConfig?.provider;
        this.model = model || roleConfig?.model;
        this.systemPrompt = systemPrompt || roleConfig?.systemPrompt || 'You are a helpful assistant.';
        this.history = [];
        this.results = [];

        if (!this.provider || !this.model) {
            throw new Error(`Agent "${name}": provider and model are required (either via role or explicit params)`);
        }
    }

    /**
     * Execute a task — send it to the LLM and store the result
     */
    async execute(task, options = {}) {
        const messages = [
            { role: 'system', content: this.systemPrompt },
            ...this.history,
            { role: 'user', content: task },
        ];

        const startTime = Date.now();

        try {
            const response = await llmClient.chat(this.provider, this.model, messages, options);

            const result = {
                agent: this.name,
                role: this.role,
                task,
                response: response.content,
                model: response.model,
                provider: response.provider,
                usage: response.usage,
                elapsed: response.elapsed,
                timestamp: new Date().toISOString(),
                status: 'completed',
            };

            // Store in history for multi-turn conversations
            this.history.push({ role: 'user', content: task });
            this.history.push({ role: 'assistant', content: response.content });
            this.results.push(result);

            return result;
        } catch (error) {
            const result = {
                agent: this.name,
                role: this.role,
                task,
                error: error.message,
                elapsed: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                status: 'failed',
            };

            this.results.push(result);
            return result;
        }
    }

    /**
     * Reset conversation history (fresh context)
     */
    resetHistory() {
        this.history = [];
    }

    /**
     * Get all results from this agent
     */
    getResults() {
        return this.results;
    }

    /**
     * Get agent info
     */
    getInfo() {
        return {
            name: this.name,
            role: this.role,
            provider: this.provider,
            model: this.model,
            tasksCompleted: this.results.filter(r => r.status === 'completed').length,
            tasksFailed: this.results.filter(r => r.status === 'failed').length,
        };
    }
}
