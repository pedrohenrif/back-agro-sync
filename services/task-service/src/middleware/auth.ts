import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'agrosync_jwt_super_secreto_troque_em_prod';
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) { res.status(401).json({ message: 'Token não fornecido.' }); return; }
  try {
    const p = jwt.verify(h.split(' ')[1], SECRET) as any;
    req.user = { userId: p.userId, organizationId: p.organizationId, role: p.role };
    next();
  } catch { res.status(401).json({ message: 'Token inválido.' }); }
}
