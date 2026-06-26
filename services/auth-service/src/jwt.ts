import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'agrosync_jwt_super_secreto_troque_em_prod';

export interface TokenPayload {
  userId: number;
  organizationId: number;
  role: string;
}

export const generateToken = (payload: TokenPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: '1d' });

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload & TokenPayload;
    return { userId: decoded.userId, organizationId: decoded.organizationId, role: decoded.role };
  } catch {
    return null;
  }
};
