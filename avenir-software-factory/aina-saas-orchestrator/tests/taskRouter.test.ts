import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('POST /api/tasks', () => {
    it('should accept a task and return a job id (202 Accepted)', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ agent: 'dev', context: 'Create a script' });

        expect(res.status).toBe(202); // 202 = Accepted for processing
        expect(res.body).toHaveProperty('jobId');
        expect(res.body).toHaveProperty('status', 'queued');
    });
});
