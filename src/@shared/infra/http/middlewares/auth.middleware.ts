import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../../utils/jwt.js";
import { AppError } from "../../../errors/AppError.js"; 

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Acesso negado. Nenhum token fornecido.", 401);
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const payload = verifyToken(token);

    if (!payload) {
      throw new AppError("Acesso negado. Token inválido ou expirado.", 401);
    }

    req.user = payload;
    
    return next();
  } catch (error) {
    throw new AppError("Acesso negado. Token inválido.", 401);
  }
};