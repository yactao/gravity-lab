import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ status: 'ok', time: Date.now() / 1000 });
});

export default router;
