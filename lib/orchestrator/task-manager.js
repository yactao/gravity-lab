/**
 * Task Manager — shared task list for orchestrated agents
 */
export default class TaskManager {
    constructor() {
        this.tasks = new Map();
        this.nextId = 1;
    }

    /**
     * Add a task to the list
     */
    addTask({ description, assignedTo = null, dependencies = [], context = '' }) {
        const id = this.nextId++;
        const task = {
            id,
            description,
            assignedTo,
            dependencies,
            context,
            status: 'pending',     // pending | in-progress | completed | failed
            result: null,
            createdAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null,
        };
        this.tasks.set(id, task);
        return task;
    }

    /**
     * Assign a task to an agent
     */
    assignTask(taskId, agentName) {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error(`Task ${taskId} not found`);
        task.assignedTo = agentName;
        task.status = 'in-progress';
        task.startedAt = new Date().toISOString();
        return task;
    }

    /**
     * Mark a task as completed with result
     */
    completeTask(taskId, result) {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error(`Task ${taskId} not found`);
        task.status = 'completed';
        task.result = result;
        task.completedAt = new Date().toISOString();
        return task;
    }

    /**
     * Mark a task as failed
     */
    failTask(taskId, error) {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error(`Task ${taskId} not found`);
        task.status = 'failed';
        task.result = { error };
        task.completedAt = new Date().toISOString();
        return task;
    }

    /**
     * Get all tasks with a given status
     */
    getByStatus(status) {
        return [...this.tasks.values()].filter(t => t.status === status);
    }

    /**
     * Get next available task (pending, no unmet dependencies)
     */
    getNextAvailable() {
        return [...this.tasks.values()].find(t => {
            if (t.status !== 'pending') return false;
            // Check all dependencies are completed
            return t.dependencies.every(depId => {
                const dep = this.tasks.get(depId);
                return dep && dep.status === 'completed';
            });
        });
    }

    /**
     * Get overall status summary
     */
    getStatus() {
        const all = [...this.tasks.values()];
        return {
            total: all.length,
            pending: all.filter(t => t.status === 'pending').length,
            inProgress: all.filter(t => t.status === 'in-progress').length,
            completed: all.filter(t => t.status === 'completed').length,
            failed: all.filter(t => t.status === 'failed').length,
            tasks: all,
        };
    }

    /**
     * Export task list as markdown
     */
    toMarkdown() {
        const lines = ['# Task List\n'];
        for (const task of this.tasks.values()) {
            const icon = {
                'pending': '⬜',
                'in-progress': '🔄',
                'completed': '✅',
                'failed': '❌',
            }[task.status];

            lines.push(`${icon} **Task ${task.id}**: ${task.description}`);
            if (task.assignedTo) lines.push(`   Agent: ${task.assignedTo}`);
            if (task.status === 'completed' && task.result?.response) {
                const preview = task.result.response.substring(0, 100);
                lines.push(`   Result: ${preview}...`);
            }
            if (task.status === 'failed' && task.result?.error) {
                lines.push(`   Error: ${task.result.error}`);
            }
            lines.push('');
        }
        return lines.join('\n');
    }
}
