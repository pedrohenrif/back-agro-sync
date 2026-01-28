// ARQUIVO: src/utils/jwt.ts
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "SEGREDO_SUPER_SECRETO_PARA_TESTES";

export interface TokenPayload {
  userId: number;
  organizationId: number;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" }); 
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as (jwt.JwtPayload & TokenPayload);
    return {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
};