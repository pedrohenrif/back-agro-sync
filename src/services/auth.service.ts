import { prisma } from "../../prisma/config/prisma.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (nome: string, email: string, senha: string) => {
  const hashedPassword = await bcrypt.hash(senha, 10);
  return prisma.usuario.create({
    data: { nome, email, senha: hashedPassword },
  });
};

export const loginUsuario = async (email: string, senha: string) => {
  try {
    // Verifica se o e-mail existe no banco
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    // Comparação direta da senha (sem hash)
    if (senha !== usuario.senha) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    // Gera token JWT para autenticação
    const token = generateToken(usuario.nr_sequencia);

    return { 
      success: true, 
      message: "Login realizado com sucesso!", 
      data: { 
        usuario: {
          id: usuario.nr_sequencia,
          email: usuario.email,
        },
        token 
      } 
    };
  } catch (error) {
    console.error(`Erro ao autenticar usuário (${email}):`, error);
    return { success: false, message: "Erro interno. Tente novamente mais tarde." };
  }
};