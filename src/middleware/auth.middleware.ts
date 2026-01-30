// ARQUIVO: src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    export interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Acesso negado. Nenhum token fornecido." });
    return; 
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ message: "Acesso negado. Token inválido ou expirado." });
    return; 
  }
  req.user = payload;
  next();
};