import { prisma } from "../../prisma/config/prisma.js";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client"; // Importa o Enum 'Role' do novo schema

/**
 * Registra um novo usuário e sua organização.
 * Usa uma transação para garantir que tudo seja criado com sucesso.
 */
export const registerUserService = async (name: string, email: string, password: string, organizationName: string) => {
  
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // $transaction garante que ou tudo (User, Org, Member) é criado, ou nada é.
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Cria o Usuário
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // 2. Cria a Organização
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      // 3. Cria o Vínculo (Membership) conectando os dois
      // O primeiro usuário é sempre o ADMIN
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
    // Erro P2002 é "Unique constraint failed" (email já existe)
    if (error.code === 'P2002' && error.meta?.target.includes('email')) {
      return { success: false, message: "Este e-mail já está em uso." };
    }
    return { success: false, message: "Erro ao criar conta." };
  }
};

/**
 * Loga um usuário e encontra sua organização principal.
 */
export const loginUserService = async (email: string, password: string) => {
  try {
    // 1. Encontra o usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    // 2. Compara a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    // 3. Encontra o Vínculo (Membership) para obter o ID da Organização e o Cargo
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      // Se o usuário pertencer a várias orgs, pegamos a primeira que ele criou
      orderBy: { organizationId: 'asc' }, 
    });

    if (!membership) {
      // Isso é um estado de erro grave (usuário órfão)
      return { success: false, message: "Usuário não está associado a nenhuma organização." };
    }

    // 4. Retorna os dados necessários para criar o token
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