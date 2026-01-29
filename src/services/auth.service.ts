import { prisma } from "../../prisma/config/prisma.js";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client"; 


export const registerUserService = async (name: string, email: string, password: string, organizationName: string) => {
  
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await prisma.$transaction(async (tx) => {
      
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
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
            ]
          },
          supplyCategories: {
            create: [
              { name: 'Sementes', description: 'Grãos, mudas e sementes' },
              { name: 'Fertilizantes', description: 'Adubos e corretores de solo' },
              { name: 'Defensivos', description: 'Inseticidas e herbicidas' },
              { name: 'Ferramentas', description: 'Equipamentos e utensílios' }
            ]
          }
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: Role.ADMIN, 
        },
      });

      return { user, organization, membership };
    });

    return { success: true, data: result };

  } catch (error: any) {
    console.error("Erro na transação de registro:", error);
    if (error.code === 'P2002' && error.meta?.target.includes('email')) {
      return { success: false, message: "Este e-mail já está em uso." };
    }
    return { success: false, message: "Erro ao criar conta." };
  }
};

export const loginUserService = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      orderBy: { organizationId: 'asc' }, 
    });

    if (!membership) {
      return { success: false, message: "Usuário não está associado a nenhuma organização." };
    }

    return {
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        organizationId: membership.organizationId,
        role: membership.role,
      },
    };

  } catch (error) {
    console.error("Erro no login:", error);
    return { success: false, message: "Erro interno no servidor." };
  }
};