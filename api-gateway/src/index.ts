import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(cors({ origin: '*' }));

const AUTH    = process.env.AUTH_SERVICE_URL    || 'http://auth-service:3001';
const GARDEN  = process.env.GARDEN_SERVICE_URL  || 'http://garden-service:3002';
const SUPPLY  = process.env.SUPPLY_SERVICE_URL  || 'http://supply-service:3003';
const TASK    = process.env.TASK_SERVICE_URL    || 'http://task-service:3004';
const AI      = process.env.AI_SERVICE_URL      || 'http://ai-service:3005';

const proxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (_path: string, req: any) => req.originalUrl,
    on: {
      error: (err, _req, res: any) => {
        console.error(`[Gateway] Erro ao proxiar para ${target}:`, (err as Error).message);
        res.status(502).json({ error: 'Serviço temporariamente indisponível.' });
      }
    }
  });

// ── Saúde do gateway ──────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// ── Roteamento ────────────────────────────────────────────────
app.use('/api/auth',        proxy(AUTH));
app.use('/api/gardens',     proxy(GARDEN));
app.use('/api/crop-plans',  proxy(GARDEN));
app.use('/api/crop-cycles', proxy(GARDEN));
app.use('/api/harvest',     proxy(GARDEN));
app.use('/api/journals',    proxy(GARDEN));
app.use('/api/dashboard',   proxy(GARDEN));
app.use('/api/search',      proxy(GARDEN));
app.use('/api/supplies',    proxy(SUPPLY));
app.use('/api/usage',       proxy(SUPPLY));
app.use('/api/tasks',       proxy(TASK));
app.use('/api/ai',          proxy(AI));

// ── Fallback ──────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[Gateway] Porta ${PORT}`));
