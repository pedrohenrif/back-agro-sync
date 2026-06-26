import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'agrosync_jwt_super_secreto_troque_em_prod';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    return;
  }
  try {
    const payload = jwt.verify(authHeader.split(' ')[1], SECRET) as any;
    req.user = { userId: payload.userId, organizationId: payload.organizationId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}
