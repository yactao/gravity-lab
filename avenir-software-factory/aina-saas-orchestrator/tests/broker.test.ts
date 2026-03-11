import { describe, it, expect } from 'vitest';
import { enqueueTask } from '../src/services/broker';

describe('Message Broker', () => {
    it('should successfully add a task to the queue', async () => {
        // Mocker la fonction pour simuler le retour Redis
        const task = { type: 'dev', data: { prompt: 'Hello' } };
        const jobId = await enqueueTask('aina-tasks', task);

        expect(jobId).toBeDefined();
        expect(typeof jobId).toBe('string');
    });
});
