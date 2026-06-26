import 'express-async-errors';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth.js';
import {
  getTasks, getTasksByGarden, getTodayTasks,
  createTask, updateTask, updateTaskStatus, deleteTask,
} from './controllers/task.controller.js';
import { startConsumers } from './rabbitmq.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'task-service' }));

app.get('/api/tasks',                     authenticate, getTasks);
app.get('/api/tasks/today',               authenticate, getTodayTasks);
app.get('/api/tasks/garden/:gardenId',    authenticate, getTasksByGarden);
app.post('/api/tasks',                    authenticate, createTask);
app.put('/api/tasks/:id',                 authenticate, updateTask);
app.patch('/api/tasks/:id/status',        authenticate, updateTaskStatus);
app.delete('/api/tasks/:id',              authenticate, deleteTask);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[task-service] Erro:', err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Erro interno.' });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, async () => {
  console.log(`[task-service] Porta ${PORT}`);
  // Inicia consumidores RabbitMQ após o servidor subir
  await startConsumers();
});
