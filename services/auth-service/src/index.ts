import 'express-async-errors';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { register, login, me } from './controllers/auth.controller.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', me);

// Tratamento de erros centralizado
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[auth-service] Erro não tratado:', err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Erro interno.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`[auth-service] Porta ${PORT}`));
