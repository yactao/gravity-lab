import app from './app';
import dotenv from 'dotenv';
import { startRagWorker } from './workers/ragWorker';
import { startDevWorker } from './workers/devWorker';

dotenv.config();

import { connectRabbitMQ } from './services/broker';

const PORT = process.env.PORT || 4001;

app.listen(PORT, async () => {
    console.log(`[Aïna SaaS Orchestrator] 🚀 Server running on port ${PORT}`);
    await connectRabbitMQ();
    await startRagWorker();
    await startDevWorker();
});
