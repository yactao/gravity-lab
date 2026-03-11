import { Router } from 'express';
import { enqueueTask } from '../services/broker';

const router = Router();

router.post('/', async (req, res) => {
    const { agent, context } = req.body;

    try {
        const jobId = await enqueueTask(`aina-agent-${agent}`, { context });
        res.status(202).json({ status: 'queued', jobId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to queue task' });
    }
});

export default router;
