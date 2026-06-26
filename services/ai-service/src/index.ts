import 'express-async-errors';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

const app = express();
app.use(cors());
app.use(express.json());

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const SECRET = process.env.JWT_SECRET || 'agrosync_jwt_super_secreto_troque_em_prod';

function authenticate(req: Request, res: Response, next: NextFunction): void {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) { res.status(401).json({ message: 'Token não fornecido.' }); return; }
  try {
    const p = jwt.verify(h.split(' ')[1], SECRET) as any;
    req.user = { userId: p.userId, organizationId: p.organizationId, role: p.role };
    next();
  } catch { res.status(401).json({ message: 'Token inválido.' }); }
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ai-service' }));

app.post('/api/ai', authenticate, async (req: Request, res: Response) => {
  const { question } = req.body;
  const { userId } = req.user!;

  if (!question?.trim()) return res.status(400).json({ error: 'Pergunta não pode ser vazia.' });

  const SYSTEM_PROMPT = `Você é o AgroAssist, assistente especializado em agricultura familiar, cultivo de hortaliças e gestão rural sustentável. Responda de forma prática e objetiva, preferindo listas numeradas ou tópicos quando apropriado. Use linguagem acessível mas técnica quando necessário.`;

  try {
    const { data } = await axios.post(
      DEEPSEEK_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        timeout: 30000,
      },
    );

    const answer = data.choices[0].message.content;

    // Persiste o histórico de conversa
    const message = await prisma.aIMessage.create({
      data: { question, answer, userId },
    });

    return res.json({ answer, messageId: message.id });
  } catch (err: any) {
    console.error('[ai-service] Erro na chamada DeepSeek:', err.response?.data || err.message);
    return res.status(502).json({ error: 'Serviço de IA temporariamente indisponível.' });
  }
});

app.get('/api/ai/history', authenticate, async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const messages = await prisma.aIMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(messages);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ai-service] Erro:', err);
  res.status(500).json({ message: 'Erro interno.' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`[ai-service] Porta ${PORT}`));
