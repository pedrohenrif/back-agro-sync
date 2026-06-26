import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { generateToken, verifyToken } from '../jwt.js';
import { Role } from '@prisma/client';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, organizationName } = req.body;

  if (!name || !email || !password || !organizationName) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });
      if (existing) throw Object.assign(new Error('E-mail já cadastrado.'), { code: 'EMAIL_IN_USE' });

      const user = await tx.user.create({
        data: { name, email, password: hashedPassword },
      });

      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          supplyUnits: {
            create: [
              { name: 'Quilograma', symbol: 'kg' },
              { name: 'Litro', symbol: 'L' },
              { name: 'Unidade', symbol: 'un' },
              { name: 'Grama', symbol: 'g' },
            ],
          },
          supplyCategories: {
            create: [
              { name: 'Sementes', description: 'Grãos, mudas e sementes' },
              { name: 'Fertilizantes', description: 'Adubos e corretores de solo' },
              { name: 'Defensivos', description: 'Inseticidas e herbicidas' },
              { name: 'Ferramentas', description: 'Equipamentos e utensílios' },
            ],
          },
        },
      });

      const membership = await tx.membership.create({
        data: { userId: user.id, organizationId: organization.id, role: Role.ADMIN },
      });

      return { user, organization, membership };
    });

    const token = generateToken({
      userId: result.user.id,
      organizationId: result.organization.id,
      role: result.membership.role,
    });

    return res.status(201).json({
      token,
      user: { id: result.user.id, name: result.user.name, email: result.user.email },
      organization: { id: result.organization.id, name: result.organization.name },
    });
  } catch (err: any) {
    if (err.code === 'EMAIL_IN_USE' || err.code === 'P2002') {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }
    console.error('[auth-service] Erro no registro:', err);
    return res.status(500).json({ message: 'Erro interno ao criar conta.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    orderBy: { organizationId: 'asc' },
  });

  if (!membership) {
    return res.status(403).json({ message: 'Usuário não está associado a nenhuma organização.' });
  }

  const token = generateToken({
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role,
  });

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
    organizationId: membership.organizationId,
    role: membership.role,
  });
};

export const me = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const payload = verifyToken(authHeader.split(' ')[1]);
  if (!payload) return res.status(401).json({ message: 'Token inválido ou expirado.' });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

  return res.json({ ...user, organizationId: payload.organizationId, role: payload.role });
};
