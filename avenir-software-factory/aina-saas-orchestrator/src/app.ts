import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import taskRouter from './routes/tasks';
import chatRouter from './routes/chat/chat';

import authRouter from './routes/auth/auth';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/chat', chatRouter);
// Le frontend pointe sur /api/rag pour envoyer les msgs doc, et la logique RAG on la place aussi dans notre routeur
app.use('/api', chatRouter);
app.use('/api/auth', authRouter);

export default app;
